import BadgeDetailsPage from '../../Components/BadgeDetailsPage';

export default function BadgeDetailsRoute({ params }) {
  const badgeId = params?.badgeId || '';
  return <BadgeDetailsPage badgeId={badgeId} />;
}
