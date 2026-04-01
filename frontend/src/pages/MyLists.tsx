import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchMyLists } from '../lib/api'
import type { TierList } from '../types/api'

export default function MyLists() {
  const [lists, setLists] = useState<TierList[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchMyLists()
      .then((data) => { if (!cancelled) setLists(data) })
      .catch(() => { if (!cancelled) setLists([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="font-display text-2xl font-semibold text-white">My tier lists</h1>
        <Link to="/lists/new" className="btn-primary">New tier list</Link>
      </div>
      {loading ? (
        <div className="text-slate-400 py-12 text-center">Loading…</div>
      ) : lists.length === 0 ? (
        <div className="card p-12 text-center text-slate-400">
          You have no tier lists. <Link to="/lists/new" className="text-rose-400 hover:underline">Create one</Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <li key={list.id}>
              <Link to={`/lists/${list.id}`} className="card block p-5 hover:border-slate-600 transition-colors">
                <h2 className="font-display font-medium text-white truncate">{list.title}</h2>
                <p className="text-slate-400 text-sm mt-1">
                  {list.template_detail?.title ?? `Template #${list.template}`}
                </p>
                <p className="text-slate-500 text-xs mt-2">{list.visibility}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
