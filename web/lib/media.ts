const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

/**
 * Normalize image URL so it works with Next.js:
 * - Full Django URL (e.g. http://localhost:8000/media/...) → same-origin /media/ path (proxied to Django)
 * - Relative /media/ path → use as-is (proxied)
 * - Other relative path → add leading slash
 */
export function mediaSrc(url: string): string {
  if (!url) return url;
  if (API_BASE && url.startsWith(API_BASE) && url.includes("/media/")) {
    const path = url.slice(API_BASE.length).replace(/^\/+/, "/");
    return path.startsWith("/") ? path : `/${path}`;
  }
  return url.startsWith("http") ? url : url.startsWith("/") ? url : `/${url}`;
}
