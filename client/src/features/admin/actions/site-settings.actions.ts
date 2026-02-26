'use server';

import { revalidatePath } from 'next/cache';
import { writeSiteSettings } from '@/lib/content';
import { requireAdmin } from '@/lib/admin-auth';
import type { SiteSettings } from '@/lib/content';

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

    await writeSiteSettings(settings);
    revalidatePath('/');
    return { success: true };
  } catch {
    return { success: false, error: 'Invalid JSON format' };
  }
}
