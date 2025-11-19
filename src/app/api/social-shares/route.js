import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-only';
import { requireUser } from '@/lib/prisma/require-user';
import { prisma } from '@/lib/prisma/db';
import { randomUUID } from 'crypto';

const DEFAULT_REDIRECT_PATH = '/';

function getBaseAppUrl() {
    const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return base.endsWith('/') ? base.slice(0, -1) : base;
}

function sanitizeRedirectUrl(candidate) {
    const baseUrl = getBaseAppUrl();
    const fallback = `${baseUrl}${DEFAULT_REDIRECT_PATH}`;
    if (!candidate || typeof candidate !== 'string') {
        return fallback;
    }

    try {
        const resolved = new URL(candidate, baseUrl);
        const allowedOrigin = new URL(baseUrl).origin;
        if (resolved.origin !== allowedOrigin) {
            return fallback;
        }
        return resolved.toString();
    } catch (error) {
        console.warn('Invalid redirectUrl provided for social share:', error.message);
        return fallback;
    }
}

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
