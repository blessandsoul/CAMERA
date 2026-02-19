'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { writeSiteSettings } from '@/lib/content';
import type { SiteSettings } from '@/lib/content';

async function requireAdmin(): Promise<void> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  if (session?.value !== process.env.ADMIN_SESSION_SECRET) {
    redirect('/admin');
  }
}

export async function saveSiteSettings(json: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    const settings = JSON.parse(json) as SiteSettings;

    if (!settings.contact || typeof settings.contact.phone !== 'string') {
      return { success: false, error: 'Invalid contact data' };
    }
    if (!settings.business || typeof settings.business.companyName !== 'string') {
      return { success: false, error: 'Invalid business data' };
    }

    writeSiteSettings(settings);
    revalidatePath('/');
    return { success: true };
  } catch {
    return { success: false, error: 'Invalid JSON format' };
  }
}
