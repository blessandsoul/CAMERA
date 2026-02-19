# MDX Content System + Admin Panel Design

**Date**: 2026-02-19
**Status**: Approved

## Goal

Migrate products from JSON to MDX files and add article/blog system with WYSIWYG admin panel. No backend server — all content as MDX files on disk.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Storage format | MDX with YAML frontmatter | Single file = single source of truth |
| Editor | TipTap WYSIWYG | Free, extensible, React-native |
| Article language | Georgian only (ka) | User requirement |
| Product multilingual | Yes (ka/ru/en) — same as now | Existing behavior preserved |
| Deployment | Self-hosted (PM2 + Nginx) | Required for file system writes |

## Content Structure

### Products — `content/products/*.mdx`

```mdx
---
id: "camera-001"
slug: "tiandy-5-indoor-camera-1-4"
category: "cameras"
price: 129
currency: "GEL"
isActive: true
isFeatured: true
images: ["1_qtkl-r3.png"]
name:
  ka: "IP კამერა 5მპ Fixed IR Fisheye, Tiandy - TC-C35VN"
  ru: "Tiandy 5 მპ внутренняя камера 1.4 მმ"
  en: "Tiandy 5 მპ indoor Camera 1.4 მმ"
specs:
  - key: { ka: "ბრენდი", en: "Brand", ru: "Бренд" }
    value: "Tiandy"
  - key: { ka: "რეზოლუცია", en: "Resolution", ru: "Разрешение" }
    value: "5 მპ"
createdAt: "2026-02-18T20:55:02.845Z"
---

Body = extended description in Georgian (MDX rich content).
```

### Articles — `content/articles/*.mdx`

```mdx
---
id: "article-001"
slug: "rogor-aviron-sakhlis-kamera"
title: "როგორ ავირჩიოთ სახლისთვის სათვალთვალო კამერა"
excerpt: "IP კამერა, WiFi კამერა თუ ანალოგური?..."
category: "cameras"
coverImage: "/images/articles/article-001-cover.jpg"
isPublished: true
readMin: 5
createdAt: "2026-02-19T10:00:00.000Z"
updatedAt: "2026-02-19T10:00:00.000Z"
---

# Article content (Georgian, written via TipTap WYSIWYG)
```

Article categories: `cameras`, `nvr`, `installation`, `news`, `guides`.

## Admin Panel Changes

### Navigation

AdminHeader gets two tabs: **Products** | **Articles**. Add button changes contextually.

### New Routes

| Route | Purpose |
|-------|---------|
| `/admin/articles` | Article list (table) |
| `/admin/articles/new` | Create article (WYSIWYG) |
| `/admin/articles/[id]/edit` | Edit article (WYSIWYG) |

### WYSIWYG (TipTap)

Features: H1-H3, bold, italic, lists, images (via /api/upload), links, blockquotes.
Output: HTML → Markdown via `turndown`, saved as MDX body.
Dark-themed toolbar matching existing admin design.

## Public Pages

### Blog List — `/[locale]/blog`

Card grid with category filter + pagination. Reads from `content/articles/*.mdx`.

### Blog Post — `/[locale]/blog/[slug]`

MDX rendered via `next-mdx-remote`. Cover image, title, date, read time.

### Catalog (updated)

Products read from `content/products/*.mdx` instead of JSON. MDX body rendered as rich description on product detail page.

## New Dependencies

- `gray-matter` — frontmatter parsing
- `next-mdx-remote` — MDX rendering
- `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-link` — WYSIWYG
- `turndown` — HTML to Markdown conversion

## File Changes

```
content/                          # NEW — top-level content directory
├── products/*.mdx                # Migrated from public/data/products/*.json
└── articles/*.mdx                # New article content

client/src/lib/
├── content.ts                    # NEW — MDX reading/parsing (replaces products.ts)
└── mdx.ts                        # NEW — MDX rendering utilities

client/src/features/admin/
├── components/
│   ├── ArticleForm.tsx           # NEW — article form with WYSIWYG
│   └── RichTextEditor.tsx        # NEW — TipTap wrapper
└── actions/
    └── article.actions.ts        # NEW — Server Actions for articles

client/src/app/admin/articles/    # NEW — admin article routes
client/src/app/[locale]/blog/     # NEW — public blog routes

scripts/migrate-products-to-mdx.ts  # NEW — one-time migration script
```

## Migration Plan

1. Create `scripts/migrate-products-to-mdx.ts`
2. Run migration: JSON → MDX for all 90 products
3. Update `lib/products.ts` → `lib/content.ts` to read MDX
4. Verify catalog works with MDX data
5. Remove JSON files after confirmation
