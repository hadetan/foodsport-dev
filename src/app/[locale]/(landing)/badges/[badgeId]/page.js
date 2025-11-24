import BadgeDetailsPage from '../../Components/BadgeDetailsPage';

export default async function BadgeDetailsRoute({ params }) {
  const awaitedParam = await params || {};
  return <BadgeDetailsPage badgeId={awaitedParam?.badgeId} />;
}
