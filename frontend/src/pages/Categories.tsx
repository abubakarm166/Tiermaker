import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCategories } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import type { Category } from '../types/api'

export default function Categories() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const isAdmin = user?.role === 'ADMIN'

  useEffect(() => {
    let cancelled = false
    fetchCategories()
      .then((res) => {
        const list = 'results' in res ? res.results : res
        if (!cancelled) setCategories(Array.isArray(list) ? list : [])
      })
      .catch(() => { if (!cancelled) setCategories([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-white mb-2">
        TierMaker template categories
      </h1>
      <p className="text-slate-400 text-sm mb-6 max-w-2xl">
        Browse templates by category. Click a category to see all tier list templates in that category.
      </p>
      {isAdmin && (
        <div className="mb-6">
          <Link to="/categories/new" className="btn-primary inline-flex">
            Create new category
          </Link>
        </div>
      )}
      {loading ? (
        <div className="text-slate-400 py-12 text-center">Loading categories…</div>
      ) : categories.length === 0 ? (
        <div className="card p-12 text-center text-slate-400">
          No categories yet. Assign categories when creating or editing templates.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                to={`/categories/${cat.id}`}
                className="group block rounded-xl overflow-hidden border border-slate-700/50 bg-slate-800/50 hover:border-slate-600 hover:shadow-lg transition-all"
              >
                <div className="aspect-square relative bg-slate-800 overflow-hidden">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-4xl font-display font-semibold">
                      {cat.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="p-3 text-center border-t border-slate-700/50 bg-slate-900/80">
                  <span className="font-display font-medium text-white text-sm">{cat.name}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
