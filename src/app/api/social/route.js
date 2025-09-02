import { prisma } from '@/lib/prisma/db.js';
import { NextResponse } from 'next/server';
import { MAX_SOCIAL_MEDIA_IMAGES } from '@/app/constants/constants';

// GET /api/admin/social/image
export async function GET() {
    try {
        const images = await prisma.socialMediaImage.findMany({
            take: MAX_SOCIAL_MEDIA_IMAGES,
            orderBy: { id: 'asc' },
            select: { id: true, imageUrl: true, socialMediaUrl: true },
        });
        if (!images.length) {
            return NextResponse.json({ images: [], message: 'No images found' });
        }
        const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        return NextResponse.json({
            images: images.map(img => ({
                id: img.id,
                imageUrl: baseUrl + img.imageUrl,
                socialMediaUrl: img.socialMediaUrl
            }))
        });
    } catch (error) {
        console.error('Error in GET /api/admin/social:', error);
        return new NextResponse(
            JSON.stringify({ error: 'Failed to fetch social media images. Please try again later.', message: error.message }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}