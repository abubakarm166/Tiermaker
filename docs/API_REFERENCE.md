# **Thetiermaker — HTTP API (mobile & web clients)**

This document describes the REST API for integrating **native or hybrid apps** with Thetiermaker. It lists **exact URL paths**, **HTTP methods**, **authentication**, and **request/response field names and types** so your client can implement calls without guessing.

**Base URL (production):** `https://thetiermaker.com/api/`  
**Base URL (local Django):** `http://127.0.0.1:8000/api/`

All paths below are **relative to the base URL** (example: `auth/login/` → `https://thetiermaker.com/api/auth/login/`).

---

## **Conventions**

### **Trailing slashes**

Django’s `APPEND_SLASH` is enabled. **Always use a trailing slash** on URLs (e.g. `GET /api/templates/` not `/api/templates`).  
**POST, PUT, and PATCH** without a trailing slash may **302 redirect and drop the body** — include `/` at the end.

### **Authentication**

Most endpoints require a **JWT access token**:

```http
Authorization: Bearer <access_token>
```

Obtain tokens with **`POST /api/auth/login/`** or **`POST /api/auth/register/`**.  
Refresh with **`POST /api/auth/token/refresh/`** and body `{ "refresh": "<refresh_token>" }`.

### **Default permissions**

Unless a section says otherwise, endpoints expect **JWT authentication** and reject anonymous users.  
**Banned users** are blocked when obtaining tokens / using protected routes (see Auth).

### **Pagination**

List endpoints that use the default DRF page style return:

```json
{
  "count": 123,
  "next": "https://...?page=2",
  "previous": null,
  "results": [ ... ]
}
```

Default **page size: 20** (`PAGE_SIZE` in settings).

### **Content types**

| Usage | Header |
|--------|--------|
| JSON bodies | `Content-Type: application/json` |
| File upload | `Content-Type: multipart/form-data` |

---

## **Auth** (`/api/auth/`)

### **Register**

| | |
|--|--|
| **Method** | `POST` |
| **Path** | `/api/auth/register/` |
| **Auth** | None (`AllowAny`) |
| **Content-Type** | `application/json` |

**Request body (JSON) — field reference**

| Field | Type | Required | Notes |
|--------|------|----------|--------|
| `email` | string | **Yes** | Stored as username; must be valid email format per serializer |
| `password` | string | **Yes** | Min length **8** characters |

**Example**

```json
{
  "email": "user@example.com",
  "password": "min8chars"
}
```

**Response `201` — top-level keys**

| Key | Type | Notes |
|-----|------|--------|
| `user` | object | See **User object** below |
| `access` | string | JWT access token |
| `refresh` | string | JWT refresh token |

**User object** (`user`): `id` (int), `email` (string), `role` (string, e.g. `"USER"`), `is_banned` (bool), `created_at`, `updated_at` (ISO datetimes).

**Errors:** validation `400`; duplicate email etc. per DRF field errors.

---

### **Login (JWT pair)**

| | |
|--|--|
| **Method** | `POST` |
| **Path** | `/api/auth/login/` |
| **Auth** | None |
| **Content-Type** | `application/json` |

**Request body (JSON)**

| Field | Type | Required |
|--------|------|----------|
| `email` | string | **Yes** |
| `password` | string | **Yes** |

**Response `200`**

| Field | Type |
|--------|------|
| `refresh` | string |
| `access` | string |

**Errors:** `401` if credentials invalid; banned users receive an authentication failure message.

---

### **Refresh access token**

| | |
|--|--|
| **Method** | `POST` |
| **Path** | `/api/auth/token/refresh/` |
| **Auth** | None (token in body) |

**Request body**

| Field | Type | Required |
|--------|------|----------|
| `refresh` | string | **Yes** |

**Response `200`:** `access` (string); may include rotated `refresh` (string) depending on JWT settings.

---

### **Current user (`me`)**

