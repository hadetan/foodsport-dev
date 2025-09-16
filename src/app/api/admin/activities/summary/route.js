import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/prisma/require-admin';
import { getById, updateById } from '@/lib/prisma/db-utils';
import { createServerClient } from '@/lib/supabase/server-only';

// GET /api/admin/activities/summary?id=activityId
export async function GET(req) {
	const supabase = await createServerClient();
	const { error } = await requireAdmin(supabase, NextResponse);
	if (error) return error;
	const url = new URL(req.url);
	const id = url.searchParams.get('id');

	if (!id) {
		return NextResponse.json({ error: 'Missing activity id' }, { status: 400 });
	}

	const activity = await getById('activity', id, { summary: true });
	if (activity && activity.error) {
		return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
	}
	if (!activity) {
		return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
	}
	return NextResponse.json({ summary: activity.summary || '' });
}

// PATCH /api/admin/activities/summary?id=activityId
// Body: { summary: string } or { summaryZh: string }
export async function PATCH(req) {
    const supabase = await createServerClient();
    const { error } = await requireAdmin(supabase, NextResponse);
    if (error) return error;
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
        return NextResponse.json(
            { error: "Missing activity id" },
            { status: 400 }
        );
    }

    let body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const hasSummary = typeof body.summary === "string";
    const hasSummaryZh = typeof body.summaryZh === "string";

    if (!hasSummary && !hasSummaryZh) {
        return NextResponse.json(
            { error: "Missing or invalid summary/summaryZh" },
            { status: 400 }
        );
    }

    let updateData = {};
    if (hasSummary) {
        updateData.summary = body.summary;
    } else if (hasSummaryZh) {
        updateData.summaryZh = body.summaryZh;
    }

    const updated = await updateById("activity", id, updateData);

    if (updated.error) {
        return NextResponse.json({ error: updated.error }, { status: 500 });
    } else if (!updated) {
        return NextResponse.json(
            { error: "Activity not found or not updated" },
            { status: 404 }
        );
    }

    return NextResponse.json({
        summary: updated.summary,
        summaryZh: updated.summaryZh,
    });
}
