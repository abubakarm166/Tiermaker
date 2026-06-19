const CATEGORY_EMOJIS: Record<string, string> = {
  gaming: "🎮",
  games: "🎮",
  "fast food": "🍜",
  food: "🍜",
  sport: "🏆",
  sports: "🏆",
  pokémon: "🐉",
  pokemon: "🐉",
  anime: "🎬",
  music: "🎵",
  marvel: "🦸",
  cars: "🚗",
  automotive: "🚗",
  movies: "🎬",
  film: "🎬",
  tv: "📺",
  technology: "💻",
  tech: "💻",
};

export function getCategoryEmoji(name: string): string {
  const key = name.trim().toLowerCase();
  return CATEGORY_EMOJIS[key] ?? "📋";
}

export function formatCategoryExamples(category: {
  sample_templates?: string[];
  template_count?: number;
  name: string;
}): string {
  const samples = category.sample_templates?.filter(Boolean) ?? [];
  if (samples.length > 0) {
    return samples.join(", ");
  }
  const count = category.template_count ?? 0;
  if (count > 0) {
    return `${count} template${count === 1 ? "" : "s"} ready to rank`;
  }
  return `Explore ${category.name} templates and start ranking`;
}
