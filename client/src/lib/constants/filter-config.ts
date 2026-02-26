import { getCatalogConfig } from '@/lib/content';
import type { CatalogLabel } from '@/lib/content';

export interface FilterFieldConfig {
  id: string;
  specKaKey: string;
  label: CatalogLabel;
  priority: number;
  defaultExpanded?: boolean;
}

export async function getFilterConfigs(): Promise<Record<string, FilterFieldConfig[]>> {
  const config = await getCatalogConfig();
  const result: Record<string, FilterFieldConfig[]> = {};
  for (const [category, filters] of Object.entries(config.filters)) {
    result[category] = filters.map((f) => ({
      id: f.id,
      specKaKey: f.specKaKey,
      label: f.label,
      priority: f.priority,
      defaultExpanded: f.defaultExpanded,
    }));
  }
  return result;
}

export async function getFilterConfigForCategory(category: string | undefined): Promise<FilterFieldConfig[]> {
  if (!category) return [];
  const configs = await getFilterConfigs();
  return configs[category] ?? [];
}
