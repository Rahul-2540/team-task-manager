import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import Navbar from '../../components/Navbar'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { Plus, Trash2, UserPlus, BarChart2 } from 'lucide-react'

export default function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', dueDate: '', priority: 'MEDIUM', assignedToId: '' })
  const [memberEmail, setMemberEmail] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchProject(); fetchTasks() }, [id])

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`)
      setProject(res.data)
      const me = res.data.members.find(m => m.user.id === user.id)
      setIsAdmin(me?.role === 'ADMIN')
    } catch { toast.error('Failed to load project') }
  }

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/projects/${id}/tasks`)
      setTasks(res.data)
    } catch { toast.error('Failed to load tasks') }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post(`/projects/${id}/tasks`, taskForm)
      toast.success('Task created!')
      setShowTaskModal(false)
      setTaskForm({ title: '', description: '', dueDate: '', priority: 'MEDIUM', assignedToId: '' })
      fetchTasks()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setLoading(false) }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail })
      toast.success('Member added!')
      setShowMemberModal(false)
      setMemberEmail('')
      fetchProject()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setLoading(false) }
  }

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Remove this member?')) return
    try {
      await api.delete(`/projects/${id}/members/${memberId}`)
      toast.success('Member removed')
      fetchProject()
    } catch { toast.error('Failed to remove member') }
  }

  const handleUpdateStatus = async (taskId, status) => {
    try {
      await api.put(`/projects/${id}/tasks/${taskId}`, { status })
      fetchTasks()
    } catch { toast.error('Failed to update') }
  }

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return
    try {
      await api.delete(`/projects/${id}/tasks/${taskId}`)
      toast.success('Task deleted')
      fetchTasks()
    } catch { toast.error('Failed to delete') }
  }

  const statusColor = { TODO: 'bg-gray-100 text-gray-600', IN_PROGRESS: 'bg-yellow-100 text-yellow-700', DONE: 'bg-green-100 text-green-700' }
  const priorityColor = { LOW: 'text-blue-500', MEDIUM: 'text-yellow-500', HIGH: 'text-red-500' }

  if (!project) return <div className="min-h-screen bg-gray-100"><Navbar /><div className="p-6">Loading...</div></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
            <p className="text-gray-500 text-sm mt-1">{project.description}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate(`/projects/${id}/dashboard`)}
              className="flex items-center gap-1 bg-gray-700 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-800">
              <BarChart2 size={16} /> Dashboard
            </button>
            {isAdmin && <>
              <button onClick={() => setShowMemberModal(true)}
                className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700">
                <UserPlus size={16} /> Add Member
              </button>
              <button onClick={() => setShowTaskModal(true)}
                className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-indigo-700">
                <Plus size={16} /> Add Task
              </button>
            </>}
          </div>
        </div>

        {/* Members */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow">
          <h2 className="font-semibold text-gray-700 mb-3">Members</h2>
          <div className="flex flex-wrap gap-2">
            {project.members.map(m => (
              <div key={m.id} className="flex items-center gap-2 bg-gray-50 border rounded-lg px-3 py-1 text-sm">
                <span>{m.user.name}</span>
                <span className={`text-xs font-medium ${m.role === 'ADMIN' ? 'text-indigo-600' : 'text-gray-400'}`}>{m.role}</span>
                {isAdmin && m.user.id !== user.id && (
                  <button onClick={() => handleRemoveMember(m.user.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['TODO', 'IN_PROGRESS', 'DONE'].map(status => (
            <div key={status} className="bg-white rounded-xl p-4 shadow">
              <h2 className="font-semibold text-gray-700 mb-3">
                {status === 'TODO' ? '📋 To Do' : status === 'IN_PROGRESS' ? '⚡ In Progress' : '✅ Done'}
              </h2>
              <div className="space-y-3">
                {tasks.filter(t => t.status === status).map(task => (
                  <div key={task.id} className="border rounded-lg p-3 hover:shadow-sm">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-sm text-gray-800">{task.title}</h3>
                      {isAdmin && (
                        <button onClick={() => handleDeleteTask(task.id)} className="text-red-400 hover:text-red-600">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                    {task.description && <p className="text-xs text-gray-400 mt-1">{task.description}</p>}
                    <div className="mt-2 flex flex-wrap gap-1 items-center">
                      <span className={`text-xs font-medium ${priorityColor[task.priority]}`}>{task.priority}</span>
                      {task.dueDate && <span className="text-xs text-gray-400">📅 {new Date(task.dueDate).toLocaleDateString()}</span>}
                      {task.assignedTo && <span className="text-xs text-gray-400">👤 {task.assignedTo.name}</span>}
                    </div>
                    <select value={task.status} onChange={e => handleUpdateStatus(task.id, e.target.value)}
                      className={`mt-2 text-xs px-2 py-1 rounded-full border-0 font-medium ${statusColor[task.status]}`}>
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                  </div>
                ))}
                {tasks.filter(t => t.status === status).length === 0 && (
                  <p className="text-xs text-gray-300 text-center py-3">No tasks</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Create Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <input type="text" placeholder="Task Title"
                className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required />
              <textarea placeholder="Description (optional)"
                className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} rows={2} />
              <input type="date"
                className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
              <select className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
              </select>
              <select className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={taskForm.assignedToId} onChange={e => setTaskForm({ ...taskForm, assignedToId: e.target.value })}>
                <option value="">Unassigned</option>
                {project.members.map(m => (
                  <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                ))}
              </select>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 rounded-lg border hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Add Member</h2>
            <form onSubmit={handleAddMember} className="space-y-3">
              <input type="email" placeholder="Member's Email"
                className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={memberEmail} onChange={e => setMemberEmail(e.target.value)} required />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowMemberModal(false)}
                  className="px-4 py-2 rounded-lg border hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                  {loading ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}