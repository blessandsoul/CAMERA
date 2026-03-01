'use client';

import { useState } from 'react';
import { ImageManager } from './ImageManager';
import { RelatedProductsPicker } from './RelatedProductsPicker';
import { InfoTooltip } from './InfoTooltip';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { Product } from '@/types/product.types';

interface ProductFormProps {
  product?: Product;
  allProducts?: Product[];
  action: (formData: FormData) => Promise<void>;
}

interface SpecRow {
  key_ka: string;
  key_ru: string;
  key_en: string;
  value: string;
}

export function ProductForm({ product, allProducts = [], action }: ProductFormProps): React.ReactElement {
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [isActiveChecked, setIsActiveChecked] = useState<boolean>(product?.isActive ?? true);
  const [isFeaturedChecked, setIsFeaturedChecked] = useState<boolean>(product?.isFeatured ?? false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(product?.categories ?? ['cameras']);
  const [relatedIds, setRelatedIds] = useState<string[]>(product?.relatedProducts ?? []);
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

  const labelClass = 'text-xs text-muted-foreground';

  return (
    <form action={action} className="max-w-2xl">
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <input type="hidden" name="specs" value={specsJson} />
      <input type="hidden" name="categories" value={JSON.stringify(selectedCategories)} />
      <input type="hidden" name="isActive" value={isActiveChecked ? 'true' : 'false'} />
      <input type="hidden" name="isFeatured" value={isFeaturedChecked ? 'true' : 'false'} />
      <input type="hidden" name="relatedProducts" value={JSON.stringify(relatedIds)} />

      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        <ImageManager images={images} setImages={setImages} />

        {/* Basic info */}
        <div className="p-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3">
              <Label className={labelClass}>სლაგი <InfoTooltip text="პროდუქტის უნიკალური URL იდენტიფიკატორი. მაგ: v380-pro-wifi" /></Label>
              <Input name="slug" defaultValue={product?.slug ?? ''} placeholder="v380-pro-wifi" />
            </div>
            <div>
              <Label className={labelClass}>კატეგორიები <InfoTooltip text="პროდუქტის კატეგორიები — შეგიძლიათ აირჩიოთ ერთი ან რამდენიმე კატეგორია" /></Label>
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-1">
                {[
                  { value: 'cameras', label: 'კამერები' },
                  { value: 'nvr-kits', label: 'NVR კომპლექტები' },
                  { value: 'accessories', label: 'აქსესუარები' },
                  { value: 'storage', label: 'მეხსიერება' },
                  { value: 'services', label: 'სერვისები' },
                ].map((cat) => (
                  <div key={cat.value} className="flex items-center gap-1.5">
                    <Checkbox
                      id={`cat-${cat.value}`}
                      checked={selectedCategories.includes(cat.value)}
                      onCheckedChange={(checked) => {
                        setSelectedCategories((prev) =>
                          checked
                            ? [...prev, cat.value]
                            : prev.filter((c) => c !== cat.value)
                        );
                      }}
                    />
                    <Label htmlFor={`cat-${cat.value}`} className="text-xs text-muted-foreground cursor-pointer">{cat.label}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label className={labelClass}>ფასი (₾) <InfoTooltip text="ფასი ლარებში. 0 ნიშნავს ფასი არ გამოჩნდება" /></Label>
              <Input name="price" type="number" min="0" step="0.01" defaultValue={product?.price ?? 0} />
            </div>
            <div className="flex items-end gap-4 pb-1">
              <div className="flex items-center gap-1.5">
                <Checkbox
                  id="isActive"
                  checked={isActiveChecked}
                  onCheckedChange={(checked) => setIsActiveChecked(checked === true)}
                />
                <Label htmlFor="isActive" className="text-xs text-muted-foreground cursor-pointer">აქტიური <InfoTooltip text="გამორთვისას პროდუქტი არ გამოჩნდება საიტზე" /></Label>
              </div>
              <div className="flex items-center gap-1.5">
                <Checkbox
                  id="isFeatured"
                  checked={isFeaturedChecked}
                  onCheckedChange={(checked) => setIsFeaturedChecked(checked === true)}
                />
                <Label htmlFor="isFeatured" className="text-xs text-muted-foreground cursor-pointer">გამორჩეული <InfoTooltip text="ჩართვისას პროდუქტი გამოჩნდება მთავარ გვერდზე" /></Label>
              </div>
            </div>
          </div>
        </div>

        {/* Names — inline 3-column */}
        <div className="p-4">
          <span className="block text-xs font-medium text-foreground uppercase tracking-wider mb-2">სახელი <InfoTooltip text="პროდუქტის სახელი სამ ენაზე. ქართული სავალდებულოა" /></span>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className={labelClass}>KA</Label>
              <Input name="name_ka" defaultValue={product?.name.ka ?? ''} placeholder="ქართულად" required />
            </div>
            <div>
              <Label className={labelClass}>RU</Label>
              <Input name="name_ru" defaultValue={product?.name.ru ?? ''} placeholder="По-русски" />
            </div>
            <div>
              <Label className={labelClass}>EN</Label>
              <Input name="name_en" defaultValue={product?.name.en ?? ''} placeholder="In English" />
            </div>
          </div>
        </div>

        {/* Descriptions — inline 3-column */}
        <div className="p-4">
          <span className="block text-xs font-medium text-foreground uppercase tracking-wider mb-2">აღწერა <InfoTooltip text="პროდუქტის აღწერა — გამოჩნდება პროდუქტის გვერდზე" /></span>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className={labelClass}>KA</Label>
              <Textarea name="description_ka" defaultValue={product?.description.ka ?? ''} rows={2} className="resize-y" />
            </div>
            <div>
              <Label className={labelClass}>RU</Label>
              <Textarea name="description_ru" defaultValue={product?.description.ru ?? ''} rows={2} className="resize-y" />
            </div>
            <div>
              <Label className={labelClass}>EN</Label>
              <Textarea name="description_en" defaultValue={product?.description.en ?? ''} rows={2} className="resize-y" />
            </div>
          </div>
        </div>

        {/* Related Products (Bought Together) */}
        <div className="p-4">
          <span className="block text-xs font-medium text-foreground uppercase tracking-wider mb-2">
            ერთად შეძენა <InfoTooltip text="თანმხლები პროდუქტები — გამოჩნდება 'ასევე შეიძინეთ' სექციაში" />
          </span>
          <RelatedProductsPicker
            allProducts={allProducts}
            selectedIds={relatedIds}
            currentProductId={product?.id}
            onChange={setRelatedIds}
          />
        </div>

        {/* Specs */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-foreground uppercase tracking-wider">სპეციფიკაციები <InfoTooltip text="ტექნიკური მახასიათებლები — Key=პარამეტრის სახელი, Value=მნიშვნელობა" /></span>
            <Button type="button" variant="ghost" size="sm" onClick={addSpec}>
              + დამატება
            </Button>
          </div>
          {specs.length === 0 ? (
            <p className="text-xs text-muted-foreground">სპეციფიკაციები ჯერ არ არის.</p>
          ) : (
            <div className="space-y-1.5">
              {specs.map((spec, i) => (
                <div key={i} className="grid grid-cols-5 gap-2 items-center">
                  <Input placeholder="გასაღები KA" value={spec.key_ka} onChange={(e) => updateSpec(i, 'key_ka', e.target.value)} />
                  <Input placeholder="გასაღები RU" value={spec.key_ru} onChange={(e) => updateSpec(i, 'key_ru', e.target.value)} />
                  <Input placeholder="გასაღები EN" value={spec.key_en} onChange={(e) => updateSpec(i, 'key_en', e.target.value)} />
                  <Input placeholder="მნიშვნელობა" value={spec.value} onChange={(e) => updateSpec(i, 'value', e.target.value)} />
                  <Button type="button" variant="ghost" size="icon-xs" onClick={() => removeSpec(i)} className="text-muted-foreground hover:text-destructive justify-self-start" aria-label="სპეცის წაშლა">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Submit */}
      <Button type="submit" className="mt-4">
        პროდუქტის შენახვა
      </Button>
    </form>
  );
}
