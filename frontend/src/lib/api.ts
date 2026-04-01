const BASE = '/api'

function getAccessToken(): string | null {
  return localStorage.getItem('access')
}

function getRefreshToken(): string | null {
  return localStorage.getItem('refresh')
}

function setTokens(access: string, refresh: string) {
  localStorage.setItem('access', access)
  localStorage.setItem('refresh', refresh)
}

function clearTokens() {
  localStorage.removeItem('access')
  localStorage.removeItem('refresh')
}

export const authStorage = { getAccessToken, getRefreshToken, setTokens, clearTokens }

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken()
  if (!refresh) return null
  const res = await fetch(`${BASE}/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  })
  if (!res.ok) return null
  const data = await res.json()
  setTokens(data.access, refresh)
  return data.access
}

/** Ensure path has trailing slash so Django APPEND_SLASH is satisfied (POST redirect would drop body). */
function pathWithSlash(path: string): string {
  if (path.startsWith('http')) return path
  const [base, qs] = path.split('?')
  const slash = base.endsWith('/') ? base : `${base}/`
  return qs ? `${slash}?${qs}` : slash
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = path.startsWith('http') ? path : `${BASE}${pathWithSlash(path)}`
  let token = getAccessToken()

  const doRequest = (access: string | null) => {
    const headers: HeadersInit = {
      ...(options.headers as Record<string, string>),
    }
    if (access) headers['Authorization'] = `Bearer ${access}`
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'
    }
    return fetch(url, { ...options, headers })
  }

  let res = await doRequest(token)
  if (res.status === 401 && token) {
    const newAccess = await refreshAccessToken()
    if (newAccess) {
      res = await doRequest(newAccess)
    }
  }

  if (!res.ok) {
    const text = await res.text()
    let errBody: unknown = text
    try {
      errBody = JSON.parse(text)
    } catch {
      // ignore
    }
    throw new ApiError(res.status, errBody)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown
  ) {
    super(typeof body === 'object' && body !== null && 'detail' in body
      ? String((body as { detail: unknown }).detail)
      : `Request failed with status ${status}`)
    this.name = 'ApiError'
  }
}

// Auth
export function login(email: string, password: string) {
  return api<{ access: string; refresh: string; user: import('../types/api').User }>(`/auth/login/`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function register(email: string, password: string) {
  return api<import('../types/api').RegisterResponse>(`/auth/register/`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function fetchMe() {
  return api<import('../types/api').User>('/auth/me/')
}

// Categories
export function fetchCategories() {
  return api<import('../types/api').PaginatedResponse<import('../types/api').Category>>('/categories/')
}

export function fetchCategory(id: string) {
  return api<import('../types/api').Category>(`/categories/${id}/`)
}

export function createCategory(data: { name: string; image?: string | null }) {
  return api<import('../types/api').Category>('/categories/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Templates
export function fetchTemplates(params: Record<string, string> = {}) {
  const q = new URLSearchParams(params).toString()
  return api<import('../types/api').PaginatedResponse<import('../types/api').Template>>(
    `/templates/${q ? '?' + q : ''}`
  )
}

export function fetchTemplate(id: string) {
  return api<import('../types/api').Template>(`/templates/${id}/`)
}

export function createTemplate(data: Record<string, unknown>) {
  return api<import('../types/api').Template>('/templates/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateTemplate(id: string, data: Record<string, unknown>) {
  return api<import('../types/api').Template>(`/templates/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteTemplate(id: string) {
  return api<undefined>(`/templates/${id}/`, { method: 'DELETE' })
}

// Lists
export function fetchLists(params: Record<string, string> = {}) {
  const q = new URLSearchParams(params).toString()
  return api<import('../types/api').PaginatedResponse<import('../types/api').TierList>>(
    `/lists/${q ? '?' + q : ''}`
  )
}

export function fetchList(id: string) {
  return api<import('../types/api').TierList>(`/lists/${id}/`)
}

export function fetchMyLists() {
  return api<import('../types/api').TierList[]>('/users/me/lists/')
}

export function fetchFeed(params: Record<string, string> = {}) {
  const q = new URLSearchParams(params).toString()
  return api<import('../types/api').PaginatedResponse<import('../types/api').TierList>>(
    `/lists/feed/${q ? '?' + q : ''}`
  )
}

export function reactToList(id: string, reactionType: import('../types/api').ReactionType | null) {
  return api<import('../types/api').TierList>(`/lists/${id}/react/`, {
    method: 'POST',
    body: JSON.stringify(reactionType ? { reaction_type: reactionType } : {}),
  })
}

export function createList(data: Record<string, unknown>) {
  return api<import('../types/api').TierList>('/lists/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateList(id: string, data: Record<string, unknown>) {
  return api<import('../types/api').TierList>(`/lists/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteList(id: string) {
  return api<undefined>(`/lists/${id}/`, { method: 'DELETE' })
}

export async function exportListPng(id: string): Promise<Blob> {
  const token = getAccessToken()
  const res = await fetch(`${BASE}/lists/${id}/export/`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new ApiError(res.status, await res.text())
  return res.blob()
}

// Upload
export function uploadImage(file: File) {
  const form = new FormData()
  form.append('file', file)
  const token = getAccessToken()
  return fetch(`${BASE}/upload/`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  }).then(async (res) => {
    if (!res.ok) {
      const t = await res.text()
      let body: unknown = t
      try {
        body = JSON.parse(t)
      } catch {
        // ignore
      }
      throw new ApiError(res.status, body)
    }
    return res.json() as Promise<{ id: number; file: string; original_name: string; file_size: number; created_at: string }>
  })
}
