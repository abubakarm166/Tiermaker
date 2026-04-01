import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { fetchList, deleteList, exportListPng, reactToList } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import type { TierList, ReactionType } from '../types/api'
import { ApiError } from '../lib/api'

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'like', emoji: '👍', label: 'Like' },
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'laugh', emoji: '😂', label: 'Laugh' },
  { type: 'wow', emoji: '😮', label: 'Wow' },
  { type: 'sad', emoji: '😢', label: 'Sad' },
]

export default function ListDetail() {
  const { id } = useParams<{ id: string }>()
  const [list, setList] = useState<TierList | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [reacting, setReacting] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!id || id === 'undefined') {
      navigate('/lists', { replace: true })
      return
    }
    let cancelled = false
    fetchList(id)
      .then((l) => { if (!cancelled) setList(l) })
      .catch(() => { if (!cancelled) setError('Failed to load list') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  const canEdit = Boolean(list?.can_edit)

  const handleDelete = async () => {
    if (!id || !list || !window.confirm('Delete this tier list?')) return
    setDeleting(true)
    try {
      await deleteList(id)
      navigate('/lists')
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  const handleReact = async (reactionType: ReactionType | null) => {
    if (!id || !list) return
    setReacting(true)
    try {
      const updated = await reactToList(id, reactionType)
      // Only update reaction data so we keep template_detail.tier_rows and items (react API returns list without them)
      setList((prev) => (prev ? { ...prev, reaction_counts: updated.reaction_counts ?? prev.reaction_counts, my_reaction: updated.my_reaction } : updated))
    } finally {
      setReacting(false)
    }
  }

  const handleExport = async () => {
    if (!id) return
    setExporting(true)
    try {
      const blob = await exportListPng(id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tierlist-${id}.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('Export failed')
    } finally {
      setExporting(false)
    }
  }

  if (loading) return <div className="text-slate-400 py-8">Loading…</div>
  if (error || !list) {
    return (
      <div className="card p-6 text-rose-400">
        {error || 'List not found'}
        <Link to="/lists" className="block mt-2 text-rose-300 hover:underline">Back to my lists</Link>
      </div>
    )
  }

  const template = list.template_detail
  const rawRows = template?.tier_rows ?? []
  const rowOrder = list.row_order ?? rawRows.map((r: { label: string }) => r.label)
  const labelOverrides = list.label_overrides ?? {}
  const customRows = list.custom_rows ?? []
  const rows: { key: string; label: string; color: string }[] = (() => {
    const byLabel = Object.fromEntries(rawRows.map((r: { label: string; color: string }) => [r.label, r]))
    const customByLabel = Object.fromEntries(customRows.map((c: { label: string; color: string }) => [c.label, c]))
    const out: { key: string; label: string; color: string }[] = []
    for (const key of rowOrder) {
      const templateRow = byLabel[key]
      if (templateRow)
        out.push({ key, label: labelOverrides[key] ?? templateRow.label, color: templateRow.color })
      else {
        const custom = customByLabel[key]
        if (custom) out.push({ key: custom.label, label: labelOverrides[custom.label] ?? custom.label, color: custom.color })
      }
    }
    return out
  })()
  const items = template?.items ?? []
  const assignments = list.tier_assignments ?? {}

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">{list.title}</h1>
          {template && (
            <Link to={`/templates/${template.id}`} className="text-slate-400 hover:text-white text-sm mt-1 inline-block">
              Template: {template.title}
            </Link>
          )}
        </div>
        {list.visibility === 'PUBLIC' && (
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="text-slate-400 text-sm">React:</span>
            {REACTIONS.map(({ type, emoji, label }) => {
              const count = list.reaction_counts?.[type] ?? 0
              const isActive = list.my_reaction === type
              return (
                <button
                  key={type}
                  type="button"
                  title={label}
                  disabled={reacting}
                  onClick={() => handleReact(isActive ? null : type)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${isActive ? 'bg-rose-500/30 text-rose-300' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                >
                  {emoji}
                  {count > 0 && <span>{count}</span>}
                </button>
              )
            })}
          </div>
        )}
        <div className="flex gap-2 flex-wrap">
          <button type="button" onClick={handleExport} className="btn-primary" disabled={exporting}>
            {exporting ? 'Exporting…' : 'Export PNG'}
          </button>
          {canEdit ? (
            <>
              <Link to={`/lists/${id}/edit`} className="btn-secondary">Edit</Link>
              <button type="button" onClick={handleDelete} className="btn-secondary text-rose-400 hover:bg-rose-500/10" disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </>
          ) : template ? (
            <Link to={`/lists/new?template=${template.id}`} className="btn-secondary">
              Create this tier list
            </Link>
          ) : null}
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="divide-y divide-slate-700/50">
          {rows.map((row) => (
            <div
              key={row.key}
              className="flex items-center gap-4 p-4"
              style={{ backgroundColor: row.color + '20', borderLeft: `4px solid ${row.color}` }}
            >
              <span className="font-display font-semibold text-lg w-12 shrink-0" style={{ color: row.color }}>
                {row.label}
              </span>
              <div className="flex flex-wrap gap-2 min-h-[60px]">
                {(assignments[row.key] ?? []).map((itemId) => {
                  const item = items.find((i) => i.id === itemId)
                  return item ? (
                    <div key={item.id} className="w-14 h-14 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="flex items-center justify-center h-full text-slate-500 text-xs px-1 text-center">{item.name}</span>
                      )}
                    </div>
                  ) : null
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      {!canEdit && template && (
        <div className="mt-8 text-center">
          <Link
            to={`/lists/new?template=${template.id}`}
            className="btn-primary inline-flex px-6 py-3"
          >
            Create this tier list
          </Link>
          <p className="text-slate-500 text-sm mt-2">Make your own ranking using the same template.</p>
        </div>
      )}
    </div>
  )
}
