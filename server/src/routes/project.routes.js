const router = require('express').Router()
const auth = require('../middleware/auth')
const { createProject, getProjects, getProject, addMember, removeMember } = require('../controllers/project.controller')

router.post('/', auth, createProject)
router.get('/', auth, getProjects)
router.get('/:id', auth, getProject)
router.post('/:id/members', auth, addMember)
router.delete('/:id/members/:memberId', auth, removeMember)

module.exports = router