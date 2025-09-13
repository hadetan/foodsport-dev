# i18n Extensibility Notes

Guidelines for adding new locales or evolving localized data structures.

## Adding a New UI Locale
1. Add locale code to `locales` array in `src/i18n/config.js` (keep `defaultLocale` unchanged unless deliberate).
2. Create `src/i18n/messages/<locale>.json` mirroring existing namespace structure.
3. (Optional) If locale needs region variant (e.g. `fr-CA`), prefer full tag for clarity.
4. Run manual checklist (`docs/i18n/testing-checklist.md`).

## Namespacing Conventions
- Keep top-level namespaces stable: `HomePage`, `ActivityItem`, `Landing`, etc.
- Group related UI components together to minimize churn.
- Avoid deeply nested keys (>3 levels) to reduce maintenance complexity.

## Dynamic Content Strategy
Current approach: Denormalized columns (`titleZh`, `descriptionZh`, `summaryZh`).

### Pros
- Simple queries, no joins.
- Straightforward fallback logic.

### Cons
- Schema grows with each new language.
- Hard to support arbitrary languages at runtime.

### Alternative (Future) Translation Table
```
ActivityTranslation: {
  id, activityId (FK), locale (string), title, description, summary, createdAt, updatedAt
}
```
Migration path:
1. Create translation table alongside existing columns.
2. Backfill from existing English + Chinese columns.
3. Update API to read from table (fallback: English -> first available).
4. Remove per-language columns after verification.

## Adding a New Localized Field
Example: `summary`.
1. Add `summary` (English) + `summaryZh` (Chinese) columns.
2. Extend localization helper `localizeActivity` to map it.
3. Update seed script if needed.
4. Add UI usage with translation fallback.

## SEO Adjustments for More Locales
- `buildAlternateLinkTags` consumes `locales` array automatically.
- Ensure each new locale page is statically generatable if needed for performance.

## Middleware Maintenance
- Update locale regex fragments: `/(en|zh-HK)/` → build dynamically from `locales` if list grows.
- Consider building a precompiled regex: `new RegExp('^/(' + locales.join('|') + ')(/|$)')`.

## Testing New Locales
- Duplicate relevant checklist rows with new locale code.
- Ensure Accept-Language mapping: extend detection logic for new languages.

## Time Zones & Formatting
- For now hard-coded `timeZone='Asia/Hong_Kong'` in provider. Consider dynamic mapping per locale later.

## Message File Size Management
- Split oversized namespaces once a single namespace exceeds ~150 lines.
- Lazy-load rarely used namespaces when next-intl supports granular loading.

## Caching Considerations
- If server rendering heavy dynamic pages, consider caching localized API responses keyed by `(locale, resourceId)`.

## Monitoring & Observability
- Add logging (debug mode) for middleware locale decisions if anomalies appear in analytics.

---
_Last updated: 2025-09-12_
