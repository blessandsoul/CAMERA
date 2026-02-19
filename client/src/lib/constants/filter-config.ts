import { getCatalogConfig } from '@/lib/content';
import type { CatalogLabel } from '@/lib/content';

export interface FilterFieldConfig {
  id: string;
  specKaKey: string;
  label: CatalogLabel;
  priority: number;
  defaultExpanded?: boolean;
}

export function getFilterConfigs(): Record<string, FilterFieldConfig[]> {
  const config = getCatalogConfig();
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

export const CATEGORY_FILTER_CONFIG: Record<string, FilterFieldConfig[]> = getFilterConfigs();

export function getFilterConfigForCategory(category: string | undefined): FilterFieldConfig[] {
  if (!category) return [];
  const configs = getFilterConfigs();
  return configs[category] ?? [];
}
