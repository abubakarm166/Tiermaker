import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { fetchTemplate, fetchTemplates, fetchList, createList, updateList } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import type { Template, TierList } from '../types/api'
import { ApiError } from '../lib/api'

export default function ListForm() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const presetTemplateId = searchParams.get('template')
  const isEdit = Boolean(id)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [templates, setTemplates] = useState<Template[]>([])
  const [templateId, setTemplateId] = useState(presetTemplateId || '')
  const [template, setTemplate] = useState<Template | null>(null)
  const [title, setTitle] = useState('')
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC')
  const [assignments, setAssignments] = useState<Record<string, number[]>>({})
  const [rowOrder, setRowOrder] = useState<string[]>([])
  const [labelOverrides, setLabelOverrides] = useState<Record<string, string>>({})
  const [customRows, setCustomRows] = useState<{ label: string; color: string }[]>([])
  const [settingsRowDisplayIndex, setSettingsRowDisplayIndex] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetchTemplates({ ordering: '-created_at' })
        if (!cancelled) setTemplates(res.results ?? [])
      } catch {
        if (!cancelled) setTemplates([])
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (presetTemplateId && templates.length) {
      const found = templates.find((t) => String(t.id) === presetTemplateId)
      if (found) setTemplateId(presetTemplateId)
    }
  }, [presetTemplateId, templates])

  // In edit mode, load the list first to get its template id so the template (and then list data) can load
  useEffect(() => {
    if (!id || templateId) return
    let cancelled = false
    fetchList(id)
      .then((list) => {
        if (!cancelled && list.template) setTemplateId(String(list.template))
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [id, templateId])

  useEffect(() => {
    if (!templateId) {
      setTemplate(null)
      setAssignments({})
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    fetchTemplate(templateId)
      .then((t) => {
        if (!cancelled) {
          setTemplate(t)
          const rows = t.tier_rows ?? []
          const initial: Record<string, number[]> = {}
          rows.forEach((r) => { initial[r.label] = [] })
          setAssignments(initial)
          setRowOrder(rows.map((r) => r.label))
          setLabelOverrides({})
          setCustomRows([])
        }
      })
      .catch(() => { if (!cancelled) setTemplate(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [templateId])

  useEffect(() => {
    if (!id || !template) return
    let cancelled = false
    fetchList(id)
      .then((list) => {
        if (cancelled) return
        if (list.template !== template.id) return
        // Only owner or admin can edit; otherwise redirect to view
        if (user && list.user != null && Number(user.id) !== Number(list.user) && user.role !== 'ADMIN') {
          navigate(`/lists/${id}`, { replace: true })
          return
        }
        setTitle(list.title)
        setVisibility(list.visibility)
        setAssignments(list.tier_assignments ?? {})
        const rows = template.tier_rows ?? []
        setRowOrder(list.row_order && list.row_order.length ? list.row_order : rows.map((r: { label: string }) => r.label))
        setLabelOverrides(list.label_overrides ?? {})
        setCustomRows(list.custom_rows ?? [])
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id, template?.id, user?.id, user?.role, navigate])

  const moveItem = (itemId: number, fromLabel: string | null, toLabel: string | null) => {
    setAssignments((prev) => {
      const next = { ...prev }
      if (fromLabel && next[fromLabel]) {
        next[fromLabel] = next[fromLabel].filter((id) => id !== itemId)
      }
      if (toLabel) {
        if (!next[toLabel]) next[toLabel] = []
        next[toLabel] = [...next[toLabel], itemId]
      }
      return next
    })
  }

  const moveRowUp = (displayIndex: number) => {
    if (displayIndex <= 0) return
    setRowOrder((prev) => {
      const next = [...prev]
      ;[next[displayIndex - 1], next[displayIndex]] = [next[displayIndex], next[displayIndex - 1]]
      return next
    })
  }
  const moveRowDown = (displayIndex: number) => {
    if (displayIndex >= rowOrder.length - 1) return
    setRowOrder((prev) => {
      const next = [...prev]
      ;[next[displayIndex], next[displayIndex + 1]] = [next[displayIndex + 1], next[displayIndex]]
      return next
    })
  }

  const getDisplayRows = (): { key: string; label: string; color: string; id?: number; isCustom: boolean }[] => {
    const rows = template?.tier_rows ?? []
    const byLabel = Object.fromEntries(rows.map((r) => [r.label, r]))
    const customByLabel = Object.fromEntries(customRows.map((c) => [c.label, c]))
    return rowOrder
      .map((key) => {
        const templateRow = byLabel[key]
        if (templateRow)
          return { key, label: labelOverrides[key] ?? templateRow.label, color: templateRow.color, id: templateRow.id, isCustom: false }
        const custom = customByLabel[key]
        if (custom)
          return { key: custom.label, label: labelOverrides[custom.label] ?? custom.label, color: custom.color, isCustom: true }
        return null
      })
      .filter((r): r is NonNullable<typeof r> => r != null)
  }

  const addRowAbove = (displayIndex: number) => {
    const rows = template?.tier_rows ?? []
    const allKeys = new Set([...rows.map((r) => r.label), ...customRows.map((c) => c.label)])
    let n = 1
    while (allKeys.has(`New ${n}`)) n++
    const label = `New ${n}`
    setCustomRows((prev) => [...prev, { label, color: '#808080' }])
    setRowOrder((prev) => [...prev.slice(0, displayIndex), label, ...prev.slice(displayIndex)])
    setAssignments((prev) => ({ ...prev, [label]: [] }))
    setSettingsRowDisplayIndex(displayIndex)
  }
  const addRowBelow = (displayIndex: number) => {
    const rows = template?.tier_rows ?? []
    const allKeys = new Set([...rows.map((r) => r.label), ...customRows.map((c) => c.label)])
    let n = 1
    while (allKeys.has(`New ${n}`)) n++
    const label = `New ${n}`
    setCustomRows((prev) => [...prev, { label, color: '#808080' }])
    setRowOrder((prev) => [...prev.slice(0, displayIndex + 1), label, ...prev.slice(displayIndex + 1)])
    setAssignments((prev) => ({ ...prev, [label]: [] }))
    setSettingsRowDisplayIndex(displayIndex + 1)
  }

  const setRowDisplayLabel = (key: string, value: string) => {
    setLabelOverrides((prev) => ({ ...prev, [key]: value }))
  }

  const clearTier = (key: string) => {
    setAssignments((prev) => ({ ...prev, [key]: [] }))
    setSettingsRowDisplayIndex(null)
  }

  const deleteCustomRow = (key: string) => {
    setCustomRows((prev) => prev.filter((c) => c.label !== key))
    setRowOrder((prev) => prev.filter((k) => k !== key))
    setAssignments((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    setSettingsRowDisplayIndex(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!templateId || !template) {
      setError('Select a template')
      return
    }
    setError('')
    setSaving(true)
    try {
      const payload = {
        template: Number(templateId),
        title: title || 'My tier list',
        visibility,
        tier_assignments: assignments,
        row_order: rowOrder,
        label_overrides: labelOverrides,
        custom_rows: customRows,
      }
      if (isEdit && id) {
        const updated = await updateList(id, payload)
        if (updated?.id) navigate(`/lists/${updated.id}`)
      } else {
        const created = await createList(payload)
        if (created?.id) navigate(`/lists/${created.id}`)
        else setError('Created but missing list id – try opening My Lists')
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const rows = template?.tier_rows ?? []
  const items = template?.items ?? []
  const displayRows = getDisplayRows()
  const unassigned = items.filter((item) => !displayRows.some((r) => (assignments[r.key] ?? []).includes(item.id)))

  const DRAG_KEY = 'application/x-tiermaker-item'
  const [dragOverTier, setDragOverTier] = useState<string | null>(null)
  const [dragOverUnassigned, setDragOverUnassigned] = useState(false)

  const handleDragStart = (e: React.DragEvent, itemId: number, fromLabel: string | null) => {
    e.dataTransfer.setData(DRAG_KEY, JSON.stringify({ itemId, fromLabel }))
    e.dataTransfer.effectAllowed = 'move'
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.add('opacity-50', 'cursor-grabbing')
    }
  }
  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove('opacity-50', 'cursor-grabbing')
    }
    setDragOverTier(null)
    setDragOverUnassigned(false)
  }
  const handleDrop = (e: React.DragEvent, toLabel: string | null) => {
    e.preventDefault()
    setDragOverTier(null)
    setDragOverUnassigned(false)
    const raw = e.dataTransfer.getData(DRAG_KEY)
    if (!raw) return
    try {
      const { itemId, fromLabel } = JSON.parse(raw) as { itemId: number; fromLabel: string | null }
      moveItem(itemId, fromLabel, toLabel)
    } catch {
      // ignore
    }
  }
  const handleDragOver = (e: React.DragEvent, tierLabel: string | null) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (tierLabel !== null) setDragOverTier(tierLabel)
    else setDragOverUnassigned(true)
  }
  const handleDragLeave = (e: React.DragEvent, tierLabel: string | null) => {
    e.preventDefault()
    if (tierLabel !== null) setDragOverTier((prev) => (prev === tierLabel ? null : prev))
    else setDragOverUnassigned(false)
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-white mb-6">
        {isEdit ? 'Edit tier list' : 'New tier list'}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm px-4 py-2">
            {error}
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Template</label>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="input"
              required
              disabled={isEdit}
            >
              <option value="">Select template</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="My tier list" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Visibility</label>
          <select value={visibility} onChange={(e) => setVisibility(e.target.value as 'PUBLIC' | 'PRIVATE')} className="input max-w-xs">
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
          </select>
        </div>
        {loading ? (
          <div className="text-slate-400 py-8">Loading template…</div>
        ) : template ? (
          <>
            <p className="text-slate-400 text-sm mb-2">Drag items into tiers or click tier labels. Use ↑/↓ to reorder tiers.</p>
            <div className="card overflow-hidden">
              {displayRows.map((row, displayIndex) => (
                <div
                  key={row.key}
                  onDragOver={(e) => handleDragOver(e, row.key)}
                  onDragLeave={(e) => handleDragLeave(e, row.key)}
                  onDrop={(e) => handleDrop(e, row.key)}
                  className={`flex items-center gap-4 p-4 border-b border-slate-700/50 last:border-0 transition-all min-h-[72px] ${dragOverTier === row.key ? 'ring-2 ring-inset ring-white/50' : ''}`}
                  style={{ backgroundColor: row.color + '15', borderLeft: `4px solid ${row.color}` }}
                >
                  <span className="font-display font-semibold w-12 shrink-0" style={{ color: row.color }}>{row.label}</span>
                  <div className="flex flex-wrap gap-2 min-h-[64px] flex-1">
                    {(assignments[row.key] ?? []).map((itemId) => {
                      const item = items.find((i) => i.id === itemId)
                      if (!item) return null
                      return (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item.id, row.key)}
                          onDragEnd={handleDragEnd}
                          className="w-14 h-14 rounded-lg overflow-hidden bg-slate-800 border border-slate-600 hover:border-rose-500 shrink-0 cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-rose-500"
                          onClick={() => moveItem(item.id, row.key, null)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); moveItem(item.id, row.key, null) } }}
                        >
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover pointer-events-none" draggable={false} />
                          ) : (
                            <span className="flex items-center justify-center h-full text-slate-400 text-xs pointer-events-none">{item.name}</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSettingsRowDisplayIndex(displayIndex)}
                      className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-600"
                      title="Row settings"
                      aria-label="Row settings"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => moveRowUp(displayIndex)}
                      disabled={displayIndex === 0}
                      className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-600 disabled:opacity-40 disabled:pointer-events-none"
                      title="Move tier up"
                      aria-label="Move tier up"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => moveRowDown(displayIndex)}
                      disabled={displayIndex === displayRows.length - 1}
                      className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-600 disabled:opacity-40 disabled:pointer-events-none"
                      title="Move tier down"
                      aria-label="Move tier down"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {settingsRowDisplayIndex !== null && displayRows[settingsRowDisplayIndex] && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setSettingsRowDisplayIndex(null)}>
                <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-slate-200 font-medium">Tier row settings</h3>
                    <button type="button" onClick={() => setSettingsRowDisplayIndex(null)} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-600" aria-label="Close">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  {(() => {
                    const row = displayRows[settingsRowDisplayIndex]
                    const itemCount = (assignments[row.key] ?? []).length
                    return (
                      <>
                        <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-slate-700/50">
                          <span className="font-display font-semibold w-10 h-10 flex items-center justify-center rounded" style={{ backgroundColor: row.color + '30', color: row.color }}>{row.label}</span>
                          <span className="text-slate-400 text-sm">{itemCount} item{itemCount !== 1 ? 's' : ''} in this tier</span>
                        </div>
                        <p className="text-slate-400 text-sm mb-2">Edit label text (shown on list):</p>
                        <input
                          type="text"
                          value={labelOverrides[row.key] ?? row.label}
                          onChange={(e) => setRowDisplayLabel(row.key, e.target.value)}
                          className="input w-full mb-4"
                          placeholder="e.g. Best, Great, Good"
                          maxLength={30}
                        />
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => { moveRowUp(settingsRowDisplayIndex); setSettingsRowDisplayIndex((prev) => (prev != null && prev > 0 ? prev - 1 : null)) }}
                            disabled={settingsRowDisplayIndex === 0}
                            className="btn-secondary disabled:opacity-40 disabled:pointer-events-none"
                          >
                            Move tier up
                          </button>
                          <button
                            type="button"
                            onClick={() => { moveRowDown(settingsRowDisplayIndex); setSettingsRowDisplayIndex((prev) => (prev != null && prev < displayRows.length - 1 ? prev + 1 : null)) }}
                            disabled={settingsRowDisplayIndex === displayRows.length - 1}
                            className="btn-secondary disabled:opacity-40 disabled:pointer-events-none"
                          >
                            Move tier down
                          </button>
                          <button
                            type="button"
                            onClick={() => clearTier(row.key)}
                            className="btn-secondary text-rose-400 hover:bg-rose-500/20"
                          >
                            Clear tier (move all items to Unassigned)
                          </button>
                          <button
                            type="button"
                            onClick={() => addRowAbove(settingsRowDisplayIndex)}
                            className="btn-secondary"
                          >
                            Add a Row Above
                          </button>
                          <button
                            type="button"
                            onClick={() => addRowBelow(settingsRowDisplayIndex)}
                            className="btn-secondary"
                          >
                            Add a Row Below
                          </button>
                          {row.isCustom && (
                            <button
                              type="button"
                              onClick={() => deleteCustomRow(row.key)}
                              className="btn-secondary text-rose-400 hover:bg-rose-500/20"
                            >
                              Delete row
                            </button>
                          )}
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>
            )}
            <div
              className={`mt-4 rounded-xl border-2 border-dashed p-4 transition-colors ${dragOverUnassigned ? 'border-rose-400 bg-rose-500/10' : 'border-slate-600 bg-slate-800/30'}`}
              onDragOver={(e) => handleDragOver(e, null)}
              onDragLeave={(e) => handleDragLeave(e, null)}
              onDrop={(e) => handleDrop(e, null)}
            >
              <h3 className="text-slate-400 text-sm font-medium mb-2">Unassigned — drag items here or click a tier to add</h3>
              <div className="flex flex-wrap gap-3">
                {unassigned.map((item) => (
                  <div key={item.id} className="flex flex-col items-center gap-2">
                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.id, null)}
                      onDragEnd={handleDragEnd}
                      className="w-16 h-16 rounded-lg overflow-hidden bg-slate-800 border border-slate-600 hover:border-slate-500 shrink-0 cursor-grab active:cursor-grabbing"
                      role="button"
                      tabIndex={0}
                    >
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover pointer-events-none" draggable={false} />
                      ) : (
                        <span className="flex items-center justify-center h-full text-slate-400 text-xs px-1 text-center pointer-events-none">{item.name}</span>
                      )}
                    </div>
                    <span className="text-slate-500 text-xs max-w-[80px] truncate text-center">{item.name}</span>
                    <div className="flex gap-1 flex-wrap justify-center">
                      {displayRows.map((r) => (
                        <button
                          key={r.key}
                          type="button"
                          onClick={() => moveItem(item.id, null, r.key)}
                          className="px-2 py-0.5 rounded text-xs font-medium hover:opacity-90"
                          style={{ backgroundColor: r.color + '40', color: r.color }}
                          title={`Add to ${r.label}`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}
        <div className="flex gap-2">
          <button type="submit" className="btn-primary" disabled={saving || !template}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  )
}
