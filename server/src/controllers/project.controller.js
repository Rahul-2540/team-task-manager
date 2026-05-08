const prisma = require('../utils/prisma')

exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body
    if (!name) return res.status(400).json({ message: 'Project name required' })

    const project = await prisma.project.create({
      data: {
        name,
        description,
        members: {
          create: { userId: req.user.id, role: 'ADMIN' }
        }
      },
      include: { members: { include: { user: { select: { id: true, name: true, email: true } } } } }
    })
    res.status(201).json(project)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

exports.getProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { members: { some: { userId: req.user.id } } },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        tasks: true
      }
    })
    res.json(projects)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

exports.getProject = async (req, res) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, members: { some: { userId: req.user.id } } },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        tasks: { include: { assignedTo: { select: { id: true, name: true, email: true } } } }
      }
    })
    if (!project) return res.status(404).json({ message: 'Project not found' })
    res.json(project)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

exports.addMember = async (req, res) => {
  try {
    const { email, role } = req.body
    const member = await prisma.projectMember.findFirst({
      where: { projectId: req.params.id, userId: req.user.id, role: 'ADMIN' }
    })
    if (!member) return res.status(403).json({ message: 'Only admins can add members' })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(404).json({ message: 'User not found' })

    const existing = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: user.id, projectId: req.params.id } }
    })
    if (existing) return res.status(400).json({ message: 'User already a member' })

    const newMember = await prisma.projectMember.create({
      data: { userId: user.id, projectId: req.params.id, role: role || 'MEMBER' },
      include: { user: { select: { id: true, name: true, email: true } } }
    })
    res.status(201).json(newMember)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

exports.removeMember = async (req, res) => {
  try {
    const admin = await prisma.projectMember.findFirst({
      where: { projectId: req.params.id, userId: req.user.id, role: 'ADMIN' }
    })
    if (!admin) return res.status(403).json({ message: 'Only admins can remove members' })

    await prisma.projectMember.delete({
      where: { userId_projectId: { userId: req.params.memberId, projectId: req.params.id } }
    })
    res.json({ message: 'Member removed' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}