# Admin Area Localization Exclusion

The `/admin` section is intentionally excluded from the locale segment routing and **must never** be accessed under a locale-prefixed path.

## Rationale
- Admin UI is internal and English-only for now.
- Avoids unnecessary bundle/message loading for privileged area.
- Prevents conflicting middleware auth + locale redirects.

## Enforcement
1. Middleware bypasses any path starting with `/admin`.
2. If a user manually visits a locale-prefixed admin path (e.g. `/en/admin`, `/zh-HK/admin/users`), middleware now redirects to the locale-less equivalent (`/admin`, `/admin/users`).
3. No `next-intl` provider wraps the admin layout.

## Do / Don't
| Action | Result |
|--------|--------|
| Visit `/admin` | Allowed (no localization) |
| Visit `/en/admin` | Redirect to `/admin` |
| Import `useTranslations` inside admin component | Avoid (not provided) |
| Add messages for admin | Not required |

## Future
If admin localization is later required:
- Remove redirect block in `middleware.js`.
- Add an `admin` namespace to messages.
- Wrap admin layout with `NextIntlClientProvider` selectively.

---
_Last updated: 2025-09-12_
