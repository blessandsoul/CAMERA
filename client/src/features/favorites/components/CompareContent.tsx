'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, SecurityCamera } from '@phosphor-icons/react';
import type { Product, Locale } from '@/types/product.types';

interface CompareContentProps {
  products: Product[];
  locale: string;
}

export function CompareContent({ products, locale }: CompareContentProps): React.ReactElement {
  const t = useTranslations();

  if (products.length < 2) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">{t('compare.no_products')}</p>
        <Link
          href={`/${locale}/favorites`}
          className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:brightness-110 transition-all duration-200 cursor-pointer"
        >
          {t('compare.back')}
        </Link>
      </div>
    );
  }

  // Collect all unique spec keys across products
  const allSpecKeys: string[] = [];
  const seenKeys = new Set<string>();
  for (const p of products) {
    for (const spec of p.specs) {
      const key = spec.key[locale as Locale] || spec.key.ka;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        allSpecKeys.push(key);
      }
    }
  }

  function getSpecValue(product: Product, specKey: string): string {
    const spec = product.specs.find(
      (s) => (s.key[locale as Locale] || s.key.ka) === specKey
    );
    return spec?.value ?? '—';
  }

  function valuesAreDifferent(specKey: string): boolean {
    const values = products.map((p) => getSpecValue(p, specKey));
    return new Set(values).size > 1;
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/${locale}/favorites`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft size={16} />
        {t('compare.back')}
      </Link>

      <div className="overflow-x-auto">
        <table className="w-full min-w-150 border-collapse">
          {/* Product header */}
          <thead>
            <tr>
              <th className="w-40 p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border" />
              {products.map((product) => {
                const name = product.name[locale as Locale];
                const hasImage = product.images.length > 0;
                const imgSrc = hasImage
                  ? (product.images[0].startsWith('http') ? product.images[0] : `/images/products/${product.images[0]}`)
                  : '';

                return (
                  <th key={product.id} className="p-3 border-b border-border text-center min-w-[180px]">
                    <Link href={`/${locale}/catalog/${product.id}`} className="block group">
                      <div className="relative w-20 h-20 mx-auto mb-3 rounded-lg overflow-hidden bg-muted border border-border">
                        {hasImage ? (
                          <Image
                            src={imgSrc}
                            alt={name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <SecurityCamera size={24} weight="duotone" className="text-border/60" />
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {name}
                      </span>
                    </Link>
                    {product.category !== 'services' && (
                      <div className="mt-2 font-bold text-lg text-foreground tabular-nums">
                        {product.price}<span className="text-primary ml-1 text-sm">₾</span>
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Spec rows */}
          <tbody>
            {allSpecKeys.map((specKey, i) => {
              const isDiff = valuesAreDifferent(specKey);
              return (
                <tr key={specKey} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
                  <td className="p-3 text-sm font-medium text-muted-foreground border-b border-border/50">
                    {specKey}
                  </td>
                  {products.map((product) => {
                    const val = getSpecValue(product, specKey);
                    return (
                      <td
                        key={product.id}
                        className={`p-3 text-sm text-center border-b border-border/50 ${
                          isDiff ? 'text-foreground font-medium' : 'text-muted-foreground'
                        }`}
                      >
                        {val}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
