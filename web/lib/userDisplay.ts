import type { User } from "@/types/api";

/** Synthetic emails created for X OAuth sign-in (not shown in the UI). */
export function isOAuthPlaceholderEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return /^x_\d+@/i.test(email) && /@oauth\./i.test(email);
}

/** X @handle for OAuth users; email for password sign-in. */
export function formatXUsername(username: string): string {
  const trimmed = username.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

export function getUserDisplayName(
  user: Pick<User, "email" | "x_username"> | null | undefined
): string {
  if (!user) return "";
  const handle = user.x_username?.trim();
  if (handle) return formatXUsername(handle);
  const email = user.email?.trim() ?? "";
  if (!email || isOAuthPlaceholderEmail(email)) return "X account";
  return email;
}

/** Tooltip: full email only when it is a real user-facing address. */
export function getUserDisplayTitle(
  user: Pick<User, "email" | "x_username"> | null | undefined
): string {
  if (!user) return "";
  const handle = user.x_username?.trim();
  if (handle) return formatXUsername(handle);
  const email = user.email?.trim() ?? "";
  if (email && !isOAuthPlaceholderEmail(email)) return email;
  return "Signed in with X";
}
