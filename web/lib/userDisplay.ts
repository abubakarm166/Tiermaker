import type { User } from "@/types/api";

/** Synthetic emails created for X OAuth sign-in (not shown in the UI). */
export function isOAuthPlaceholderEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return /^x_\d+@/i.test(email) && /@oauth\./i.test(email);
}

export function formatUsername(username: string): string {
  const trimmed = username.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

export function getUserDisplayName(
  user: Pick<User, "username" | "x_username"> | null | undefined
): string {
  if (!user) return "";
  const handle = user.username?.trim() || user.x_username?.trim();
  if (handle) return formatUsername(handle);
  return "Member";
}

/** Tooltip for nav / account controls. */
export function getUserDisplayTitle(
  user: Pick<User, "username" | "x_username"> | null | undefined
): string {
  return getUserDisplayName(user);
}

export function formatAuthorLabel(username: string | null | undefined): string {
  const trimmed = username?.trim();
  if (!trimmed) return "Anonymous";
  return formatUsername(trimmed);
}
