'use server';

import { revalidatePath } from 'next/cache';
import { updateOrderStatus } from '@/lib/content';
import { requireAdmin } from '@/lib/admin-auth';
import type { Order } from '@/lib/content';

export async function changeOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  await requireAdmin();
  await updateOrderStatus(orderId, status);
  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);
}
