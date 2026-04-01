import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchFeed, reactToList } from '../lib/api'
import type { TierList, PaginatedResponse, ReactionType } from '../types/api'

const REACTIONS: { type: ReactionType; label: string; emoji: string }[] = [
  { type: 'like', label: 'Like', emoji: '👍' },
  { type: 'love', label: 'Love', emoji: '❤️' },
  { type: 'laugh', label: 'Laugh', emoji: '😂' },
  { type: 'wow', label: 'Wow', emoji: '😮' },
  { type: 'sad', label: 'Sad', emoji: '😢' },
]

export default function Feed() {
  const [data, setData] = useState<PaginatedResponse<TierList> | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [reactingId, setReactingId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchFeed({ page: String(page) })
      .then((res) => { if (!cancelled) setData(res) })
      .catch(() => { if (!cancelled) setData(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [page])

  const lists = data?.results ?? []

  const handleReact = async (listId: number, reactionType: ReactionType | null) => {
    const list = lists.find((l) => l.id === listId)
    if (!list) return
    setReactingId(listId)
    try {
      const updated = await reactToList(String(listId), reactionType)
      setData((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          results: prev.results.map((l) => (l.id === listId ? updated : l)),
        }
      })
    } finally {
      setReactingId(null)
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-white mb-2">
        New tier lists
      </h1>
      <p className="text-slate-400 text-sm mb-6 max-w-2xl">
        Check out the most recent tier lists submitted by users. Discover templates you might want to try or react to others’ lists.
      </p>
      {loading ? (
        <div className="text-slate-400 py-12 text-center">Loading…</div>
      ) : lists.length === 0 ? (
        <div className="card p-12 text-center text-slate-400">
          No public tier lists yet. Create one from a template and set visibility to Public.
        </div>
      ) : (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lists.map((list) => {
              const thumb = list.template_detail?.thumbnail
              return (
                <li key={list.id}>
                  <div className="rounded-xl overflow-hidden border border-slate-700/50 bg-slate-800/50">
                    <Link
                      to={`/lists/${list.id}`}
                      className="block aspect-[4/3] relative bg-slate-800 overflow-hidden"
                    >
                      {thumb ? (
                        <img
                          src={thumb}
                          alt=""
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 text-2xl font-display font-semibold">
                          {list.title.charAt(0) || '?'}
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                        <span className="font-display font-medium text-white text-sm truncate block">{list.title}</span>
                        <span className="text-slate-300 text-xs">{list.user_email}</span>
                      </div>
                    </Link>
                    <div className="p-2 border-t border-slate-700/50 bg-slate-900/90">
                      <div className="flex items-center gap-1 flex-wrap">
                        {REACTIONS.map(({ type, emoji, label }) => {
                          const count = list.reaction_counts?.[type] ?? 0
                          const isActive = list.my_reaction === type
                          return (
                            <button
                              key={type}
                              type="button"
                              title={label}
                              disabled={reactingId === list.id}
                              onClick={(e) => {
                                e.preventDefault()
                                handleReact(list.id, isActive ? null : type)
                              }}
                              className={`flex items-center gap-0.5 px-2 py-1 rounded text-xs transition-colors ${
                                isActive
                                  ? 'bg-rose-500/30 text-rose-300'
                                  : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                              }`}
                            >
                              <span>{emoji}</span>
                              {count > 0 && <span>{count}</span>}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
          {data && (data.next || data.previous) && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!data.previous}
                className="btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <span className="flex items-center px-4 text-slate-400">Page {page}</span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.next}
                className="btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
