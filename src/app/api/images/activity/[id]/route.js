import { NextResponse } from 'next/server';
import { getActivityForShare } from '@/lib/social-share/utils';
import { toAbsoluteImageUrl } from '@/lib/social-share/metadata-helpers';
import { isSafeImageUrl, getAllowedImageOriginsFromEnv } from '@/lib/ssrf-protection';

const IMAGE_CACHE_SECONDS = 60 * 60; // 1 hour

export const runtime = 'nodejs';

export async function GET(_request, { params }) {
    const id = params?.id;
    if (!id) return new NextResponse('Missing activity id', { status: 400 });

    const activity = await getActivityForShare(id);
    if (!activity) return new NextResponse('Activity not found', { status: 404 });

    const imageCandidate = activity.bannerImageUrl || activity.imageUrl;
    const absoluteImageUrl = toAbsoluteImageUrl(imageCandidate, process.env.NEXT_PUBLIC_SUPABASE_URL);
    if (!absoluteImageUrl) return new NextResponse(null, { status: 204 });

    // Validate allowed origins
    const allowedOrigins = getAllowedImageOriginsFromEnv();
    const allowed = await isSafeImageUrl(absoluteImageUrl, allowedOrigins);
    if (!allowed) return new NextResponse('Unauthorized image host', { status: 403 });

    try {
        const upstream = await fetch(absoluteImageUrl);
        if (!upstream.ok) return new NextResponse('Failed to load image', { status: 502 });
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
        console.error('activity image proxy error', error);
        return new NextResponse('Image proxy error', { status: 500 });
    }
}
