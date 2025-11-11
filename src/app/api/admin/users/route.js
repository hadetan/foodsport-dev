import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/prisma/require-admin";
import {
    getMany,
    updateById,
    getUserJoinedActivitiesWithDetails,
} from "@/lib/prisma/db-utils";
import { sanitizeData } from "@/utils/sanitize";
import { createServerClient } from "@/lib/supabase/server-only";

function parseQueryParams(searchParams) {
    return {
        search: searchParams.get("search") || "",
        status: searchParams.get("status") || "",
        page: parseInt(searchParams.get("page") || "1", 10),
        limit: parseInt(searchParams.get("limit") || "20", 10),
        sortBy: searchParams.get("sortBy") || "created_at",
        sortOrder: searchParams.get("sortOrder") === "asc" ? "asc" : "desc",
    };
}

export async function GET(req) {
    try {
        const supabase = await createServerClient();
        const { error } = await requireAdmin(supabase, NextResponse);
        if (error) return error;
        const url = new URL(req.url);
        const { searchParams } = url;
        const { search, status, page, limit, sortBy, sortOrder } =
            parseQueryParams(searchParams);
        const skip = (page - 1) * limit;
        const filters = {};
        if (search) {
            filters.OR = [
                { firstname: { contains: search, mode: "insensitive" } },
                { lastname: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
            ];
        }
        if (status) filters.isActive = status === "active";
        const options = {
            limit,
            skip,
            orderBy: {
                [sortBy === "created_at"
                    ? "createdAt"
                    : sortBy === "updated_at"
                    ? "updatedAt"
                    : sortBy]: sortOrder,
            },
        };
        const users = await getMany(
            "user",
            filters,
            {
                id: true,
                email: true,
                firstname: true,
                lastname: true,
                dateOfBirth: true,
                gender: true,
                district: true,
                phoneNumber: true,
                profilePictureUrl: true,
                totalCaloriesDonated: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                height: true,
                weight: true,
                totalCaloriesBurned: true,
            },
            options
        );

        const tempUsers = await getMany(
            "tempUser",
            {},
            {
                id: true,
                email: true,
                firstname: true,
                lastname: true,
                dateOfBirth: true,
                createdAt: true,
                updatedAt: true,
                height: true,
                weight: true,
                totalCaloriesBurned: true,
            }
        );

        const tempUsersWithActivities = await Promise.all(
            (tempUsers || []).map(async (u) => {
                try {
                    const joinedActivities =
                        (await getUserJoinedActivitiesWithDetails(
                            u.id,
                            true
                        )) || [];
                    return {
                        ...u,
                        joinDate: u.createdAt,
                        lastActive: u.updatedAt,
                        totalActivities: joinedActivities.length,
                        joinedActivities,
                        isRegistered: false, // Not part of app yet
                    };
                } catch {
                    return {
                        ...u,
                        joinDate: u.createdAt,
                        lastActive: u.updatedAt,
                        totalActivities: 0,
                        joinedActivities: [],
                        isRegistered: false,
                    };
                }
            })
        );

        const usersWithActivities = await Promise.all(
            (users || []).map(async (u) => {
                try {
                    const joinedActivities =
                        (await getUserJoinedActivitiesWithDetails(u.id)) || [];
                    return {
                        ...u,
                        joinDate: u.createdAt,
                        lastActive: u.updatedAt,
                        totalActivities: joinedActivities.length,
                        joinedActivities,
                        isRegistered: true,
                    };
                } catch {
                    return {
                        ...u,
                        joinDate: u.createdAt,
                        lastActive: u.updatedAt,
                        totalActivities: 0,
                        joinedActivities: [],
                        isRegistered: true,
                    };
                }
            })
        );

        const allUsers = [...usersWithActivities, ...tempUsersWithActivities];

        const responseData = {
            users: allUsers,
            pagination: {
                page,
                limit,
                total: allUsers.length,
            },
        };
        return new NextResponse(JSON.stringify(responseData), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error in GET /api/admin/users:", error);
        return new NextResponse(
            JSON.stringify({
                error: "Failed to fetch users. Please try again later.",
                message: error.message,
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}

// Takes either userId if updating user or tempUserId if updating an unregistered user
export async function PATCH(req) {
    try {
        const supabase = await createServerClient();
        const { error } = await requireAdmin(supabase, NextResponse);
        if (error) return error;

        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid JSON" },
                { status: 400 }
            );
        }

        const userId = body.userId;
        const tempUserId = body.tempUserId;

        if (!userId && !tempUserId) {
            return NextResponse.json(
                { error: "Missing userId or tempUserId" },
                { status: 400 }
            );
        }

        const allowedFields = [
            "isActive",
            "email",
            "gender",
            "height",
            "dateOfBirth",
            "phoneNumber",
            "weight",
        ];

        if (userId) {
            const existingUser = await getMany(
                "user",
                { id: userId },
                { id: true }
            );
            if (!existingUser || existingUser.length === 0) {
                return NextResponse.json(
                    { error: "User not found" },
                    { status: 404 }
                );
            }

            const updates = sanitizeData(body, allowedFields);
            if (Object.keys(updates).length === 0) {
                return NextResponse.json(
                    { error: "No valid fields to update" },
                    { status: 400 }
                );
            }

            if (updates.email) {
                const existingEmailUser = await getMany(
                    "user",
                    { email: updates.email },
                    { id: true }
                );
                const existingEmailTempUser = await getMany(
                    "tempUser",
                    { email: updates.email },
                    { id: true }
                );
                if (
                    (existingEmailUser &&
                        existingEmailUser.length > 0 &&
                        existingEmailUser[0].id !== userId) ||
                    (existingEmailTempUser && existingEmailTempUser.length > 0)
                ) {
                    return NextResponse.json(
                        { error: "Email already in use" },
                        { status: 409 }
                    );
                }
                try {
                    const supabaseAdmin = await createServerClient();
                    await supabaseAdmin.auth.admin.updateUserById(userId, {
                        email: updates.email,
                    });
                } catch (e) {
                    return NextResponse.json(
                        {
                            error: "Failed to update email in auth provider",
                            details: e.message,
                        },
                        { status: 500 }
                    );
                }
            }

            const updatedUser = await updateById("user", userId, updates);
            if (updatedUser && updatedUser.error) {
                return NextResponse.json(
                    { error: updatedUser.error },
                    { status: 500 }
                );
            }
            return NextResponse.json(updatedUser, { status: 200 });
        }

        if (tempUserId) {
            const existingTempUser = await getMany(
                "tempUser",
                { id: tempUserId },
                { id: true }
            );
            if (!existingTempUser || existingTempUser.length === 0) {
                return NextResponse.json(
                    { error: "Temp user not found" },
                    { status: 404 }
                );
            }

            const updates = sanitizeData(body, allowedFields);
            if (Object.keys(updates).length === 0) {
                return NextResponse.json(
                    { error: "No valid fields to update" },
                    { status: 400 }
                );
            }

            if (updates.email) {
                const existingEmailUser = await getMany(
                    "user",
                    { email: updates.email },
                    { id: true }
                );
                const existingEmailTempUser = await getMany(
                    "tempUser",
                    { email: updates.email },
                    { id: true }
                );
                if (
                    (existingEmailUser && existingEmailUser.length > 0) ||
                    (existingEmailTempUser &&
                        existingEmailTempUser.length > 0 &&
                        existingEmailTempUser[0].id !== tempUserId)
                ) {
                    return NextResponse.json(
                        { error: "Email already in use" },
                        { status: 409 }
                    );
                }
            }

            const updatedTempUser = await updateById(
                "tempUser",
                tempUserId,
                updates
            );
            if (updatedTempUser && updatedTempUser.error) {
                return NextResponse.json(
                    { error: updatedTempUser.error },
                    { status: 500 }
                );
            }
            return NextResponse.json(updatedTempUser, { status: 200 });
        }
    } catch (error) {
        console.error("Error in PATCH /api/admin/users:", error);
        return new NextResponse(
            JSON.stringify({
                error: "Failed to update the user. Please try again later.",
                message: error.message,
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