| | |
|--|--|
| **Method** | `GET`, `PATCH` |
| **Path** | `/api/auth/me/` |
| **Auth** | JWT |

**GET response:** same fields as **User object** above (`id`, `email`, `role`, `is_banned`, `created_at`, `updated_at`).

**PATCH request body (JSON):** writable fields on `UserSerializer` are **`email` only** (other fields are read-only for this endpoint).

---

### **Admin: list users**

| | |
|--|--|
| **Method** | `GET` |
| **Path** | `/api/auth/users/` |
| **Auth** | JWT + **Admin** role |

---

### **Admin: user detail**

| | |
|--|--|
| **Method** | `GET`, `PATCH` |
| **Path** | `/api/auth/users/<id>/` |
| **Auth** | JWT + **Admin** |

**PATCH body (JSON):** implementation accepts:

| Field | Type | Notes |
|--------|------|--------|
| `is_banned` | boolean | Optional; updates ban flag |
| `role` | string | Optional; must be **`USER`** or **`ADMIN`** |

Other user fields follow `UserAdminSerializer` on **GET** response.

---

## **File upload** (`/api/upload/`)

| | |
|--|--|
| **Method** | `POST` |
| **Path** | `/api/upload/` |
| **Auth** | JWT |
| **Content-Type** | `multipart/form-data` |

**Form fields**

| Field name | Type | Required | Notes |
|-------------|------|----------|--------|
| `file` | file | One of `file` **or** `image` **required** | Preferred field name |
| `image` | file | Same as above | Alternative field name |

**Rules:** allowed extensions from settings (default: `.jpg`, `.jpeg`, `.png`, `.webp`); max size `MAX_UPLOAD_SIZE` (default **5 MB**). Image is resized/compressed server-side.

**Response `201`**

| Field | Type | Notes |
|--------|------|--------|
| `id` | integer | Uploaded image record id |
| `file` | string | URL or path under `/media/...` — use in templates/categories |
| `original_name` | string | |
| `file_size` | integer | Bytes after optimization |
| `created_at` | string | ISO datetime |

**Errors:** `400` if no file, wrong extension, too large, or corrupt image (`detail` message).

---

## **Categories** (`/api/categories/`)

**Permissions:** `IsAdminOrReadOnly` — any **authenticated** user may **GET**; only **admin** may **POST/PUT/PATCH/DELETE**.

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/api/categories/` | Paginated list |
| `POST` | `/api/categories/` | Create (admin) |
| `GET` | `/api/categories/<id>/` | Detail |
| `PUT` | `/api/categories/<id>/` | Full update (admin) |
| `PATCH` | `/api/categories/<id>/` | Partial update (admin) |
| `DELETE` | `/api/categories/<id>/` | Delete (admin) |

**List / retrieve — response fields**

| Field | Type | Notes |
|--------|------|--------|
| `id` | integer | |
| `name` | string | |
| `image` | string \| null | Media URL or path |

**Write body (`CategoryWriteSerializer`) — JSON**

| Field | Type | Required | Notes |
|--------|------|----------|--------|
| `name` | string | **Yes** (create) | |
| `image` | string \| null \| omitted | No | Path from upload; `/media/` prefix stripped on save |

---

## **Templates** (`/api/templates/`)

**Permissions:** authenticated; object-level rules for edits; see backend `IsOwnerOrAdminTemplate`.

**List query parameters**

| Param | Type | Notes |
|--------|------|--------|
| `category` | integer | Category id |
| `tags` | string | Matched if contained in template `tags` JSON array |
| `visibility` | string | `PUBLIC` or `PRIVATE` |
| `search` | string | Search `title` |
| `ordering` | string | e.g. `-created_at`, `created_at`, or specials like `most_popular`, `newest` |

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/api/templates/` | Paginated; `TemplateListSerializer` |
| `POST` | `/api/templates/` | Create; `created_by` = current user |
| `GET` | `/api/templates/<id>/` | Detail + `tier_rows` + `items` |
| `PUT` / `PATCH` | `/api/templates/<id>/` | Owner/admin |
| `DELETE` | `/api/templates/<id>/` | Owner/admin |

