import activities from '@/app/data/activities';

export async function GET() {
  return Response.json(activities);
}

export async function POST(req) {
  const body = await req.json();
  return Response.json({ received: body, activities });
}
