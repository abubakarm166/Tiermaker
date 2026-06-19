export type UserRole = "USER" | "ADMIN";

export interface Category {
  id: number;
  name: string;
  image: string | null;
  /** Number of tier list templates in this category (from API). */
  template_count?: number;
  /** Recent public template titles for landing cards and previews. */
  sample_templates?: string[];
}

export interface User {
  id: number;
  email: string;
  x_username?: string;
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
  color_overrides?: Record<string, string>;
  custom_rows?: { label: string; color: string }[];
  thumbnail?: string | null;
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

export interface Meme {
  id: number;
  title: string;
  snapshot?: unknown;
  preview: string | null;
  author_email: string | null;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface LiveTierRow {
  label: string;
  color: string;
  order: number;
}

export interface LiveEventDetail {
  id: number;
  title: string;
  invite_token: string;
  invite_url_path: string;
  starts_at: string;
  ends_at: string;
  visibility: Visibility;
  status: "SCHEDULED" | "LIVE" | "PAUSED" | "ENDED";
  template_title: string;
  template_id: number;
  host_email: string | null;
  tier_rows: LiveTierRow[];
  summary: {
    total_votes: number;
    total_participants: number;
    locked: boolean;
  };
}

export interface LiveStateItem {
  item_id: number;
  name: string;
  image: string | null;
  average_score: number | null;
  vote_count: number;
  display_tier: string | null;
}

export interface LiveState {
  total_votes: number;
  total_participants: number;
  skip_count: number;
  /** Non-skip votes grouped by tier label (matches tier row labels). */
  tier_vote_counts?: Record<string, number>;
  items: LiveStateItem[];
  board: Record<string, number[]>;
  locked: boolean;
  voting_open: boolean;
  now: string;
}

export interface LiveNextItemResponse {
  done: boolean;
  item: { id: number; name: string; image: string | null } | null;
  progress_index: number;
  progress_total: number;
  /** Personal vote order for this browser session (shuffled). */
  queue_item_ids?: number[];
  /** Template item ids this browser session has already voted on (tier or skip). */
  voted_item_ids?: number[];
}

export interface LiveEventCard {
  id: number;
  title: string;
  invite_token: string;
  invite_url_path: string;
  starts_at: string;
  ends_at: string;
  status: string;
  vote_count: number;
  participant_count: number;
  item_count: number;
  thumbnail_url: string | null;
}

export interface LiveBrowseResponse {
  ending_soon: LiveEventCard[];
  most_voted: LiveEventCard[];
  popular_completed: LiveEventCard[];
}

/** Homepage carousel — public landing preview (poll for updates). */
export interface LiveLandingEvent {
  id: number;
  title: string;
  invite_url_path: string;
  host_display: string;
  vote_count: number;
  participant_count: number;
  ends_at: string;
  recent_voter_initials: string[];
  extra_voters: number;
}
