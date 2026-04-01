import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCategory } from '../lib/api'
import { ApiError } from '../lib/api'
import ImageUpload from '../components/ImageUpload'

function toImagePath(url: string | null): string | null {
  if (!url) return null
  const m = url.match(/\/media\/(.+)$/)
  return m ? m[1] : url
}

export default function CategoryForm() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [image, setImage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Category name is required')
      return
    }
    setSaving(true)
    try {
      const created = await createCategory({
        name: trimmed,
        image: toImagePath(image),
      })
      navigate(`/categories/${created.id}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create category')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-white mb-6">Create new category</h1>
      <form onSubmit={handleSubmit} className="card p-6 max-w-md space-y-4">
        {error && (
          <p className="text-rose-400 text-sm">{error}</p>
        )}
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input w-full"
            placeholder="e.g. Anime, Games"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-1">Image (optional)</label>
          <ImageUpload value={image} onChange={setImage} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Creating…' : 'Create category'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/categories')}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
