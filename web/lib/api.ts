import type {
  User,
  RegisterResponse,
  PaginatedResponse,
  Category,
  Template,
  TierList,
  ReactionType,
  Meme,
  LiveEventDetail,
  LiveState,
  LiveNextItemResponse,
  LiveBrowseResponse,
  LiveEventCard,
  LiveLandingEvent,
  Visibility,
} from "@/types/api";

const BASE = "/api";

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access");
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh");
}

function setTokens(access: string, refresh: string) {
  localStorage.setItem("access", access);
  localStorage.setItem("refresh", refresh);
}

function clearTokens() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
}

export const authStorage = { getAccessToken, getRefreshToken, setTokens, clearTokens };

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  const res = await fetch(`${BASE}/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  setTokens(data.access, refresh);
  return data.access;
}

/** Ensure path has trailing slash so Django APPEND_SLASH is satisfied (POST redirect would drop body). */
function pathWithSlash(path: string): string {
  if (path.startsWith("http")) return path;
  const [base, qs] = path.split("?");
  const slash = base.endsWith("/") ? base : `${base}/`;
  return qs ? `${slash}?${qs}` : slash;
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${BASE}${pathWithSlash(path)}`;
  const token = getAccessToken();
  const doRequest = (access: string | null) => {
    const headers: HeadersInit = { ...(options.headers as Record<string, string>) };
    if (access) (headers as Record<string, string>)["Authorization"] = `Bearer ${access}`;
    if (!(options.body instanceof FormData) && !(headers as Record<string, string>)["Content-Type"]) {
      (headers as Record<string, string>)["Content-Type"] = "application/json";
    }
    return fetch(url, { ...options, headers });
  };
  let res = await doRequest(token);
  if (res.status === 401 && token) {
    const newAccess = await refreshAccessToken();
    if (newAccess) res = await doRequest(newAccess);
  }
  if (!res.ok) {
    const text = await res.text();
    let errBody: unknown = text;
    try {
      errBody = JSON.parse(text);
    } catch {
      // ignore
    }
    throw new ApiError(res.status, errBody);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown
  ) {
    super(
      typeof body === "object" && body !== null && "detail" in body
        ? String((body as { detail: unknown }).detail)
        : `Request failed with status ${status}`
    );
    this.name = "ApiError";
  }
}

