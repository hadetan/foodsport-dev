import { locales } from "@/i18n/config";

export const LOCALE_PATTERN = locales.map((l) => l.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|');