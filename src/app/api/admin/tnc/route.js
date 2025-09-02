import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/prisma/require-admin';
import { createServerClient } from '@/lib/supabase/server-only';
import { prisma } from '@/lib/prisma/db';

// GET /api/admin/tnc
export async function GET(_) {
	try {
		const supabase = await createServerClient();
		const { error } = await requireAdmin(supabase, NextResponse);
		if (error) return error;

		const tncsRaw = await prisma.tnc.findMany({
			select: {
				id: true,
				title: true,
				description: true,
				adminUserId: true,
				updatedBy: true,
				createdAt: true,
				updatedAt: true,
			},
			orderBy: { createdAt: 'desc' },
		});

		const adminIds = [
			...new Set([
				...tncsRaw.map(tnc => tnc.adminUserId).filter(Boolean),
				...tncsRaw.map(tnc => tnc.updatedBy).filter(Boolean),
			]),
		];
		const admins = adminIds.length > 0
			? await prisma.adminUser.findMany({
				where: { id: { in: adminIds } },
				select: { id: true, name: true },
			})
			: [];
		const adminMap = Object.fromEntries(admins.map(a => [a.id, a.name]));

		const tncs = tncsRaw.map(tnc => ({
			...tnc,
			createdBy: tnc.adminUserId ? adminMap[tnc.adminUserId] || null : null,
			updatedBy: tnc.updatedBy ? adminMap[tnc.updatedBy] || null : null,
		}));

		return NextResponse.json({ tncs }, { status: 200 });
	} catch (err) {
		console.error('Error in GET /api/admin/tnc:', err);
		return new NextResponse(
			JSON.stringify({ error: 'Failed to fetch TNCs. Please try again later.', message: err.message }),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	}
}

// POST /api/admin/tnc
export async function POST(req) {
	try {
		const supabase = await createServerClient();
		const { error } = await requireAdmin(supabase, NextResponse);
		if (error) return error;

		let body;
		try {
			body = await req.json();
		} catch {
			return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
		}

		const { title, description } = body;
		if (!title || !description) {
			return NextResponse.json({ error: 'Title and description are required.' }, { status: 400 });
		}

        const existing = await prisma.tnc.findFirst({ 
            where: { 
                title: { 
                    equals: title,
                    mode: 'insensitive'
                }
            }
        });
		if (existing) {
			return NextResponse.json({ error: 'A TNC with this title already exists.' }, { status: 409 });
		}

		const { data: { user } } = await supabase.auth.getUser();
		let adminUserId = null;
		if (user && user.email) {
			const admin = await prisma.adminUser.findUnique({ where: { email: user.email }, select: { id: true } });
			if (admin) adminUserId = admin.id;
		}

		const tnc = await prisma.tnc.create({
			data: {
				title,
				description,
				adminUserId,
			},
			select: {
				id: true,
				title: true,
				description: true,
				adminUserId: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		let adminName = null;
		if (adminUserId) {
			const admin = await prisma.adminUser.findUnique({ where: { id: adminUserId }, select: { name: true } });
			if (admin) adminName = admin.name;
		}
		tnc.createdBy = adminName;

		return NextResponse.json({ tnc }, { status: 201 });
	} catch (err) {
		console.error('Error in POST /api/admin/tnc:', err);
		return new NextResponse(
			JSON.stringify({ error: 'Failed to create TNC. Please try again later.', message: err.message }),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	}
}

// PATCH /api/admin/tnc/:id
export async function PATCH(req) {
	try {
		const supabase = await createServerClient();
		const { error } = await requireAdmin(supabase, NextResponse);
		if (error) return error;

		let body;
		try {
			body = await req.json();
		} catch {
			return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
		}

		const url = new URL(req.url);
		const tncId = url.searchParams.get('id');
		if (!tncId) {
			return NextResponse.json({ error: 'TNC id is required in query string.' }, { status: 400 });
		}

		const { title, description } = body;
		if (!title && !description) {
			return NextResponse.json({ error: 'At least one of title or description must be provided.' }, { status: 400 });
		}

		const { data: { user } } = await supabase.auth.getUser();
		let updatedBy = null;
		if (user && user.email) {
			const admin = await prisma.adminUser.findUnique({ where: { email: user.email }, select: { id: true } });
			if (admin) updatedBy = admin.id;
		}

        if (title) {
            const existing = await prisma.tnc.findFirst({ 
                where: { 
                    title: { 
                        equals: title,
                        mode: 'insensitive'
                    }, 
                    id: { not: tncId } 
                }
            });
            if (existing) {
                return NextResponse.json({ error: 'A TNC with this title already exists.' }, { status: 409 });
            }
        }

		const updateData = {};
		if (title) updateData.title = title;
		if (description) updateData.description = description;
		updateData.updatedBy = updatedBy;

        let tnc;
        try {
            tnc = await prisma.tnc.update({
                where: { id: tncId },
                data: updateData,
                select: {
                    id: true,
                    title: true,
                    description: true,
                    adminUserId: true,
                    updatedBy: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
        } catch (updateError) {
            if (updateError.code === 'P2025') {
                return NextResponse.json({ error: 'TNC not found.' }, { status: 404 });
            }
            throw updateError;
        }

		let adminName = null;
		let updatedByName = null;
		if (tnc.adminUserId) {
			const admin = await prisma.adminUser.findUnique({ where: { id: tnc.adminUserId }, select: { name: true } });
			if (admin) adminName = admin.name;
		}
		if (tnc.updatedBy) {
			const updater = await prisma.adminUser.findUnique({ where: { id: tnc.updatedBy }, select: { name: true } });
			if (updater) updatedByName = updater.name;
		}
		tnc.createdBy = adminName;
		tnc.updatedBy = updatedByName;

		return NextResponse.json({ tnc }, { status: 200 });
	} catch (err) {
		console.error('Error in PATCH /api/admin/tnc:', err);
		return new NextResponse(
			JSON.stringify({ error: 'Failed to update TNC. Please try again later.', message: err.message }),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	}
}
