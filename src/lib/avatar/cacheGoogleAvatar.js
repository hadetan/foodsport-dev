import { prisma } from '@/lib/prisma/db';
import { createServerClient } from '@/lib/supabase/server-only';

/**
 * Fetches a Google avatar (if needed) and stores it in Supabase storage, updating the user.
 * Idempotent: if already cached (i.e. URL no longer points to googleusercontent) it returns early.
 * Returns the (possibly new) profilePictureUrl or null on failure.
 */
export async function cacheGoogleAvatar(userId, currentUrl) {
  try {
    if (!userId || !currentUrl) return currentUrl;
    if (!currentUrl.includes('googleusercontent.com')) return currentUrl; // already local or other remote

    const supabase = await createServerClient();

    // Re-check latest user (avoid race) - maybe already cached.
    const latest = await prisma.user.findUnique({ where: { id: userId }, select: { profilePictureUrl: true }});
    if (latest?.profilePictureUrl && !latest.profilePictureUrl.includes('googleusercontent.com')) {
      return latest.profilePictureUrl;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s fetch guard

    const res = await fetch(currentUrl, { signal: controller.signal, headers: { 'User-Agent': 'FoodSportAvatarFetcher/1.0' } });
    clearTimeout(timeout);

    if (!res.ok) {
      // If 404/429 etc. just return original; caller can decide to retry later.
      return currentUrl;
    }
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const bucket = 'profile-pictures';
    const fileName = `${userId}-google-${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, buffer, {
      upsert: true,
      contentType: res.headers.get('content-type')?.split(';')[0] || 'image/jpeg',
      cacheControl: '31536000'
    });
    if (uploadError) {
      return currentUrl; // fallback silently
    }

    const storedPath = `/storage/v1/object/public/${bucket}/${fileName}`;
    await prisma.user.update({ where: { id: userId }, data: { profilePictureUrl: storedPath }});
    return storedPath;
  } catch (e) {
    return currentUrl; // swallow to avoid breaking profile load
  }
}
