import { prisma } from '@/lib/prisma/client.js';
import { requireAdmin } from '@/lib/prisma/require-admin.js';
import { supabase } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const MAX_SOCIAL_MEDIA_IMAGES = 5;

/**pos
 * GET /api/admin/social/image
 * Returns up to MAX_SOCIAL_MEDIA_IMAGES images for the admin social media section.
 */
export async function GET() {
    const { error } = await requireAdmin(supabase, NextResponse);
    if (error) return error;

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
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch images', details: err.message }, { status: 500 });
    }
}

/**
 * POST /api/admin/social/image
 * Uploads a new image or updates an existing one for the admin social media section.
 * Handles file upload to Supabase storage and database record creation/update.
 */
export async function POST(request) {
    const { error } = await requireAdmin(supabase, NextResponse);
    if (error) return error;

    const { searchParams } = new URL(request.url);

    const formData = await request.formData();
    const file = formData.get('file');
    const id = searchParams.get('id');
    const socialMediaUrl = formData.get('socialMediaUrl');
    if (!file) {
        return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }
    if (!socialMediaUrl) {
        return NextResponse.json({ error: 'No social link provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const bucket = 'social-media-images';
    const cleanName = file.name.replace(/\s+/g, '-');
    const fileName = `${Date.now()}-${cleanName}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, buffer, { upsert: true, contentType: file.type });
    if (uploadError) {
        return NextResponse.json({ error: 'Image upload failed', details: uploadError.message }, { status: 500 });
    }
    const imageUrl = `/storage/v1/object/public/${bucket}/${fileName}`;

    let result;
    if (id) {
        const existing = await prisma.socialMediaImage.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: 'Image not found for update' }, { status: 404 });
        }
        if (existing.imageUrl && existing.imageUrl !== imageUrl) {
            const oldUrlParts = existing.imageUrl.split('/');
            const oldFileName = oldUrlParts[oldUrlParts.length - 1];
            await supabase.storage.from(bucket).remove([oldFileName]);
        }
        result = await prisma.socialMediaImage.update({
            where: { id },
            data: { imageUrl, socialMediaUrl },
        });
    } else {
        const count = await prisma.socialMediaImage?.count();
        if (count >= MAX_SOCIAL_MEDIA_IMAGES) {
            return NextResponse.json({ error: 'Maximum number of images reached' }, { status: 400 });
        }
        result = await prisma.socialMediaImage.create({
            data: { imageUrl, socialMediaUrl },
        });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return NextResponse.json({ success: true, image: { id: result.id, imageUrl: baseUrl + result.imageUrl, socialMediaUrl: result.socialMediaUrl } });
}

/**
 * DELETE /api/admin/social/image?id={id}
 * Removes image by id and deletes the file from Supabase Storage.
 */
export async function DELETE(request) {
    const { error } = await requireAdmin(supabase, NextResponse);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
        return NextResponse.json({ error: 'Image id is required' }, { status: 400 });
    }

    const image = await prisma.socialMediaImage.findUnique({ where: { id } });
    if (!image) {
        return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const bucket = 'social-media-images';
    const urlParts = image.imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];

    const { error: deleteError } = await supabase.storage.from(bucket).remove([fileName]);
    if (deleteError) {
        return NextResponse.json({ error: 'Failed to delete image from storage', details: deleteError.message }, { status: 500 });
    }

    await prisma.socialMediaImage.delete({ where: { id } });

    return NextResponse.json({ success: true });
}