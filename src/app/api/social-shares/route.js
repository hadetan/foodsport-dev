import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-only';
import { requireUser } from '@/lib/prisma/require-user';
import { prisma } from '@/lib/prisma/db';
import { randomUUID } from 'crypto';
import { getBaseAppUrl, sanitizeRedirectUrl } from '@/lib/social-share/utils';

function generateShareToken() {
    return randomUUID().replace(/-/g, '');
}

export async function POST(request) {
    const supabase = await createServerClient();
    const { error, user } = await requireUser(supabase, NextResponse, request);
    if (error) {
        return error;
    }

    let payload = {};
    try {
        payload = await request.json();
    } catch (err) {
        payload = {};
    }

    const redirectUrl = sanitizeRedirectUrl(payload?.redirectUrl);
    const token = generateShareToken();

    const share = await prisma.socialShare.create({
        data: {
            userId: user.id,
            token,
            redirectUrl,
        },
    });

    const baseUrl = getBaseAppUrl();
    const shareUrl = `${baseUrl}/share/${share.token}`;

    return NextResponse.json({ shareUrl, token: share.token });
}
