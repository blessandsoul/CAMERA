'use server';

import { revalidatePath } from 'next/cache';
import { deleteInquiry } from '@/lib/content';
import { requireAdmin } from '@/lib/admin-auth';

export async function removeInquiry(id: string): Promise<void> {
  await requireAdmin();
  await deleteInquiry(id);
  revalidatePath('/admin/inquiries');
}
