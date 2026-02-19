# Hero Slider Redesign — 4 Variants + Switcher

**Date:** 2026-02-20
**Goal:** Replace current product-card hero with 4 visual-promo slider layouts. Add a dev-mode dropdown switcher so the client can preview and pick.

---

## Context

Current hero: `client/src/components/home/HeroSection.tsx`
- Left: h1 (product name, 15 chars) + spec tags + CTA buttons
- Right: carousel card with image + nav buttons below
- Both sides change together on slide navigation

Client wants: cinematic / promo feel — "you want to click it", not "here is a product list".

---

## Variant Definitions

### Variant A — "Dark Fullbleed"
- Right panel: image edge-to-edge, NO border/radius, bleeds to container edge
- Gradient from left: `from-background via-background/60 to-transparent` bleeds over image
- Product name: very large (5xl–6xl), white, bold
- Specs: small pills at bottom-left of image
- Nav: thin horizontal progress-bar below image + counter `01 / 91`
- Transition: image cross-fade (opacity), text slides up

### Variant B — "Hero Card Glow"
- Right panel: card with `overflow-hidden rounded-2xl` + glowing border `border-primary/40 shadow-[0_0_40px_hsl(var(--primary)/0.2)]`
- Left: giant decorative slide number `01` (text-[120px], opacity-10) behind the title
- Product name: normal size, clean
- Specs: tags row
- Nav: large arrow buttons flanking the card sides
- Transition: slide x-axis (current direction)

### Variant C — "Split Screen Cinematic"
- Full width of section divided 50/50 with a diagonal clip-path divider
- Left half: dark background + product name + specs
- Right half: image, no frame
- Nav: two floating circles bottom-center
- Transition: image slides in from bottom, text crossfades
- Feel: luxury brand (Miele, Bang & Olufsen)

### Variant D — "Stacked Immersive" (4th, new)
- Full-width image behind everything (background), dark overlay on entire section
- Text floats bottom-left over the image
- Top-right: small "NEW ARRIVAL" badge + price
- Nav: vertical dots on far right edge
- Transition: Ken Burns effect (slow zoom + pan) on image
- Feel: Apple product page / luxury e-commerce

---

## Switcher (Dev UI)

- A floating `<select>` in bottom-right corner of the hero section
- Only visible when `process.env.NODE_ENV === 'development'` OR `?heroVariant=` query param is present
- Persists choice to `localStorage` key `heroVariant`
- Options: `A | B | C | D`
- Label: `"🎨 Hero variant: [A]"`

---

## Architecture

- One file: `HeroSection.tsx` — exports `HeroSection`
- Internal sub-components: `HeroVariantA`, `HeroVariantB`, `HeroVariantC`, `HeroVariantD`
- Each variant receives the same props: `{ products, locale, phone, labels, currentIndex, onNavigate }`
- `HeroSection` owns `currentIndex` state + `heroVariant` state
- `Carousel` logic (prev/next/dir) stays shared, called from each variant
- `ProductSpecTags` stays shared

---

## Shared Props Interface

```ts
interface HeroVariantProps {
  products: Product[];
  locale: Locale;
  phone: string;
  labels: HeroSectionProps['labels'];
  currentIndex: number;
  dir: number;
  onNavigate: (i: number) => void;
}
```

---

## File Structure

```
src/components/home/
  HeroSection.tsx           ← main export + switcher
  hero/
    HeroVariantA.tsx        ← Dark Fullbleed
    HeroVariantB.tsx        ← Hero Card Glow
    HeroVariantC.tsx        ← Split Screen Cinematic
    HeroVariantD.tsx        ← Stacked Immersive
    ProductSpecTags.tsx     ← shared spec pill component
    types.ts                ← HeroVariantProps interface
```

---

## Implementation Steps

1. Create `src/components/home/hero/` directory with `types.ts` and `ProductSpecTags.tsx`
2. Build `HeroVariantA.tsx`
3. Build `HeroVariantB.tsx`
4. Build `HeroVariantC.tsx`
5. Build `HeroVariantD.tsx`
6. Rewrite `HeroSection.tsx` — add `heroVariant` state + dev switcher + render logic
7. Commit + push
