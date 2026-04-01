import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="font-display text-xl font-semibold text-white">
            TierMaker
          </Link>
          <nav className="flex items-center gap-1">
            <Link to="/" className="btn-ghost rounded-lg">Templates</Link>
            <Link to="/categories" className="btn-ghost rounded-lg">Categories</Link>
            <Link to="/lists/feed" className="btn-ghost rounded-lg">New Tier Lists</Link>
            <Link to="/lists" className="btn-ghost rounded-lg">My Lists</Link>
            <Link to="/lists/new" className="btn-ghost rounded-lg">New List</Link>
            <Link to="/meme-editor" className="btn-ghost rounded-lg">Meme Editor</Link>
            <span className="ml-2 text-slate-500 text-sm">{user?.email}</span>
            <button type="button" onClick={handleLogout} className="btn-ghost rounded-lg text-slate-400 hover:text-rose-400">
              Log out
            </button>
          </nav>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
