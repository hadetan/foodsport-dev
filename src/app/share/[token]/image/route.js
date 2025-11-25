import { NextResponse } from 'next/server';
import {
    findShareByToken,
    getActivityForShare,
} from '@/lib/social-share/utils';
import {
    extractActivityTarget,
    toAbsoluteImageUrl,
} from '@/lib/social-share/metadata-helpers';

const IMAGE_CACHE_SECONDS = 60 * 60;

export const runtime = 'nodejs';

export async function GET(_request, { params }) {
    const token = params?.token;
    if (!token) {
        return new NextResponse('Missing token', { status: 400 });
    }

    const share = await findShareByToken(token);
    if (!share) {
        return new NextResponse('Share not found', { status: 404 });
    }

    const target = extractActivityTarget(share.redirectUrl);
    if (!target || target.type !== 'activity') {
        return new NextResponse('Unsupported share target', { status: 404 });
    }

    const activity = await getActivityForShare(target.activityId);
    const imageCandidate = activity?.bannerImageUrl || activity?.imageUrl;
    const absoluteImageUrl = toAbsoluteImageUrl(
        imageCandidate,
        process.env.NEXT_PUBLIC_SUPABASE_URL,
    );

    if (!absoluteImageUrl) {
        return new NextResponse(null, { status: 204 });
    }

    try {
        const upstream = await fetch(absoluteImageUrl);
        if (!upstream.ok) {
            return new NextResponse('Failed to load image', { status: 502 });
        }
        const contentType = upstream.headers.get('content-type') || 'image/jpeg';
        const buffer = Buffer.from(await upstream.arrayBuffer());
        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': `public, max-age=${IMAGE_CACHE_SECONDS}`,
            },
        });
    } catch (error) {
        console.error('share image proxy error', error);
        return new NextResponse('Image proxy error', { status: 500 });
    }
}
