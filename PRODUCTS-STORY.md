# Product Management — Implementation Story

## Summary of research
I reviewed the existing admin products list page and the admin products API (`src/app/api/admin/products/route.js`), plus the activities pages to mirror structure and UX patterns. Key findings:

- Prisma `Product` model fields (we'll implement exactly these):
  - `id` (uuid)
  - `productImageUrl` (string) — image stored in Supabase; API expects file upload
  - `title` (string) — required
  - `summary` (string?) — optional (db text)
  - `description` (string) — required (db text)
  - `price` (Decimal) — required (API validates > 0)
  - `categoryId` (string) — handled via a category name field in the form; server finds or creates category
  - `isFeatured` (boolean) — optional toggle, defaults to false

- API behavior (important):
  - POST /api/admin/products expects multipart/form-data with required fields: `title`, `description`, `price`, `category`, `image` (file).
  - POST will upload the image to the `product-images` Supabase bucket and return the created product object (201).
  - PATCH /api/admin/products?productId=<id> accepts multipart/form-data and supports updating fields plus optional file upload to replace image. PATCH validates price if provided.
  - DELETE endpoint was not present in the snippet; verify existing delete route or we can call a `DELETE` on the same API path (if not present, follow-up to add server-side delete). (From your earlier message: APIs already exist; I'm assuming a DELETE route exists or will be added separately.)

- UI patterns to mirror from `activities`:
  - `createActivity/page.js` uses a client-side module with a shared `FormData` flow and multipart/form-data submission via axios client.
  - Create/Edit pages include file inputs for images, client-side size/type checks, field validation, and show errors with `ErrorAlert`. Buttons use the `router.push(...)` navigation and toast/update contexts.

## Assumptions & agreed constraints
- We'll implement exactly the fields defined in the Prisma model section above and match API requirements.
- Image upload will use the existing API (multipart/form-data) which handles Supabase uploads — the client must send file input named `image`.
- Redirect after successful create/edit/delete: `/admin/products` (per your instruction).
- Only client-side validation required; server already validates required fields and image upload behavior.
- Edit route will follow the activities pattern: nested under `viewProduct/[id]/edit`.

## Implementation plan (story + tasks)
This file documents tasks, acceptance criteria (AC), and the order we'll implement them. Tasks are grouped so we can iterate quickly and verify behavior.

### 1 — Create file/folder skeleton
- Path: `src/app/admin/(logged_in)/products/`
  - `createProduct/page.js` — Create page (client) with `ProductForm` integration.
  - `viewProduct/[id]/page.js` — View page for a single product.
  - `viewProduct/[id]/edit/page.js` — Edit page that reuses `ProductForm`.
  - `components/ProductForm.js` — Reusable form component used by create & edit.
  - `components/ProductCard.js` — Display product details on view page.

ACs:

- [x] All page paths and component files created in the correct directory with placeholder exports.

### 2 — Implement `ProductForm` (core)

Responsibilities:

- Render fields: Image (file), Title (required), Summary (optional), Description (required), Price (required), Category (text input, required), Featured (checkbox).
- Client-side validation:
  - Title, Description, Price, Category, Image (image required on create) checked.
  - Price must be numeric and > 0.
  - Image must be of allowed types (jpeg/png) and <= `MAX_IMAGE_SIZE_MB` (use same constant as activities).
- For create: ensure `image` is required. For edit: `image` optional (if not provided, server retains old image).
- Form submit: build FormData exactly like `activities/createActivity` does and send with axios to API endpoints (POST for create, PATCH to `/api/admin/products?productId=<id>` for edit).
- Expose an onSuccess callback so pages can redirect to `/admin/products`.

ACs:

- [x] ProductForm validates inputs and prevents submit if invalid.
- [x] ProductForm constructs FormData with the `image` file key when present.
- [x] ProductForm can be used for both create and edit (prefills values when `initialValues` prop present).

### 3 — Create page

Responsibilities:

- Use `ProductForm` in `createProduct/page.js` (client component).
- On submit, POST to `/api/admin/products` with multipart/form-data as the API expects.
- Show loading, inline form errors using existing `ErrorAlert` pattern, success toast, then redirect to `/admin/products`.

ACs:

- [x] Creating a product with valid data uploads image, creates product, and redirects to `/admin/products`.
- [x] Error responses from API render in the UI.

### 4 — View product page

Responsibilities:

- Fetch product by id via `GET /api/admin/products?page=...` or custom `getById` server helper — follow same pattern as `activities/viewActivity` (client-side fetching against admin product context or direct axios call on mount).
- Display `ProductCard` with product image, title, price, category, summary/description, createdAt/updatedAt.
- Provide action: Edit (navigate to `/admin/products/viewProduct/<id>/edit`).

ACs:

- [x] Product details render correctly.
- [x] Edit navigates to the nested edit page.

### 5 — Edit page

Responsibilities:

- Fetch product by id, prefill `ProductForm` with existing values.
- Allow updating fields and optionally replacing the image.
- Submit via PATCH `/api/admin/products?productId=<id>` as multipart/form-data.
- On success, redirect to `/admin/products`.

ACs:

- [x] Editing a product updates fields and redirects to `/admin/products`.
- [x] If a new image is uploaded, the server replaces the image and removes the old one (server handles removal; client only uploads file when chosen).

### 6 — Styling, accessibility & responsive layout

- Mirror classes and layout from `activities` forms (Tailwind + component patterns), ensure inputs are accessible and keyboard-focusable.

ACs:

- [ ] Forms are responsive and match the look-and-feel used in activities pages.

### 7 — Smoke tests & manual checklist

Manual/automated checks:

- [ ] Create product with valid image and required fields — accepts and redirects.
- [ ] Attempt create with missing required fields — client prevents submit and shows messages.
- [ ] Edit product to change text fields only (no image) — updates succeed.
- [ ] Edit product with an image replacement — new image appears in product card and old image removal attempted on server.

## Implementation details & small contract

- Inputs to form: image (file), title, summary, description, price (string/decimal), category (string), isFeatured (boolean).
- Output: POST returns created product; PATCH returns updated product. After success redirect to `/admin/products`.
- Error modes: network error, server validation error (render message), image validation error.

## Notes / follow-ups

- If you want the UI to go to the product view page instead of list after create/edit, we can change the redirect; you requested redirect to `/admin/products`, so that's implemented now.
- Optional UX improvements later: client-side image preview, drag-drop upload, and category autocomplete (fetch categories list). Those are low-risk extras.

---

## Tasks (checklist)

- [x] Create file/folder skeleton under `src/app/admin/(logged_in)/products/`.
- [x] Implement `ProductForm.js` with client-side validation and FormData submission helper.
- [x] Implement `createProduct/page.js` wiring ProductForm -> POST and redirect to `/admin/products`.
- [x] Implement `viewProduct/[id]/page.js` to render ProductCard and link to the edit flow.
- [x] Implement `viewProduct/[id]/edit/page.js` wiring ProductForm -> PATCH and redirect to `/admin/products`.
- [ ] Styling & responsive polish.
- [ ] Manual smoke tests (create/edit flows).
