export function buildImageUrl(src) {
  if (!src) return null;
  try {
    // If it's already absolute, return as-is
    if (/^https?:\/\//i.test(src)) return src;
  } catch (e) {
    // ignore
  }
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  return `${base}${src.startsWith('/') ? '' : '/'}${src}`;
}