export async function login(email: string, password: string) {
  // Backend login endpoint returns tokens only (SimpleJWT default).
  // We fetch /auth/me/ after storing tokens to populate the user.
  const tokens = await api<{ access: string; refresh: string }>("/auth/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  authStorage.setTokens(tokens.access, tokens.refresh);
  const user = await fetchMe();
  return { ...tokens, user };
}

export function register(email: string, password: string) {
  return api<RegisterResponse>("/auth/register/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function requestPasswordReset(email: string) {
  return api<{ detail: string }>("/auth/password-reset/", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function confirmPasswordReset(payload: { uid: string; token: string; new_password: string }) {
  return api<{ detail: string }>("/auth/password-reset/confirm/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchMe() {
  return api<User>("/auth/me/");
}

export function fetchCategories() {
  return api<PaginatedResponse<Category>>("/categories/");
}

export function fetchCategory(id: string) {
  return api<Category>(`/categories/${id}/`);
}

export function createCategory(data: { name: string; image?: string | null }) {
  return api<Category>("/categories/", { method: "POST", body: JSON.stringify(data) });
}

export function fetchTemplates(params: Record<string, string> = {}) {
  const q = new URLSearchParams(params).toString();
  return api<PaginatedResponse<Template>>(`/templates/${q ? "?" + q : ""}`);
}

export function fetchTemplate(id: string) {
  return api<Template>(`/templates/${id}/`);
}

/** Public tier lists created from a template (community ranking). */
export function fetchTierListsForTemplate(templateId: number | string, page = 1) {
  return api<PaginatedResponse<TierList>>(
    `/templates/${templateId}/tier-lists/?page=${encodeURIComponent(String(page))}`
  );
}

export function createTemplate(data: Record<string, unknown>) {
  return api<Template>("/templates/", { method: "POST", body: JSON.stringify(data) });
}

export function updateTemplate(id: string, data: Record<string, unknown>) {
  return api<Template>(`/templates/${id}/`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteTemplate(id: string) {
  return api<undefined>(`/templates/${id}/`, { method: "DELETE" });
}

export function fetchLists(params: Record<string, string> = {}) {
  const q = new URLSearchParams(params).toString();
  return api<PaginatedResponse<TierList>>(`/lists/${q ? "?" + q : ""}`);
}

export function fetchList(id: string) {
  return api<TierList>(`/lists/${id}/`);
}

export function fetchMyLists() {
  return api<TierList[]>("/users/me/lists/");
}

export function fetchFeed(params: Record<string, string> = {}) {
  const q = new URLSearchParams(params).toString();
  return api<PaginatedResponse<TierList>>(`/lists/feed/${q ? "?" + q : ""}`);
}

export function fetchMemes(params: Record<string, string> = {}) {
  const q = new URLSearchParams(params).toString();
  return api<PaginatedResponse<Meme>>(`/memes/${q ? "?" + q : ""}`);
}

export function fetchMeme(id: string) {
  return api<Meme>(`/memes/${id}/`);
}

export function createMeme(data: {
  title?: string;
  snapshot: unknown;
  preview_data_url?: string;
  parent?: number | null;
}) {
  return api<Meme>("/memes/", { method: "POST", body: JSON.stringify(data) });
}

export function remixMeme(id: string, data: { title?: string; snapshot: unknown; preview_data_url?: string }) {
  return api<Meme>(`/memes/${id}/remix/`, { method: "POST", body: JSON.stringify(data) });
}

export function reactToList(id: string, reactionType: ReactionType | null) {
  return api<TierList>(`/lists/${id}/react/`, {
    method: "POST",
    body: JSON.stringify(reactionType ? { reaction_type: reactionType } : {}),
  });
}

export function createList(data: Record<string, unknown>) {
  return api<TierList>("/lists/", { method: "POST", body: JSON.stringify(data) });
}

export function updateList(id: string, data: Record<string, unknown>) {
  return api<TierList>(`/lists/${id}/`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteList(id: string) {
  return api<undefined>(`/lists/${id}/`, { method: "DELETE" });
}

export function fetchRelatedLists(id: string, limit = 6) {
  return api<TierList[]>(`/lists/${id}/related/?limit=${encodeURIComponent(String(limit))}`);
}

export async function exportListPng(id: string): Promise<Blob> {
  const token = getAccessToken();
  const res = await fetch(`${BASE}/lists/${id}/export/`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.blob();
}

/** TierMaker Live — voting sessions */
export function fetchLiveBrowse() {
  return api<LiveBrowseResponse>("/live/events/browse/");
}

/** Public homepage slice — no auth (throttled). */
export function fetchLiveLandingPreview() {
  return api<{ results: LiveLandingEvent[] }>("/live/events/landing-preview/");
}

/** Public live sessions that used this template (newest first). */
export function fetchLiveEventsForTemplate(templateId: number) {
  return api<{ results: LiveEventCard[] }>(`/live/templates/${templateId}/events/`);
}

export function createLiveEvent(data: {
  title: string;
  template_id: number;
  starts_at: string;
  ends_at: string;
  visibility: Visibility;
}) {
  return api<LiveEventDetail>("/live/events/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function fetchLiveEvent(token: string) {
  return api<LiveEventDetail>(`/live/events/${token}/`);
}

export function fetchLiveState(token: string) {
  return api<LiveState>(`/live/events/${token}/state/`);
}

export function liveJoin(token: string) {
  return api<{ session_key: string; joined: boolean }>(`/live/events/${token}/join/`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function liveNextItem(token: string, sessionKey: string) {
  const q = `session_key=${encodeURIComponent(sessionKey)}`;
  return api<LiveNextItemResponse>(`/live/events/${token}/next-item/?${q}`);
}

export function liveVote(
  token: string,
  body: { session_key: string; template_item_id: number; tier_label?: string; skip?: boolean }
) {
  return api<{ ok: boolean; next_index: number }>(`/live/events/${token}/vote/`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function liveHostEnd(token: string) {
  return api<{ status: string }>(`/live/events/${token}/host/end/`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function liveHostPause(token: string) {
  return api<{ status: string }>(`/live/events/${token}/host/pause/`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function liveHostResume(token: string) {
  return api<{ status: string }>(`/live/events/${token}/host/resume/`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function uploadImage(file: File) {
  const form = new FormData();
  form.append("file", file);
  const token = getAccessToken();
  return fetch(`${BASE}/upload/`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  }).then(async (res) => {
    if (!res.ok) {
      const t = await res.text();
      let body: unknown = t;
      try {
        body = JSON.parse(t);
      } catch {
        // ignore
      }
      throw new ApiError(res.status, body);
    }
    return res.json() as Promise<{ id: number; file: string; original_name: string; file_size: number; created_at: string }>;
  });
}
