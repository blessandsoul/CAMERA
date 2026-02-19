'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { deleteInquiry } from '@/lib/content';

async function requireAdmin(): Promise<void> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  if (!session?.value || session.value !== process.env.ADMIN_SESSION_SECRET) {
    throw new Error('Unauthorized');
  }
}

export async function removeInquiry(id: string): Promise<void> {
  await requireAdmin();
  deleteInquiry(id);
  revalidatePath('/admin/inquiries');
}