**List item — response fields (typical)**

| Field | Type |
|--------|------|
| `id` | integer |
| `title` | string |
| `description` | string |
| `category` | integer \| null |
| `category_name` | string \| null |
| `tags` | array of strings |
| `visibility` | string (`PUBLIC` / `PRIVATE`) |
| `created_by` | integer (user id) |
| `created_by_email` | string |
| `created_at` | string |
| `updated_at` | string |
| `popularity` | integer |
| `thumbnail` | string \| null (URL) |

**Detail adds:** `tier_rows`, `items`.

**`tier_rows[]` object**

| Field | Type |
|--------|------|
| `id` | integer |
| `label` | string |
| `color` | string (e.g. hex `#808080`) |
| `order` | integer |

**`items[]` object**

| Field | Type |
|--------|------|
| `id` | integer |
| `name` | string |
| `image` | string \| null |
| `order` | integer |

**Create / update body (`TemplateWriteSerializer`) — JSON**

| Field | Type | Required | Notes |
|--------|------|----------|--------|
| `title` | string | **Yes** (create) | |
| `description` | string | No | |
| `thumbnail` | string \| null | No | Path string from upload |
| `category` | integer \| null | No | |
| `tags` | array of strings | No | |
| `visibility` | string | No | `PUBLIC` or `PRIVATE` |
| `tier_rows` | array | No | Each object: **`label`** (string), **`color`** (string), **`order`** (int, optional; defaults by index) |
| `items` | array | No | Each object: **`name`** (string), **`image`** (string path optional), **`order`** (int, optional) |

Sending **`tier_rows`** or **`items`** on update **replaces** all existing rows/items for that template.

---

## **Tier lists** (`/api/lists/`)

