'use client';

import { useState } from 'react';
import { ImageManager } from './ImageManager';
import type { Product } from '@/types/product.types';

interface ProductFormProps {
  product?: Product;
  action: (formData: FormData) => Promise<void>;
}

interface SpecRow {
  key_ka: string;
  key_ru: string;
  key_en: string;
  value: string;
}

export function ProductForm({ product, action }: ProductFormProps): React.ReactElement {
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [isActiveChecked, setIsActiveChecked] = useState<boolean>(product?.isActive ?? true);
  const [isFeaturedChecked, setIsFeaturedChecked] = useState<boolean>(product?.isFeatured ?? false);
  const [specs, setSpecs] = useState<SpecRow[]>(
    product?.specs.map((s) => ({
      key_ka: s.key.ka,
      key_ru: s.key.ru,
      key_en: s.key.en,
      value: s.value,
    })) ?? []
  );

  function addSpec(): void {
    setSpecs((s) => [...s, { key_ka: '', key_ru: '', key_en: '', value: '' }]);
  }

  function removeSpec(i: number): void {
    setSpecs((s) => s.filter((_, idx) => idx !== i));
  }

  function updateSpec(i: number, field: keyof SpecRow, val: string): void {
    setSpecs((s) => s.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)));
  }

  const specsJson = JSON.stringify(
    specs.map((s) => ({
      key: { ka: s.key_ka, ru: s.key_ru, en: s.key_en },
      value: s.value,
    }))
  );

  const fieldClass =
    'w-full px-3 py-1.5 rounded-md border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors text-sm';
  const labelClass = 'block text-xs text-gray-500 mb-0.5';

  return (
    <form action={action} className="max-w-2xl">
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <input type="hidden" name="specs" value={specsJson} />

      <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
        <ImageManager images={images} setImages={setImages} />

        {/* Basic info */}
        <div className="p-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3">
              <label className={labelClass}>Slug</label>
              <input name="slug" defaultValue={product?.slug ?? ''} placeholder="v380-pro-wifi" className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select name="category" defaultValue={product?.category ?? 'cameras'} className={fieldClass}>
                <option value="cameras">Cameras</option>
                <option value="nvr-kits">NVR Kits</option>
                <option value="accessories">Accessories</option>
                <option value="storage">Storage</option>
                <option value="services">Services</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Price (GEL)</label>
              <input name="price" type="number" min="0" step="0.01" defaultValue={product?.price ?? 0} className={fieldClass} />
            </div>
            <div className="flex items-end gap-4 pb-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={isActiveChecked} onChange={(e) => setIsActiveChecked(e.target.checked)} className="w-3.5 h-3.5 accent-gray-900" />
                <span className="text-xs text-gray-600">Active</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={isFeaturedChecked} onChange={(e) => setIsFeaturedChecked(e.target.checked)} className="w-3.5 h-3.5 accent-gray-900" />
                <span className="text-xs text-gray-600">Featured</span>
              </label>
              <input type="hidden" name="isActive" value={isActiveChecked ? 'true' : 'false'} />
              <input type="hidden" name="isFeatured" value={isFeaturedChecked ? 'true' : 'false'} />
            </div>
          </div>
        </div>

        {/* Names — inline 3-column */}
        <div className="p-4">
          <span className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">Name</span>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>KA</label>
              <input name="name_ka" defaultValue={product?.name.ka ?? ''} placeholder="ქართულად" className={fieldClass} required />
            </div>
            <div>
              <label className={labelClass}>RU</label>
              <input name="name_ru" defaultValue={product?.name.ru ?? ''} placeholder="По-русски" className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>EN</label>
              <input name="name_en" defaultValue={product?.name.en ?? ''} placeholder="In English" className={fieldClass} />
            </div>
          </div>
        </div>

        {/* Descriptions — inline 3-column */}
        <div className="p-4">
          <span className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">Description</span>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>KA</label>
              <textarea name="description_ka" defaultValue={product?.description.ka ?? ''} rows={2} className={`${fieldClass} resize-y`} />
            </div>
            <div>
              <label className={labelClass}>RU</label>
              <textarea name="description_ru" defaultValue={product?.description.ru ?? ''} rows={2} className={`${fieldClass} resize-y`} />
            </div>
            <div>
              <label className={labelClass}>EN</label>
              <textarea name="description_en" defaultValue={product?.description.en ?? ''} rows={2} className={`${fieldClass} resize-y`} />
            </div>
          </div>
        </div>

        {/* Specs */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-900 uppercase tracking-wider">Specifications</span>
            <button type="button" onClick={addSpec} className="text-xs text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">
              + Add
            </button>
          </div>
          {specs.length === 0 ? (
            <p className="text-xs text-gray-400">No specs yet.</p>
          ) : (
            <div className="space-y-1.5">
              {specs.map((spec, i) => (
                <div key={i} className="grid grid-cols-5 gap-2 items-center">
                  <input placeholder="Key KA" value={spec.key_ka} onChange={(e) => updateSpec(i, 'key_ka', e.target.value)} className={fieldClass} />
                  <input placeholder="Key RU" value={spec.key_ru} onChange={(e) => updateSpec(i, 'key_ru', e.target.value)} className={fieldClass} />
                  <input placeholder="Key EN" value={spec.key_en} onChange={(e) => updateSpec(i, 'key_en', e.target.value)} className={fieldClass} />
                  <input placeholder="Value" value={spec.value} onChange={(e) => updateSpec(i, 'value', e.target.value)} className={fieldClass} />
                  <button type="button" onClick={() => removeSpec(i)} className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer justify-self-start" aria-label="Remove spec">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="mt-4 px-5 py-2 bg-gray-900 hover:bg-gray-800 active:scale-[0.98] text-white text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer"
      >
        Save Product
      </button>
    </form>
  );
}
