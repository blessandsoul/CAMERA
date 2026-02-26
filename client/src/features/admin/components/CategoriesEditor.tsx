'use client';

import { useState } from 'react';
import type { CatalogConfig, CatalogCategoryConfig } from '@/lib/content';

interface CategoriesEditorProps {
  config: CatalogConfig;
  setConfig: React.Dispatch<React.SetStateAction<CatalogConfig>>;
  fieldClass: string;
}

export function CategoriesEditor({ config, setConfig, fieldClass }: CategoriesEditorProps): React.ReactElement {
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  function toggleExpanded(id: string): void {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

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

  return (
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
              <div className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col shrink-0">
                  <button type="button" onClick={() => moveCategory(catIdx, -1)} className="p-0.5 text-gray-300 hover:text-gray-600 cursor-pointer" aria-label="Move up">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
                  </button>
                  <button type="button" onClick={() => moveCategory(catIdx, 1)} className="p-0.5 text-gray-300 hover:text-gray-600 cursor-pointer" aria-label="Move down">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                  </button>
                </div>

                <button type="button" onClick={() => toggleExpanded(cat.id)} className="p-0.5 text-gray-400 cursor-pointer" aria-label="Toggle details">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>

                <span className="text-xs text-gray-400 w-20 shrink-0 font-mono">{cat.id}</span>
                <span className="text-sm text-gray-900 font-medium flex-1 truncate">{cat.label.en || cat.label.ka || '(unnamed)'}</span>
                {childCount > 0 && (
                  <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{childCount} sub</span>
                )}

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

              {isExpanded && (
                <div className="px-4 pb-3 pt-1 bg-gray-50/50">
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
  );
}
