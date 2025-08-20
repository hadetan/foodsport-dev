import { NextResponse } from "next/server";
import { getById } from "@/lib/prisma/db-utils";
import { formatDbError } from "@/utils/formatDbError";

// GET /api/activities/[id] - Get activity details by ID
export async function GET(req, { params }) {
    try {
        const { id } = params;
        if (!id) {
            return NextResponse.json(
                { error: "Activity ID is required" },
                { status: 400 }
            );
        }
        const activity = await getById("activity", id, {
            id: true,
            title: true,
            description: true,
            activityType: true,
            location: true,
            startDate: true,
            endDate: true,
            startTime: true,
            endTime: true,
            status: true,
            participantLimit: true,
            organizerId: true,
            imageUrl: true,
            pointsPerParticipant: true,
            caloriesPerHour: true,
            isFeatured: true,
            createdAt: true,
            updatedAt: true,
        });
        if (!activity) {
            return NextResponse.json(
                { error: "Activity not found" },
                { status: 404 }
            );
        }
        return NextResponse.json({ activity });
    } catch (error) {
        return NextResponse.json(
            { error: formatDbError(error, "Failed to fetch activity details") },
            { status: 500 }
        );
    }
}
