'use client';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product, Locale } from '@/types/product.types';

export function ProductSpecTags({
  product,
  locale,
  dark = false,
}: {
  product: Product;
  locale: Locale;
  dark?: boolean;
}) {
  return (
    <AnimatePresence mode="popLayout">
      {product.specs.map((spec, i) => (
        <motion.span
          key={`${product.id}-${i}`}
          initial={{ opacity: 0, scale: 0.85, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: -8 }}
          transition={{ duration: 0.18, delay: i * 0.03, ease: 'easeOut' }}
          className={
            dark
              ? 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 backdrop-blur-sm border border-white/20 text-white'
              : 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-background/50 backdrop-blur-sm border-border/50'
          }
        >
          <span className={dark ? 'text-white/50 text-[10px]' : 'text-muted-foreground/60 text-[10px]'}>
            {spec.key[locale] ?? spec.key['en'] ?? spec.key['ka']}:
          </span>
          <span className="font-semibold">{spec.value}</span>
        </motion.span>
      ))}
    </AnimatePresence>
  );
}
