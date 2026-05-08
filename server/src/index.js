const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api/projects', require('./routes/project.routes'))
app.use('/api/projects/:projectId/tasks', require('./routes/task.routes'))
app.use('/api/dashboard', require('./routes/dashboard.routes'))

app.get('/', (req, res) => res.json({ message: 'Team Task Manager API running' }))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))