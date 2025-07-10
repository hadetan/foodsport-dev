import activities from '@/data/activities';
import Image from 'next/image';

export default async function ActivityDetailPage({ params }) {
  const param = await params;
  const activity = activities.find((a) => a.id === param.id);
  if (!activity) return <div>Activity not found.</div>;
  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001' }}>
      <Image src={activity.image} alt={activity.activity} width={700} height={300} style={{ objectFit: 'cover', borderRadius: 8 }} />
      <h1 style={{ margin: '24px 0 8px', fontSize: '2.5rem' }}>{activity.activity}</h1>
      <h2 style={{ margin: '0 0 16px', color: '#888' }}>{activity.chinese_title}</h2>
      <p style={{ marginBottom: 16 }}>{activity.english_description}</p>
      <div><b>Date:</b> {activity.dates}</div>
      <div><b>Time:</b> {activity.time}</div>
      <div><b>Location:</b> {activity.location}</div>
    </div>
  );
}
