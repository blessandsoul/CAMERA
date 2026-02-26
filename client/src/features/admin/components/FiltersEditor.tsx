'use client';

import { useState } from 'react';
import type { CatalogConfig, CatalogFilterConfig } from '@/lib/content';

interface FiltersEditorProps {
  config: CatalogConfig;
  setConfig: React.Dispatch<React.SetStateAction<CatalogConfig>>;
  fieldClass: string;
}

export function FiltersEditor({ config, setConfig, fieldClass }: FiltersEditorProps): React.ReactElement {
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
    <section className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="text-xs font-medium text-gray-900 uppercase tracking-wider">Filters</span>
        <button type="button" onClick={() => addFilter(activeFilterTab)} className="text-xs text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">
          + Add
        </button>
      </div>

      <div className="flex gap-1 px-4 pt-3 pb-2 overflow-x-auto">
        {filterTabCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveFilterTab(cat.id)}
            className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer whitespace-nowrap ${
              activeFilterTab === cat.id
                ? 'text-gray-900 bg-gray-100 font-medium'
                : 'text-gray-400 hover:text-gray-900'
            }`}
          >
            {cat.label.en || cat.id}
          </button>
        ))}
      </div>

      <div className="px-4 pb-3">
        <div className="grid grid-cols-12 gap-2 text-[10px] text-gray-400 uppercase tracking-wider py-1 border-b border-gray-100 mb-1">
          <div className="col-span-2">ID</div>
          <div className="col-span-2">Spec Key</div>
          <div className="col-span-2">KA</div>
          <div className="col-span-2">RU</div>
          <div className="col-span-2">EN</div>
          <div>Pri</div>
          <div></div>
        </div>

        {(config.filters[activeFilterTab] ?? []).map((filter, fIdx) => (
          <div key={`${activeFilterTab}-${fIdx}`} className="grid grid-cols-12 gap-2 items-center py-1">
            <div className="col-span-2">
              <input value={filter.id} onChange={(e) => updateFilter(activeFilterTab, fIdx, { ...filter, id: e.target.value })} className={fieldClass} />
            </div>
            <div className="col-span-2">
              <input value={filter.specKaKey} onChange={(e) => updateFilter(activeFilterTab, fIdx, { ...filter, specKaKey: e.target.value })} className={fieldClass} />
            </div>
            <div className="col-span-2">
              <input value={filter.label.ka} onChange={(e) => updateFilter(activeFilterTab, fIdx, { ...filter, label: { ...filter.label, ka: e.target.value } })} className={fieldClass} />
            </div>
            <div className="col-span-2">
              <input value={filter.label.ru} onChange={(e) => updateFilter(activeFilterTab, fIdx, { ...filter, label: { ...filter.label, ru: e.target.value } })} className={fieldClass} />
            </div>
            <div className="col-span-2">
              <input value={filter.label.en} onChange={(e) => updateFilter(activeFilterTab, fIdx, { ...filter, label: { ...filter.label, en: e.target.value } })} className={fieldClass} />
            </div>
            <div className="flex items-center gap-1">
              <input type="number" min="1" value={filter.priority} onChange={(e) => updateFilter(activeFilterTab, fIdx, { ...filter, priority: Number(e.target.value) || 1 })} className={`${fieldClass} w-10 text-center`} />
              <input type="checkbox" checked={filter.defaultExpanded ?? false} onChange={(e) => updateFilter(activeFilterTab, fIdx, { ...filter, defaultExpanded: e.target.checked })} className="w-3 h-3 accent-gray-900" title="Default expanded" />
            </div>
            <div>
              <button type="button" onClick={() => removeFilter(activeFilterTab, fIdx)} className="p-1 text-gray-300 hover:text-red-500 transition-colors cursor-pointer" aria-label="Delete filter">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        ))}

        {(config.filters[activeFilterTab] ?? []).length === 0 && (
          <p className="text-xs text-gray-400 py-4 text-center">No filters for this category.</p>
        )}
      </div>
    </section>
  );
}
