import { prisma } from '@/lib/prisma/client';
import { supabase } from '@/lib/supabase/server';
import { requireUser } from '@/lib/prisma/require-user';

// PATCH /api/my/profile/edit - Update user profile fields
export async function PATCH(req) {
  const { error, user } = await requireUser(supabase, Response);
  if (error) return error;

  const isMultipart = req.headers.get('content-type')?.includes('multipart/form-data');

  if (isMultipart) {
    const formData = await req.formData();
    const file = formData.get('profilePicture');
    if (file && file.name) {
      const currentUser = await prisma.user.findUnique({ where: { id: user.id } });
      const oldProfilePictureUrl = currentUser?.profilePictureUrl;

      if (oldProfilePictureUrl && oldProfilePictureUrl.includes('profile-pictures/')) {
        const oldFilePath = oldProfilePictureUrl.replace('/storage/v1/object/public/profile-pictures/', '');
        await supabase.storage.from('profile-pictures').remove([oldFilePath]);
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const bucket = 'profile-pictures';
      const cleanName = file.name.replace(/\s+/g, '-');
      const fileName = `${user.id}-${Date.now()}-${cleanName}`;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, buffer, {
          upsert: true,
          contentType: file.type,
        });
      if (uploadError) {
        return Response.json({ error: 'Profile picture upload failed', details: uploadError.message }, { status: 500 });
      }
      const profilePictureUrl = `/storage/v1/object/public/${bucket}/${fileName}`;
      try {
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: { profilePictureUrl },
        });
        return Response.json({ user: updatedUser });
      } catch (err) {
        return Response.json({ error: 'Failed to update profile picture', details: err.message }, { status: 500 });
      }
    } else {
      return Response.json({ error: 'No profile picture file provided.' }, { status: 400 });
    }
  }

  const body = await req.json();
  const fields = [
    'firstname', 'lastname', 'dateOfBirth', 'weight', 'height', 'gender', 'phoneNumber',
    'title', 'bio', 'dailyGoal', 'weeklyGoal', 'monthlyGoal', 'yearlyGoal'
  ];
  let updateData = {};
  for (const field of fields) {
    let value = body[field];
    if (value !== undefined && value !== null && value !== '') {
      if ([
        'weight', 'height', 'dailyGoal', 'weeklyGoal', 'monthlyGoal', 'yearlyGoal'
      ].includes(field)) {
        value = Number(value);
        if (isNaN(value)) continue;
      }
      if (field === 'dateOfBirth') {
        value = new Date(value);
        if (isNaN(value.getTime())) continue;
      }
      updateData[field] = value;
    }
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: '7bd71551-c8b7-4a10-8dd4-3fefaa6c48d3' },
      data: updateData,
    });
    return Response.json({ user: updatedUser });
  } catch (err) {
    return Response.json({ error: 'Failed to update user profile', details: err.message }, { status: 500 });
  }
}
