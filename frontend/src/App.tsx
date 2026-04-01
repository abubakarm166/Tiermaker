import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Categories from './pages/Categories'
import CategoryDetail from './pages/CategoryDetail'
import CategoryForm from './pages/CategoryForm'
import TemplateDetail from './pages/TemplateDetail'
import TemplateForm from './pages/TemplateForm'
import ListDetail from './pages/ListDetail'
import ListForm from './pages/ListForm'
import MyLists from './pages/MyLists'
import Feed from './pages/Feed'
import MemeEditor from './pages/MemeEditor'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-400 font-body">Loading…</div>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="templates" element={<Home />} />
        <Route path="categories" element={<Categories />} />
        <Route path="categories/new" element={<CategoryForm />} />
        <Route path="categories/:id" element={<CategoryDetail />} />
        <Route path="templates/new" element={<TemplateForm />} />
        <Route path="templates/:id" element={<TemplateDetail />} />
        <Route path="templates/:id/edit" element={<TemplateForm />} />
        <Route path="lists" element={<MyLists />} />
        <Route path="lists/feed" element={<Feed />} />
        <Route path="lists/new" element={<ListForm />} />
        <Route path="lists/:id" element={<ListDetail />} />
        <Route path="lists/:id/edit" element={<ListForm />} />
        <Route path="meme-editor" element={<MemeEditor />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
