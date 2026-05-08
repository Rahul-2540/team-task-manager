import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { LogOut, LayoutDashboard } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center shadow">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
        <LayoutDashboard size={22} />
        <span className="font-bold text-lg">Team Task Manager</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm">👋 {user?.name}</span>
        <button onClick={handleLogout} className="flex items-center gap-1 bg-indigo-700 hover:bg-indigo-800 px-3 py-2 rounded-lg text-sm">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  )
}