**Permissions:** `IsOwnerOrAdminList` — all actions require authentication; public lists readable/export/react for authenticated users; mutations only owner or admin.

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/api/lists/` | **Current user’s lists** (non-admin); paginated |
| `POST` | `/api/lists/` | Create; `user` = current user |
| `GET` | `/api/lists/<id>/` | Detail; private lists only owner/admin |
| `PUT` / `PATCH` | `/api/lists/<id>/` | Owner/admin |
| `DELETE` | `/api/lists/<id>/` | Owner/admin |
| `POST` | `/api/lists/<id>/export/` | PNG export |
| `POST` | `/api/lists/<id>/react/` | Set or clear reaction |

**Retrieve** uses `TierListDetailSerializer`: `template_detail` includes full template with `tier_rows` and `items`.

**List / detail — response fields (typical)**

| Field | Type | Notes |
|--------|------|--------|
| `id` | integer | |
| `template` | integer | Template id |
| `template_detail` | object | Nested template summary or full detail on retrieve |
| `user` | integer | Owner user id |
| `user_email` | string | |
| `title` | string | |
| `visibility` | string | `PUBLIC` / `PRIVATE` |
| `tier_assignments` | object | Map tier key → array of **integer** item ids |
| `row_order` | array of strings | Display order of tier keys |
| `label_overrides` | object | Tier key → display label string |
| `color_overrides` | object | Tier key → hex color string |
| `custom_rows` | array | `{ "label": string, "color": string }` |
| `created_at` | string | |
| `updated_at` | string | |
| `reaction_counts` | object | e.g. `{ "like": 3, "love": 1 }` |
| `my_reaction` | string \| null | Current user’s reaction type |
| `can_edit` | boolean | Whether current user may edit |

**Create / update body (`TierListWriteSerializer`) — JSON**

| Field | Type | Required | Notes |
|--------|------|----------|--------|
| `template` | integer | **Yes** (create) | |
| `title` | string | **Yes** (model) | |
| `visibility` | string | No | `PUBLIC` / `PRIVATE` |
| `tier_assignments` | object | No | Values must be **arrays of integers** (item ids) |
| `row_order` | array of strings | No | |
| `label_overrides` | object | No | String keys and string values only |
| `color_overrides` | object | No | String keys and string values only |
| `custom_rows` | array | No | Each element: **`label`** (string), **`color`** (string) |

**Export:** `POST /api/lists/<id>/export/` — response body is **`image/png`**; header `Content-Disposition: attachment; filename="tierlist-<id>.png"`.

**React:** `POST /api/lists/<id>/react/`

**Request body (JSON)**

| Field | Type | Required | Notes |
|--------|------|----------|--------|
| `reaction_type` | string \| null | No | One of: **`like`**, **`love`**, **`laugh`**, **`wow`**, **`sad`**. **`null`** or omit after delete: server **deletes** current user’s reaction (implementation deletes existing row first, then optionally creates a new one) |

**Response:** `TierListSerializer` for that list (updated `reaction_counts`, `my_reaction`).

---

## **Feed & current user lists**

### **Public feed (paginated)**

| | |
|--|--|
| **Method** | `GET` |
| **Path** | `/api/lists/feed/` |
| **Auth** | JWT |

Returns recent **public** tier lists; same pagination envelope as other list endpoints; serializer `TierListSerializer`.

### **Current user’s lists (array)**

| | |
|--|--|
| **Method** | `GET` |
| **Path** | `/api/users/me/lists/` |
| **Auth** | JWT |

Returns a **JSON array** (not paginated) of `TierListSerializer` objects for the logged-in user.

---

## **Memes** (`/api/memes/`)

Memes store **editor state** as JSON (`snapshot`) and an optional **preview image** for the gallery. The API does **not** enforce an internal schema inside `snapshot` — it is **opaque application JSON** (e.g. Konva/canvas state from the web editor). Your app should treat it as a single JSON value to save and reload.

**Parsers:** `MultiPartParser`, `FormParser`, `JSONParser` — you may use **JSON** or **multipart/form-data**.

**Permissions**

| Action | Auth |
|--------|------|
| `GET` list, `GET` detail | **AllowAny** (public gallery; no JWT required) |
| `POST` create, `POST` remix | **JWT required** |
| `PUT` / `PATCH` / `DELETE` | **JWT required**; only **author** or **staff** |

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/memes/` | Paginated list |
| `POST` | `/api/memes/` | Create meme |
| `GET` | `/api/memes/<id>/` | Detail (includes `snapshot`) |
| `PUT` | `/api/memes/<id>/` | Update (author/admin); see note below |
| `PATCH` | `/api/memes/<id>/` | Same as PUT in practice |
| `DELETE` | `/api/memes/<id>/` | Delete (author/admin) |
| `POST` | `/api/memes/<id>/remix/` | New meme with `parent` = `<id>` |

**Note:** The server applies **`partial=True`** when validating updates, so omitted fields keep previous values.

---

### **List response** (`GET /api/memes/`)

Each item in `results` has:

| Field | Type | Notes |
|--------|------|--------|
| `id` | integer | |
| `title` | string | May be empty |
| `preview` | string \| null | Image URL if set |
| `author_email` | string \| null | |
| `parent_id` | integer \| null | Parent meme id if remix |
| `created_at` | string | ISO datetime |
| `updated_at` | string | ISO datetime |

---

### **Detail response** (`GET /api/memes/<id>/`)

Same as list row, plus:

| Field | Type | Notes |
|--------|------|--------|
| `snapshot` | object (JSON) | Full editor state; arbitrary keys allowed |

---

### **Create meme** (`POST /api/memes/`)

**Auth:** JWT required.

**Option A — `application/json`**

