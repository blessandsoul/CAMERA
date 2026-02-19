'use client';

import { useState, useEffect } from 'react';
import { Heart } from '@phosphor-icons/react';
import { useFavoritesStore } from '../store/favoritesStore';

interface FavoriteButtonProps {
  productId: string;
  size?: 'sm' | 'md';
}

export function FavoriteButton({ productId, size = 'sm' }: FavoriteButtonProps): React.ReactElement | null {
  const [mounted, setMounted] = useState(false);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = useFavoritesStore((s) => s.isFavorite(productId));

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  const iconSize = size === 'sm' ? 18 : 22;
  const btnClass = size === 'sm'
    ? 'w-8 h-8'
    : 'w-10 h-10';

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(productId);
      }}
      className={`${btnClass} flex items-center justify-center rounded-full bg-background/90 backdrop-blur-sm border border-border/60 transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50`}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        size={iconSize}
        weight={isFavorite ? 'fill' : 'regular'}
        className={isFavorite ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'}
      />
    </button>
  );
}
