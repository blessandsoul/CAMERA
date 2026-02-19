'use client';

import { useLocale } from 'next-intl';
import { FilterCheckboxGroup } from './FilterCheckboxGroup';
import type { FilterFieldConfig } from '@/lib/constants/filter-config';
import type { SpecValueOption } from '@/lib/content';

interface DynamicFilterSectionProps {
  filterConfigs: FilterFieldConfig[];
  availableValues: Record<string, SpecValueOption[]>;
}

export function DynamicFilterSection({
  filterConfigs,
  availableValues,
}: DynamicFilterSectionProps): React.ReactElement | null {
  const locale = useLocale();

  const visibleConfigs = filterConfigs.filter(
    (config) => (availableValues[config.id]?.length ?? 0) > 0,
  );

  if (visibleConfigs.length === 0) return null;

  return (
    <div className="space-y-4">
      {visibleConfigs.map((config) => (
        <FilterCheckboxGroup
          key={config.id}
          label={config.label[locale as keyof typeof config.label] ?? config.label.ka}
          paramKey={config.id}
          options={availableValues[config.id] ?? []}
          defaultExpanded={config.defaultExpanded}
        />
      ))}
    </div>
  );
}
