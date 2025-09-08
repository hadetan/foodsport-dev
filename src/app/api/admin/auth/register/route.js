import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/db';
import { requireAdmin } from '@/lib/prisma/require-admin';
import { createServerClient } from '@/lib/supabase/server-only';

// POST /api/admin/register
export async function POST(req) {
	const supabase = await createServerClient();
	const { error } = await requireAdmin(supabase, NextResponse);
	if (error) return error;

	let body;
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
	}
	const { name, email, password } = body;
	if (!name || !email || !password) {
		return NextResponse.json(
			{ error: 'Name, email, and password are required.' },
			{ status: 400 }
		);
	}

	try {
		const existingAdmin = await prisma.adminUser.findUnique({ where: { email } });
		if (existingAdmin) {
			return NextResponse.json({ error: 'Email already exists.' }, { status: 400 });
		}
	} catch (checkError) {
		console.error('Failed to check existing admin:', checkError);
	}

	const { data: signUpData, error: signUpError } =
		await supabase.auth.admin.createUser({
			email,
			password,
			email_confirm: true,
		});
	if (signUpError) {
		let msg = 'Failed to create admin user.';
		if (
			signUpError.message &&
			signUpError.message.toLowerCase().includes('already')
		) {
			msg = 'Email already exists.';
		}
		return NextResponse.json({ error: msg }, { status: 400 });
	}

	try {
		await prisma.adminUser.create({
			data: {
				id: signUpData.user.id,
				name,
				email,
				status: 'active',
			},
		});
	} catch (prismaError) {
		console.log('Failed to create admin: ', prismaError.message);
	}

	return NextResponse.json({
		message: 'Admin user created successfully.',
	});
}
