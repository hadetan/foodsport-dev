import { NextResponse } from 'next/server';
import { getById, getMany } from '@/lib/prisma/db-utils';

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
      activityType: true,
      location: true,
      startDate: true,
      endDate: true,
      startTime: true,
      endTime: true,
      participantLimit: true,
      caloriesPerHour: true,
      totalCaloriesBurnt: true,
      isFeatured: true,
      mapUrl: true,
      tncId: true,
    });

    if (!activity || activity.status === 'draft') {
      return new NextResponse(
        JSON.stringify({ error: 'Activity not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // participant info
    const participantRows = await getMany('userActivity', { activityId: id }, {
      activityId: true,
      user: {
        select: {
          id: true,
          profilePictureUrl: true,
          firstname: true,
          lastname: true,
        },
      },
      tempUser: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
        },
      },
    });
    const participantCount = Array.isArray(participantRows) ? participantRows.length : 0;
    const participants = [];
    for (const row of participantRows) {
      const { user, tempUser } = row;
      if (user) {
        participants.push({
          profilePictureUrl: user.profilePictureUrl || null,
          firstname: user.firstname || null,
          lastname: user.lastname || null,
        });
      } else if (tempUser) {
        participants.push({
          profilePictureUrl: null,
          firstname: tempUser.firstname || null,
          lastname: tempUser.lastname || null,
        });
      }
    }

    // tnc mapping
    let tnc = null;
    if (activity.tncId) {
      const tncRaw = await getById('tnc', activity.tncId, { id: true, title: true, description: true });
      if (tncRaw) {
        tnc = {
          id: tncRaw.id,
          title: tncRaw.title,
          description: tncRaw.description,
        };
      }
    }

    const responseActivity = {
      id: activity.id,
      title: activity.title,
      titleZh: activity.titleZh || null,
      description: activity.description,
      descriptionZh: activity.descriptionZh || null,
      summary: activity.summary || null,
      summaryZh: activity.summaryZh || null,
      imageUrl: activity.imageUrl,
      organizationName: activity.organizationName,
      status: activity.status,
      activityType: activity.activityType,
      location: activity.location,
      startDate: activity.startDate,
      endDate: activity.endDate,
      startTime: activity.startTime,
      endTime: activity.endTime,
      participantLimit: activity.participantLimit,
      participantCount,
      participants,
      caloriesPerHour: activity.caloriesPerHour,
      totalCaloriesBurnt: activity.totalCaloriesBurnt,
      isFeatured: activity.isFeatured,
      mapUrl: activity.mapUrl,
      tnc,
    };

    return new NextResponse(
      JSON.stringify({ activity: responseActivity }),
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