| Field | Type | Required | Notes |
|--------|------|----------|--------|
| `title` | string | No | Max length **120**; may be blank |
| `snapshot` | object | No | Defaults to `{}` if omitted; any JSON-serializable object |
| `parent` | integer \| null | No | Parent meme id (lineage); normally set by **remix** |
| `preview` | (not used in JSON) | — | For file upload use multipart field `preview` |
| `preview_data_url` | string | No | If set, must be a **data URL** (`data:image/png;base64,...` or jpeg). Server decodes, optimizes, saves **`preview`** image. Ignored if `preview` already set |

**Example (JSON)**

```json
{
  "title": "My meme",
  "snapshot": { "version": 1, "layers": [] },
  "preview_data_url": "data:image/png;base64,iVBORw0KGgo..."
}
```

**Option B — `multipart/form-data`**

| Part name | Type | Required | Notes |
|-----------|------|----------|--------|
| `title` | text | No | |
| `snapshot` | text (JSON string) | No | Server parses JSON string into object; invalid JSON → stored as `{}` |
| `preview` | file | No | Image file → saved as preview |
| `parent` | text | No | Integer id as string |
| `preview_data_url` | text | No | Same behavior as JSON body |

**Success `201`:** response body is **detail shape** (includes `snapshot`), same as `GET` detail.

---

### **Update meme** (`PUT` / `PATCH` — `/api/memes/<id>/`)

**Auth:** JWT; **author** or **staff** only.

Writable fields match **`MemeCreateSerializer`**:

| Field | Type | Notes |
|--------|------|--------|
| `title` | string | Optional |
| `snapshot` | object | Optional; multipart: JSON string coerced like create |
| `preview` | file | Optional (multipart) — new image file |
| `parent` | integer \| null | Optional |

**Important:** **`preview_data_url` is not processed on update** in the current server implementation. To change the preview image on update, send a **`preview`** file via **multipart**, or use a workflow that deletes/recreates if needed.

**Success `200`:** detail JSON (with `snapshot`).

---

### **Remix** (`POST /api/memes/<id>/remix/`)

**Auth:** JWT required.

Creates a **new** meme; sets **`parent`** to the meme identified by `<id>`. If **`snapshot`** is omitted, server defaults it from **parent’s** `snapshot`.

**Request body:** same field names as **create** (`title`, `snapshot`, `preview_data_url`, multipart `preview`, etc.). Do not need to send `parent` in body — it is forced from the URL.

| Field | Type | Required | Notes |
|--------|------|----------|--------|
| `title` | string | No | |
| `snapshot` | object | No | Defaults to parent’s snapshot |
| `preview_data_url` | string | No | Same as create |
| `preview` | file | No | Multipart |

**Success `201`:** detail JSON for the **new** meme.

---

### **Delete meme** (`DELETE /api/memes/<id>/`)

**Auth:** JWT; author or staff. **`204`** or standard DRF delete behavior.

---

## **Admin site**

| | |
|--|--|
| **URL** | `/admin/` |

Django admin UI (not part of the REST API).

---

## **Error responses**

Typical DRF behavior:

| Code | Meaning |
|------|--------|
| `400` | Validation (`{"field": ["..."]}`) or `{"detail": "..."}` |
| `401` | Missing or invalid JWT |
| `403` | Permission denied |
| `404` | Not found |

---

## **CORS**

Browser apps should use origins allowed by **`CORS_ALLOWED_ORIGINS`** when `DEBUG=False` (configure via backend env, e.g. `CORS_ORIGINS`). API is JWT-based.

---

## **Implementation reference (backend)**

For server behavior and serializers, see Django apps: `accounts/`, `templates/`, `lists/`, `uploads/`, `memes/`, and `config/urls.py`, `core/urls.py`.

---

## **Changelog (maintainers)**

- Tier lists support **`color_overrides`** for per-row colors in addition to template defaults and **`custom_rows`**.
