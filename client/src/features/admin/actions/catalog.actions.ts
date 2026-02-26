'use server';

import { revalidatePath } from 'next/cache';
import { getCatalogConfig, writeCatalogConfig } from '@/lib/content';
import { requireAdmin } from '@/lib/admin-auth';
import type { CatalogConfig } from '@/lib/content';

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

    await writeCatalogConfig(config);
    revalidatePath('/');
    return { success: true };
  } catch {
    return { success: false, error: 'Invalid JSON format' };
  }
}

export async function loadCatalogConfig(): Promise<CatalogConfig> {
  await requireAdmin();
  return await getCatalogConfig();
}
