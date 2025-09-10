import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-only';
import { prisma } from '@/lib/prisma/db';
import { requireUser } from '@/lib/prisma/require-user';

function pickNameParts(user) {
	const md = user?.user_metadata || {};
	const fullName = md.name || md.full_name || md.display_name;
	const firstname = md.given_name || (fullName ? fullName.split(' ')[0] : null);
	const lastname = md.family_name || (fullName ? fullName.split(' ').slice(1).join(' ') : null);
	return { firstname, lastname };
}

function pickAvatar(user) {
	const md = user?.user_metadata || {};
	return md.picture || md.avatar_url || user?.user_metadata?.picture || null;
}

export async function POST(req) {
	const supabase = await createServerClient();
	const { error: authErr } = await requireUser(supabase, NextResponse);
	if (authErr) return authErr;

	try {
		const body = await req.json().catch(() => ({}));
		const origin = req.headers.get('origin') || '';
		const referer = req.headers.get('referer') || '';
		const redirectTo = body.redirectTo || (origin || referer ? `${origin || new URL(referer).origin}/my` : undefined);
        if (typeof supabase.auth.linkIdentity !== 'function') {
            return Response.json({ ok: false, reason: 'link_identity_not_supported' });
        }
        const { data, error } = await supabase.auth.linkIdentity({ provider: 'google', options: { redirectTo } });
        if (error) {
            return Response.json({ ok: false, reason: 'link_identity_failed', details: error.message });
        }
        return Response.json({ ok: true, url: data?.url });
	} catch (err) {
		return Response.json({ error: 'Failed to start linking', details: err.message }, { status: 500 });
	}
}

export async function PUT() {
	const supabase = await createServerClient();
	const { error } = await requireUser(supabase, NextResponse);
	if (error) return error;

	try {
		const { data: { user: sbUser }, error: uErr } = await supabase.auth.getUser();
        if (uErr || !sbUser) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

		const hasGoogle = Array.isArray(sbUser.identities)
			? sbUser.identities.some((i) => i.provider === 'google')
			: false;
        if (!hasGoogle) {
            return Response.json({ ok: false, reason: 'not_linked_yet' });
        }

		const conflict = await prisma.user.findFirst({
			where: { googleId: sbUser.id, NOT: { id: sbUser.id } },
			select: { id: true },
		});
        if (conflict) {
            return Response.json({ ok: false, reason: 'google_id_conflict' });
        }

		const updates = {
			googleId: sbUser.id,
			emailVerified: true,
		};
		const { firstname, lastname } = pickNameParts(sbUser);
		const avatar = pickAvatar(sbUser);
		if (firstname) updates.firstname = updates.firstname ?? firstname;
		if (lastname) updates.lastname = updates.lastname ?? lastname;
		if (avatar) updates.profilePictureUrl = updates.profilePictureUrl ?? avatar;

		const updated = await prisma.user.update({ where: { id: sbUser.id }, data: updates });

		try {
			await prisma.preProfile.deleteMany({ where: { supabaseUserId: sbUser.id } });
		} catch {}

		return Response.json({ ok: true, linked: true, user: { id: updated.id, email: updated.email } });
	} catch (err) {
		return Response.json({ error: 'Failed to finalize linking', details: err.message }, { status: 500 });
	}
}

