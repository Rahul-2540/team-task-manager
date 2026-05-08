import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import Navbar from '../../components/Navbar'
import toast from 'react-hot-toast'
import { Plus, FolderOpen } from 'lucide-react'

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects')
      setProjects(res.data)
    } catch {
      toast.error('Failed to load projects')
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/projects', form)
      toast.success('Project created!')
      setShowModal(false)
      setForm({ name: '', description: '' })
      fetchProjects()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Projects</h1>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
            <Plus size={18} /> New Project
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <FolderOpen size={48} className="mx-auto mb-3" />
            <p>No projects yet. Create your first project!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(p => (
              <div key={p.id} onClick={() => navigate(`/projects/${p.id}`)}
                className="bg-white p-5 rounded-xl shadow hover:shadow-md cursor-pointer border border-gray-100 hover:border-indigo-300 transition">
                <h2 className="text-lg font-semibold text-gray-800">{p.name}</h2>
                <p className="text-sm text-gray-500 mt-1">{p.description || 'No description'}</p>
                <div className="mt-3 flex justify-between text-xs text-gray-400">
                  <span>{p.members?.length} member(s)</span>
                  <span>{p.tasks?.length} task(s)</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input type="text" placeholder="Project Name"
                className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <textarea placeholder="Description (optional)"
                className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowModal(false)}
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
    </div>
  )
}