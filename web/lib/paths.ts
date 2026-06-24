/** URL builders for slug-based app routes (no /app prefix). */

export type SlugEntity = { slug: string };

export function templatesPath(query?: string) {
  return query ? `/templates?${query}` : "/templates";
}

export function templatePath(entity: SlugEntity) {
  return `/templates/${entity.slug}`;
}

export function templateEditPath(entity: SlugEntity) {
  return `/templates/${entity.slug}/edit`;
}

export function templateCommunityPath(entity: SlugEntity) {
  return `/templates/${entity.slug}/community`;
}

export function newTemplatePath(params?: { category?: string }) {
  if (!params?.category) return "/templates/new";
  return `/templates/new?category=${encodeURIComponent(params.category)}`;
}

export function categoriesPath() {
  return "/categories";
}

export function categoryPath(entity: SlugEntity) {
  return `/categories/${entity.slug}`;
}

export function newCategoryPath() {
  return "/categories/new";
}

export function listsPath() {
  return "/lists";
}

export function listsFeedPath() {
  return "/lists/feed";
}

export function listPath(entity: SlugEntity) {
  return `/lists/${entity.slug}`;
}

export function listEditPath(entity: SlugEntity) {
  return `/lists/${entity.slug}/edit`;
}

export function newListPath(params?: { template?: string }) {
  if (!params?.template) return "/lists/new";
  return `/lists/new?template=${encodeURIComponent(params.template)}`;
}

export function memesPath() {
  return "/memes";
}

export function memePath(entity: SlugEntity) {
  return `/memes/${entity.slug}`;
}

export function memeEditorPath() {
  return "/meme-editor";
}
