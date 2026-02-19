'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCatalogConfig, writeCatalogConfig } from '@/lib/content';
import type { CatalogConfig } from '@/lib/content';

async function requireAdmin(): Promise<void> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  if (session?.value !== process.env.ADMIN_SESSION_SECRET) {
    redirect('/admin');
  }
}

export async function saveCatalogConfig(configJson: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    const config = JSON.parse(configJson) as CatalogConfig;

    if (!Array.isArray(config.categories)) {
      return { success: false, error: 'Invalid categories array' };
    }
    if (typeof config.filters !== 'object' || config.filters === null) {
      return { success: false, error: 'Invalid filters object' };
    }

    writeCatalogConfig(config);
    revalidatePath('/');
    return { success: true };
  } catch {
    return { success: false, error: 'Invalid JSON format' };
  }
}

export async function loadCatalogConfig(): Promise<CatalogConfig> {
  await requireAdmin();
  return getCatalogConfig();
}
