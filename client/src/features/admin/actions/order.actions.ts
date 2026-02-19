'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { updateOrderStatus } from '@/lib/content';
import type { Order } from '@/lib/content';

async function requireAdmin(): Promise<void> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  if (session?.value !== process.env.ADMIN_SESSION_SECRET) {
    redirect('/admin');
  }
}

export async function changeOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  await requireAdmin();
  updateOrderStatus(orderId, status);
  revalidatePath('/admin/orders');
}
