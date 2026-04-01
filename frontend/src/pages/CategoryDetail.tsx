import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchCategory, fetchTemplates } from '../lib/api'
import type { Category, Template, PaginatedResponse } from '../types/api'

export default function CategoryDetail() {
  const { id } = useParams<{ id: string }>()
  const [category, setCategory] = useState<Category | null>(null)
  const [data, setData] = useState<PaginatedResponse<Template> | null>(null)
  const [loading, setLoading] = useState(true)
  const [ordering, setOrdering] = useState('newest')
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    fetchCategory(id)
      .then((cat) => { if (!cancelled) setCategory(cat) })
      .catch(() => { if (!cancelled) setCategory(null) })
    return () => { cancelled = true }
  }, [id])

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    fetchTemplates({
      category: id,
      ordering: ordering === 'newest' ? '-created_at' : ordering,
      page: String(page),
    })
      .then((res) => { if (!cancelled) setData(res) })
      .catch(() => { if (!cancelled) setData(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id, ordering, page])

  const templates = data?.results ?? []

  if (!id) return null

  return (
    <div>
      <nav className="text-slate-400 text-sm mb-4">
        <Link to="/categories" className="hover:text-white">All categories</Link>
        {category && (
          <>
            <span className="mx-2">/</span>
            <span className="text-white">{category.name}</span>
          </>
        )}
      </nav>
      {loading ? (
        <div className="text-slate-400 py-12 text-center">Loading…</div>
      ) : !category ? (
        <div className="card p-6 text-rose-400">
          Category not found. <Link to="/categories" className="text-rose-300 hover:underline">Back to categories</Link>
        </div>
      ) : (
        <>
          <h1 className="font-display text-2xl font-semibold text-white mb-2">
            {category.name} tier list templates
          </h1>
          <p className="text-slate-400 text-sm mb-4">
            A collection of tier list templates in {category.name}.
          </p>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <select
              value={ordering}
              onChange={(e) => { setOrdering(e.target.value); setPage(1) }}
              className="input max-w-[180px]"
            >
              <option value="newest">Newest</option>
              <option value="most_popular">Most popular</option>
            </select>
            <Link
              to={`/templates/new?category=${id}`}
              className="btn-primary"
            >
              Create template for this category
            </Link>
          </div>
          {templates.length === 0 ? (
            <div className="card p-12 text-center text-slate-400">
              <p className="mb-4">No templates in this category yet.</p>
              <Link to={`/templates/new?category=${id}`} className="btn-primary inline-flex">
                Create template for this category
              </Link>
            </div>
          ) : (
            <>
              <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {templates.map((t) => (
                  <li key={t.id}>
                    <Link
                      to={`/templates/${t.id}`}
                      className="group block rounded-xl overflow-hidden border border-slate-700/50 bg-slate-800/50 hover:border-slate-600 hover:shadow-lg transition-all"
                    >
                      <div className="aspect-[4/3] relative bg-slate-800 overflow-hidden">
                        {t.thumbnail ? (
                          <img
                            src={t.thumbnail}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500 text-3xl font-display font-semibold">
                            {t.title.charAt(0) || '?'}
                          </div>
                        )}
                        <div className="absolute top-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-white text-xs font-medium">
                          {t.popularity ?? 0} lists
                        </div>
                      </div>
                      <div className="p-3 border-t border-slate-700/50 bg-slate-900/90">
                        <h2 className="font-display font-medium text-white text-sm truncate">{t.title}</h2>
                        {t.category_name && (
                          <p className="text-slate-500 text-xs mt-0.5 truncate">{t.category_name}</p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
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
        </>
      )}
    </div>
  )
}
