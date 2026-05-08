const router = require('express').Router({ mergeParams: true })
const auth = require('../middleware/auth')
const { createTask, getTasks, updateTask, deleteTask } = require('../controllers/task.controller')

router.post('/', auth, createTask)
router.get('/', auth, getTasks)
router.put('/:taskId', auth, updateTask)
router.delete('/:taskId', auth, deleteTask)

module.exports = router