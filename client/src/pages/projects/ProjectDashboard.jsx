import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../api/axios'
import Navbar from '../../components/Navbar'
import toast from 'react-hot-toast'

export default function ProjectDashboard() {
  const { id } = useParams()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get(`/dashboard/${id}`)
      .then(res => setStats(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
  }, [id])

  if (!stats) return <div className="min-h-screen bg-gray-100"><Navbar /><div className="p-6">Loading...</div></div>

  const cards = [
    { label: 'Total Tasks', value: stats.total, color: 'bg-indigo-500' },
    { label: 'To Do', value: stats.todo, color: 'bg-gray-500' },
    { label: 'In Progress', value: stats.inProgress, color: 'bg-yellow-500' },
    { label: 'Done', value: stats.done, color: 'bg-green-500' },
    { label: 'Overdue', value: stats.overdue, color: 'bg-red-500' },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Project Dashboard</h1>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {cards.map(c => (
            <div key={c.label} className={`${c.color} text-white rounded-xl p-4 text-center shadow`}>
              <p className="text-3xl font-bold">{c.value}</p>
              <p className="text-sm mt-1 opacity-90">{c.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="font-semibold text-gray-700 mb-4">Tasks Per User</h2>
          {Object.keys(stats.perUser).length === 0 ? (
            <p className="text-gray-400 text-sm">No assigned tasks yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.perUser).map(([name, count]) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-32">{name}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4">
                    <div className="bg-indigo-500 h-4 rounded-full"
                      style={{ width: `${(count / stats.total) * 100}%` }} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}