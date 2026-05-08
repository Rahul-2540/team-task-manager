const prisma = require('../utils/prisma')

exports.getDashboard = async (req, res) => {
  try {
    const { projectId } = req.params
    const member = await prisma.projectMember.findFirst({
      where: { projectId, userId: req.user.id }
    })
    if (!member) return res.status(403).json({ message: 'Not a member' })

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: { assignedTo: { select: { id: true, name: true } } }
    })

    const now = new Date()
    const total = tasks.length
    const todo = tasks.filter(t => t.status === 'TODO').length
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length
    const done = tasks.filter(t => t.status === 'DONE').length
    const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE').length

    const perUser = {}
    tasks.forEach(t => {
      if (t.assignedTo) {
        const name = t.assignedTo.name
        perUser[name] = (perUser[name] || 0) + 1
      }
    })

    res.json({ total, todo, inProgress, done, overdue, perUser })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}