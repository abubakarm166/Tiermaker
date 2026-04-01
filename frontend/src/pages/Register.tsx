import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ApiError } from '../lib/api'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      const msg = err instanceof ApiError && typeof err.body === 'object' && err.body !== null && 'email' in (err.body as object)
        ? (err.body as { email?: string[] }).email?.[0] ?? err.message
        : err instanceof ApiError ? err.message : 'Registration failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950">
      <div className="card w-full max-w-sm p-8">
        <h1 className="font-display text-2xl font-semibold text-white mb-6">Create account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm px-4 py-2">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-400 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-400 mb-1">Password (min 8)</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              minLength={8}
              required
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
            {loading ? 'Creating…' : 'Sign up'}
          </button>
        </form>
        <p className="mt-6 text-center text-slate-500 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-rose-400 hover:text-rose-300">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
