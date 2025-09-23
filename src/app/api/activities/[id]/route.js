import { NextResponse } from 'next/server';
import { getById } from '@/lib/prisma/db-utils';

export async function GET(_req, { params }) {
  try {
    const awaitedParams = await params;
    const { id } = awaitedParams || {};
    if (!id) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing activity id' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const activity = await getById('activity', id, {
      id: true,
      title: true,
      titleZh: true,
      description: true,
      descriptionZh: true,
      summary: true,
      summaryZh: true,
      imageUrl: true,
      organizationName: true,
      status: true,
    });

    if (!activity || activity.status === 'draft') {
      return new NextResponse(
        JSON.stringify({ error: 'Activity not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new NextResponse(
      JSON.stringify({ activity }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in GET /api/activities/[id]:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch activity', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
