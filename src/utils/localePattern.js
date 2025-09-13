import { locales } from "@/i18n/config";

export default LOCALE_PATTERN = locales.map((l) => l.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|');