'use client';

import { useState } from 'react';
import { InfoTooltip } from './InfoTooltip';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { CatalogConfig, CatalogFilterConfig } from '@/lib/content';

interface FiltersEditorProps {
  config: CatalogConfig;
  setConfig: React.Dispatch<React.SetStateAction<CatalogConfig>>;
}

export function FiltersEditor({ config, setConfig }: FiltersEditorProps): React.ReactElement {
  const filterTabCategories = config.categories.filter((c) => c.id !== 'all' && c.parentCategory);
  const [activeFilterTab, setActiveFilterTab] = useState<string>(
    filterTabCategories[0]?.id ?? Object.keys(config.filters)[0] ?? 'cameras'
  );

  function updateFilter(category: string, filterIndex: number, updated: CatalogFilterConfig): void {
    setConfig((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        [category]: (prev.filters[category] ?? []).map((f, i) => (i === filterIndex ? updated : f)),
      },
    }));
  }

  function addFilter(category: string): void {
    const existing = config.filters[category] ?? [];
    const maxPriority = existing.reduce((max, f) => Math.max(max, f.priority), 0);
    setConfig((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        [category]: [
          ...(prev.filters[category] ?? []),
          {
            id: `filter-${Date.now()}`,
            specKaKey: '',
            label: { ka: '', ru: '', en: '' },
            priority: maxPriority + 1,
          },
        ],
      },
    }));
  }

  function removeFilter(category: string, filterIndex: number): void {
    setConfig((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        [category]: (prev.filters[category] ?? []).filter((_, i) => i !== filterIndex),
      },
    }));
  }

  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-xs font-medium text-foreground uppercase tracking-wider">Filters <InfoTooltip text="ფილტრები კატალოგში — მომხმარებელი ფილტრავს პროდუქტებს ამ პარამეტრების მიხედვით" /></span>
        <Button type="button" variant="ghost" size="sm" onClick={() => addFilter(activeFilterTab)}>
          + Add
        </Button>
      </div>

      <div className="flex gap-1 px-4 pt-3 pb-2 overflow-x-auto">
        {filterTabCategories.map((cat) => (
          <Button
            key={cat.id}
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => setActiveFilterTab(cat.id)}
            className={`whitespace-nowrap ${
              activeFilterTab === cat.id
                ? 'text-foreground bg-muted font-medium'
                : 'text-muted-foreground'
            }`}
          >
            {cat.label.en || cat.id}
          </Button>
        ))}
      </div>

      <div className="px-4 pb-3">
        <div className="grid grid-cols-12 gap-2 text-[10px] text-muted-foreground uppercase tracking-wider py-1 border-b border-border mb-1">
          <div className="col-span-2 flex items-center">ID <InfoTooltip text="ფილტრის უნიკალური იდენტიფიკატორი" /></div>
          <div className="col-span-2 flex items-center">Spec Key <InfoTooltip text="პროდუქტის სპეციფიკაციის გასაღები — უნდა ემთხვეოდეს პროდუქტის Spec Key KA ველს" /></div>
          <div className="col-span-2">KA</div>
          <div className="col-span-2">RU</div>
          <div className="col-span-2">EN</div>
          <div className="flex items-center">Pri <InfoTooltip text="პრიორიტეტი — რაც ნაკლებია, ზემოთ გამოჩნდება" /></div>
          <div></div>
        </div>

        {(config.filters[activeFilterTab] ?? []).map((filter, fIdx) => (
          <div key={`${activeFilterTab}-${fIdx}`} className="grid grid-cols-12 gap-2 items-center py-1">
            <div className="col-span-2">
              <Input value={filter.id} onChange={(e) => updateFilter(activeFilterTab, fIdx, { ...filter, id: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Input value={filter.specKaKey} onChange={(e) => updateFilter(activeFilterTab, fIdx, { ...filter, specKaKey: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Input value={filter.label.ka} onChange={(e) => updateFilter(activeFilterTab, fIdx, { ...filter, label: { ...filter.label, ka: e.target.value } })} />
            </div>
            <div className="col-span-2">
              <Input value={filter.label.ru} onChange={(e) => updateFilter(activeFilterTab, fIdx, { ...filter, label: { ...filter.label, ru: e.target.value } })} />
            </div>
            <div className="col-span-2">
              <Input value={filter.label.en} onChange={(e) => updateFilter(activeFilterTab, fIdx, { ...filter, label: { ...filter.label, en: e.target.value } })} />
            </div>
            <div className="flex items-center gap-1">
              <Input type="number" min="1" value={filter.priority} onChange={(e) => updateFilter(activeFilterTab, fIdx, { ...filter, priority: Number(e.target.value) || 1 })} className="w-10 text-center" />
              <Checkbox
                checked={filter.defaultExpanded ?? false}
                onCheckedChange={(checked) => updateFilter(activeFilterTab, fIdx, { ...filter, defaultExpanded: checked === true })}
                title="გახსნილი — ჩართვისას ფილტრი ავტომატურად გახსნილი იქნება კატალოგში"
              />
            </div>
            <div>
              <Button type="button" variant="ghost" size="icon-xs" onClick={() => removeFilter(activeFilterTab, fIdx)} className="text-muted-foreground hover:text-destructive" aria-label="Delete filter">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </Button>
            </div>
          </div>
        ))}

        {(config.filters[activeFilterTab] ?? []).length === 0 && (
          <p className="text-xs text-muted-foreground py-4 text-center">No filters for this category.</p>
        )}
      </div>
    </section>
  );
}
