'use client';

import { useState } from 'react';
import { saveCatalogConfig } from '@/features/admin/actions/catalog.actions';
import type { CatalogConfig, CatalogCategoryConfig, CatalogFilterConfig } from '@/lib/content';

interface Props {
  initialConfig: CatalogConfig;
}

export function CatalogSettingsEditor({ initialConfig }: Props): React.ReactElement {
  const [config, setConfig] = useState<CatalogConfig>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeFilterTab, setActiveFilterTab] = useState<string>(
    Object.keys(initialConfig.filters)[0] ?? 'cameras'
  );
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  function toggleExpanded(id: string): void {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // ── Categories ──────────────────────────────────────
  function updateCategory(index: number, updated: CatalogCategoryConfig): void {
    setConfig((prev) => ({
      ...prev,
      categories: prev.categories.map((c, i) => (i === index ? updated : c)),
    }));
  }

  function addCategory(): void {
    const id = `category-${Date.now()}`;
    setConfig((prev) => ({
      ...prev,
      categories: [
        ...prev.categories,
        { id, parentCategory: id, label: { ka: '', ru: '', en: '' } },
      ],
      filters: { ...prev.filters, [id]: [] },
    }));
    setExpandedCats((prev) => new Set(prev).add(id));
  }

  function removeCategory(index: number): void {
    const cat = config.categories[index];
    if (cat.id === 'all') return;
    setConfig((prev) => {
      const newFilters = { ...prev.filters };
      delete newFilters[cat.id];
      return {
        ...prev,
        categories: prev.categories.filter((_, i) => i !== index),
        filters: newFilters,
      };
    });
  }

  function moveCategory(index: number, direction: -1 | 1): void {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= config.categories.length) return;
    setConfig((prev) => {
      const cats = [...prev.categories];
      [cats[index], cats[newIndex]] = [cats[newIndex], cats[index]];
      return { ...prev, categories: cats };
    });
  }

  function addSubcategory(parentIndex: number): void {
    const parent = config.categories[parentIndex];
    const childId = `${parent.id}-sub-${Date.now()}`;
    const child: CatalogCategoryConfig = {
      id: childId,
      parentCategory: parent.parentCategory,
      label: { ka: '', ru: '', en: '' },
      specFilter: { kaKey: '', value: '' },
    };
    updateCategory(parentIndex, {
      ...parent,
      children: [...(parent.children ?? []), child],
    });
    setExpandedCats((prev) => new Set(prev).add(parent.id));
  }

  function updateSubcategory(parentIndex: number, childIndex: number, updated: CatalogCategoryConfig): void {
    const parent = config.categories[parentIndex];
    const newChildren = (parent.children ?? []).map((c, i) => (i === childIndex ? updated : c));
    updateCategory(parentIndex, { ...parent, children: newChildren });
  }

  function removeSubcategory(parentIndex: number, childIndex: number): void {
    const parent = config.categories[parentIndex];
    updateCategory(parentIndex, {
      ...parent,
      children: (parent.children ?? []).filter((_, i) => i !== childIndex),
    });
  }

  // ── Filters ─────────────────────────────────────────
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

  // ── Save ────────────────────────────────────────────
  async function handleSave(): Promise<void> {
    setSaving(true);
    setMessage(null);
    const result = await saveCatalogConfig(JSON.stringify(config));
    if (result.success) {
      setMessage({ type: 'success', text: 'Saved' });
    } else {
      setMessage({ type: 'error', text: result.error ?? 'Failed to save' });
    }
    setSaving(false);
  }

  const fieldClass =
    'w-full px-2 py-1 rounded-md border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors text-sm';

  const filterTabCategories = config.categories.filter((c) => c.id !== 'all' && c.parentCategory);

  return (
    <div className="flex flex-col gap-6">

      {/* ── Save bar (sticky top) ── */}
      <div className="sticky top-0 z-10 flex items-center gap-3 py-3 bg-gray-50">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-1.5 bg-gray-900 hover:bg-gray-800 active:scale-[0.98] text-white text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        {message && (
          <span className={`text-sm ${message.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
            {message.text}
          </span>
        )}
      </div>

      {/* ── Categories ── */}
      <section className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="text-xs font-medium text-gray-900 uppercase tracking-wider">Categories</span>
          <button type="button" onClick={addCategory} className="text-xs text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">
            + Add
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {config.categories.map((cat, catIdx) => {
            const isExpanded = expandedCats.has(cat.id);
            const childCount = cat.children?.length ?? 0;

            return (
              <div key={cat.id}>
                {/* Category summary row */}
                <div className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors">
                  {/* Reorder */}
                  <div className="flex flex-col shrink-0">
                    <button type="button" onClick={() => moveCategory(catIdx, -1)} className="p-0.5 text-gray-300 hover:text-gray-600 cursor-pointer" aria-label="Move up">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
                    </button>
                    <button type="button" onClick={() => moveCategory(catIdx, 1)} className="p-0.5 text-gray-300 hover:text-gray-600 cursor-pointer" aria-label="Move down">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                    </button>
                  </div>

                  {/* Expand toggle */}
                  <button type="button" onClick={() => toggleExpanded(cat.id)} className="p-0.5 text-gray-400 cursor-pointer" aria-label="Toggle details">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>

                  {/* ID + labels preview */}
                  <span className="text-xs text-gray-400 w-20 shrink-0 font-mono">{cat.id}</span>
                  <span className="text-sm text-gray-900 font-medium flex-1 truncate">{cat.label.en || cat.label.ka || '(unnamed)'}</span>
                  {childCount > 0 && (
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{childCount} sub</span>
                  )}

                  {/* Actions */}
                  {cat.id !== 'all' && (
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button type="button" onClick={() => addSubcategory(catIdx)} className="p-1 rounded text-gray-300 hover:text-gray-700 transition-colors cursor-pointer" aria-label="Add subcategory" title="Add sub">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                      </button>
                      <button type="button" onClick={() => removeCategory(catIdx)} className="p-1 rounded text-gray-300 hover:text-red-500 transition-colors cursor-pointer" aria-label="Delete category">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-4 pb-3 pt-1 bg-gray-50/50">
                    {/* Labels edit */}
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div>
                        <span className="text-[10px] text-gray-400">KA</span>
                        <input value={cat.label.ka} onChange={(e) => updateCategory(catIdx, { ...cat, label: { ...cat.label, ka: e.target.value } })} className={fieldClass} />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400">RU</span>
                        <input value={cat.label.ru} onChange={(e) => updateCategory(catIdx, { ...cat, label: { ...cat.label, ru: e.target.value } })} className={fieldClass} />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400">EN</span>
                        <input value={cat.label.en} onChange={(e) => updateCategory(catIdx, { ...cat, label: { ...cat.label, en: e.target.value } })} className={fieldClass} />
                      </div>
                    </div>

                    {/* Subcategories */}
                    {cat.children && cat.children.length > 0 && (
                      <div className="space-y-1 mt-2">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Subcategories</span>
                        {cat.children.map((child, childIdx) => (
                          <div key={child.id} className="grid grid-cols-6 gap-1.5 items-center py-1">
                            <input value={child.label.ka} onChange={(e) => updateSubcategory(catIdx, childIdx, { ...child, label: { ...child.label, ka: e.target.value } })} className={fieldClass} placeholder="KA" />
                            <input value={child.label.ru} onChange={(e) => updateSubcategory(catIdx, childIdx, { ...child, label: { ...child.label, ru: e.target.value } })} className={fieldClass} placeholder="RU" />
                            <input value={child.label.en} onChange={(e) => updateSubcategory(catIdx, childIdx, { ...child, label: { ...child.label, en: e.target.value } })} className={fieldClass} placeholder="EN" />
                            <input value={child.specFilter?.kaKey ?? ''} onChange={(e) => updateSubcategory(catIdx, childIdx, { ...child, specFilter: { kaKey: e.target.value, value: child.specFilter?.value ?? '' } })} className={fieldClass} placeholder="Spec key" />
                            <input value={child.specFilter?.value ?? ''} onChange={(e) => updateSubcategory(catIdx, childIdx, { ...child, specFilter: { kaKey: child.specFilter?.kaKey ?? '', value: e.target.value } })} className={fieldClass} placeholder="Value" />
                            <button type="button" onClick={() => removeSubcategory(catIdx, childIdx)} className="p-1 text-gray-300 hover:text-red-500 transition-colors cursor-pointer justify-self-start" aria-label="Remove">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Filters ── */}
      <section className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="text-xs font-medium text-gray-900 uppercase tracking-wider">Filters</span>
          <button type="button" onClick={() => addFilter(activeFilterTab)} className="text-xs text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">
            + Add
          </button>
        </div>

        {/* Category tabs */}
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

        {/* Filter table */}
        <div className="px-4 pb-3">
          {/* Header */}
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
    </div>
  );
}
