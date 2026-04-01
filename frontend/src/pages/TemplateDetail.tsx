import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { fetchTemplate, deleteTemplate } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import type { Template } from '../types/api'
import { ApiError } from '../lib/api'

export default function TemplateDetail() {
  const { id } = useParams<{ id: string }>()
  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!id) return
    let cancelled = false
    fetchTemplate(id)
      .then((t) => { if (!cancelled) setTemplate(t) })
      .catch(() => { if (!cancelled) setError('Failed to load template') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  const canEdit = user && template && (user.id === template.created_by || user.role === 'ADMIN')

  const handleDelete = async () => {
    if (!id || !template || !window.confirm('Delete this template?')) return
    setDeleting(true)
    try {
      await deleteTemplate(id)
      navigate('/')
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <div className="text-slate-400 py-8">Loading…</div>
  if (error || !template) {
    return (
      <div className="card p-6 text-rose-400">
        {error || 'Template not found'}
        <Link to="/" className="block mt-2 text-rose-300 hover:underline">Back to templates</Link>
      </div>
    )
  }

  const rows = template.tier_rows ?? []
  const items = template.items ?? []

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">{template.title}</h1>
          <p className="text-slate-400 mt-1">{template.created_by_email}</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/lists/new?template=${template.id}`} className="btn-primary">
            Create tier list from this
          </Link>
          {canEdit && (
            <>
              <Link to={`/templates/${id}/edit`} className="btn-secondary">Edit</Link>
              <button type="button" onClick={handleDelete} className="btn-secondary text-rose-400 hover:bg-rose-500/10" disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </>
          )}
        </div>
      </div>
      {template.description && (
        <p className="text-slate-300 mb-6">{template.description}</p>
      )}
      <div className="card overflow-hidden">
        <div className="divide-y divide-slate-700/50">
          {rows.map((row) => (
            <div
              key={row.id}
              className="flex items-center gap-4 p-4"
              style={{ backgroundColor: row.color + '20', borderLeft: `4px solid ${row.color}` }}
            >
              <span className="font-display font-semibold text-lg w-12 shrink-0" style={{ color: row.color }}>
                {row.label}
              </span>
              <div className="flex flex-wrap gap-2 min-h-[60px] text-slate-500 text-sm">
                (Drag items here when creating a tier list)
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-slate-700/50">
          <h3 className="text-sm font-medium text-slate-400 mb-2">Items</h3>
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <div key={item.id} className="w-16 h-16 rounded-lg overflow-hidden bg-slate-800 border border-slate-700">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="flex items-center justify-center h-full text-slate-500 text-xs px-1 text-center">{item.name}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
