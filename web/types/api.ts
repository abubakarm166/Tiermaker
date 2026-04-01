export type UserRole = "USER" | "ADMIN";

export interface Category {
  id: number;
  name: string;
  image: string | null;
}

export interface User {
  id: number;
  email: string;
  role: UserRole;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
}

export type Visibility = "PUBLIC" | "PRIVATE";

export interface TierRow {
  id: number;
  label: string;
  color: string;
  order: number;
}

export interface TemplateItem {
  id: number;
  name: string;
  image: string | null;
  order: number;
}

export interface Template {
  id: number;
  title: string;
  description: string;
  category: number | null;
  category_name: string | null;
  tags: string[];
  visibility: Visibility;
  created_by: number;
  created_by_email: string;
  created_at: string;
  updated_at: string;
  popularity?: number;
  thumbnail?: string | null;
  tier_rows?: TierRow[];
  items?: TemplateItem[];
}

export type ReactionType = "like" | "love" | "laugh" | "wow" | "sad";

export interface TierList {
  id: number;
  template: number;
  template_detail?: Template;
  user: number;
  user_email?: string;
  title: string;
  visibility: Visibility;
  tier_assignments: Record<string, number[]>;
  row_order?: string[];
  label_overrides?: Record<string, string>;
  custom_rows?: { label: string; color: string }[];
  created_at: string;
  updated_at: string;
  reaction_counts?: Record<string, number>;
  my_reaction?: ReactionType | null;
  can_edit?: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface RegisterResponse {
  user: User;
  access: string;
  refresh: string;
}
