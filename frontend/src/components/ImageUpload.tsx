import { useRef, useState } from 'react'
import { uploadImage } from '../lib/api'
import { ApiError } from '../lib/api'

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']

interface ImageUploadProps {
  value: string | null
  onChange: (url: string | null) => void
  className?: string
}

export default function ImageUpload({ value, onChange, className = '' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError('')
    if (!ALLOWED.includes(file.type)) {
      setError('Use JPG, PNG or WebP')
      return
    }
    if (file.size > MAX_SIZE) {
      setError('Max 5MB')
      return
    }
    setUploading(true)
    try {
      const res = await uploadImage(file)
      const url = res.file.startsWith('http') ? res.file : res.file
      onChange(url)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleFile}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="btn-secondary text-sm"
        >
          {uploading ? 'Uploading…' : 'Upload image'}
        </button>
        {value && (
          <button type="button" onClick={() => onChange(null)} className="btn-ghost text-slate-400 text-sm">
            Clear
          </button>
        )}
      </div>
      {value && (
        <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden bg-slate-800 border border-slate-700">
          <img src={value} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      {error && <p className="text-rose-400 text-sm mt-1">{error}</p>}
    </div>
  )
}
