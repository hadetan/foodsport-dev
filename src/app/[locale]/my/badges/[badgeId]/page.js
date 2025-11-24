import BadgeDetailsPage from '@/app/[locale]/(landing)/Components/BadgeDetailsPage';

function parseViewerContext(rawCtx) {
  if (!rawCtx) return null;
  const serialized = Array.isArray(rawCtx) ? rawCtx[0] : rawCtx;
  if (!serialized) return null;
  try {
    const decoded = decodeURIComponent(serialized);
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch (error) {
    console.warn('Failed to parse badge viewer context', error);
  }
  return null;
}

export default async function MyBadgeDetailsRoute({ params, searchParams }) {
  const badgeId = await params || '';
  const awaitedParams = await searchParams;
  const viewerContext = parseViewerContext(awaitedParams?.ctx);

  return <BadgeDetailsPage badgeId={badgeId?.badgeId} viewerContext={viewerContext} />;
}
