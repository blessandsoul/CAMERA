'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart } from '@phosphor-icons/react';
import { useFavoritesStore } from '../store/favoritesStore';

interface FavoritesIconProps {
  locale: string;
}

export function FavoritesIcon({ locale }: FavoritesIconProps): React.ReactElement {
  const [mounted, setMounted] = useState(false);
  const count = useFavoritesStore((s) => s.ids.length);

  useEffect(() => { setMounted(true); }, []);

  return (
    <Link
      href={`/${locale}/favorites`}
      className="relative flex items-center justify-center w-11 h-11 rounded-xl hover:bg-accent transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      aria-label={`Favorites (${mounted ? count : 0} items)`}
    >
      <Heart size={20} weight="regular" className="text-foreground" aria-hidden="true" />
      {mounted && count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-red-500 text-white rounded-full leading-none">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
