'use client';

import { useState, useEffect } from 'react';

type Variant = 'A' | 'B' | 'C' | 'D';
const STORAGE_KEY = 'hero_variant';
const VARIANTS: Variant[] = ['A', 'B', 'C', 'D'];

interface HeroVariantSwitcherProps {
  value: Variant;
  onChange: (v: Variant) => void;
}

export function HeroVariantSwitcher({ value, onChange }: HeroVariantSwitcherProps) {
  return (
    <div className="flex items-center gap-2 mt-4" role="group" aria-label="Hero variant switcher">
      <span className="text-xs font-bold text-muted-foreground">ვარიანტი:</span>
      {VARIANTS.map(v => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`w-9 h-9 rounded-lg text-sm font-black transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${value === v ? 'bg-primary text-primary-foreground shadow-md' : 'border border-border text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          aria-pressed={value === v}
          aria-label={`Variant ${v}`}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

export function useHeroVariant(): { variant: Variant; handleChange: (v: Variant) => void } {
  const [variant, setVariant] = useState<Variant>('A');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Variant | null;
    if (stored && (VARIANTS as string[]).includes(stored)) setVariant(stored);
  }, []);

  const handleChange = (v: Variant) => {
    setVariant(v);
    localStorage.setItem(STORAGE_KEY, v);
  };

  return { variant, handleChange };
}
