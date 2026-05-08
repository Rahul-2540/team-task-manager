const prisma = require('../utils/prisma')

exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, assignedToId } = req.body
    if (!title) return res.status(400).json({ message: 'Title required' })

    const member = await prisma.projectMember.findFirst({
      where: { projectId: req.params.projectId, userId: req.user.id, role: 'ADMIN' }
    })
    if (!member) return res.status(403).json({ message: 'Only admins can create tasks' })

    const task = await prisma.task.create({
      data: {
        title, description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'MEDIUM',
        projectId: req.params.projectId,
        createdById: req.user.id,
        assignedToId: assignedToId || null
      },
      include: { assignedTo: { select: { id: true, name: true, email: true } }, createdBy: { select: { id: true, name: true } } }
    })
    res.status(201).json(task)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

exports.getTasks = async (req, res) => {
  try {
    const member = await prisma.projectMember.findFirst({
      where: { projectId: req.params.projectId, userId: req.user.id }
    })
    if (!member) return res.status(403).json({ message: 'Not a member' })

    const where = { projectId: req.params.projectId }
    if (member.role === 'MEMBER') where.assignedToId = req.user.id

    const tasks = await prisma.task.findMany({
      where,
      include: { assignedTo: { select: { id: true, name: true, email: true } }, createdBy: { select: { id: true, name: true } } }
    })
    res.json(tasks)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

exports.updateTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, status, assignedToId } = req.body
    const task = await prisma.task.findUnique({ where: { id: req.params.taskId } })
    if (!task) return res.status(404).json({ message: 'Task not found' })

    const member = await prisma.projectMember.findFirst({
      where: { projectId: task.projectId, userId: req.user.id }
    })
    if (!member) return res.status(403).json({ message: 'Not a member' })

    if (member.role === 'MEMBER' && task.assignedToId !== req.user.id)
      return res.status(403).json({ message: 'Can only update your own tasks' })

    const updated = await prisma.task.update({
      where: { id: req.params.taskId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(priority && { priority }),
        ...(status && { status }),
        ...(member.role === 'ADMIN' && assignedToId !== undefined && { assignedToId })
      },
      include: { assignedTo: { select: { id: true, name: true, email: true } } }
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

exports.deleteTask = async (req, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.taskId } })
    if (!task) return res.status(404).json({ message: 'Task not found' })

    const member = await prisma.projectMember.findFirst({
      where: { projectId: task.projectId, userId: req.user.id, role: 'ADMIN' }
    })
    if (!member) return res.status(403).json({ message: 'Only admins can delete tasks' })

    await prisma.task.delete({ where: { id: req.params.taskId } })
    res.json({ message: 'Task deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}