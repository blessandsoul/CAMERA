# TechBrain.ge — Design Document
**Date:** 2026-02-18
**Project:** Camera & Security Systems catalog site (site-vizitka)

---

## Overview

A Georgian security camera company (TechBrain) needs a fast, high-converting website:
- **Catalog** with product cards
- **Cart** with checkout (no payment — sends order to Telegram + shows phone number)
- **Admin panel** to manage products (CRUD + image upload)
- **3 languages:** Georgian (ka), Russian (ru), English (en)

---

## Architecture

```
Next.js 14 App Router (pure static + API Routes)
├── Data storage:    /public/data/products/*.json
├── Images:          /public/images/products/
├── Cart state:      localStorage via Zustand
├── Orders:          API Route /api/orders → Telegram Bot API
├── i18n:            next-intl (ka/ru/en), locale in URL prefix
├── Auth (admin):    password from .env → cookie session (7 days)
└── Deploy:          Vercel (free tier)
```

No database. No backend server. All product data is JSON files on disk.

---

## Color System (Dark theme only)

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#001233` | Page background |
| Surface | `#001845` | Cards, panels |
| Surface 2 | `#002855` | Hover states, elevated surfaces |
| Primary | `#0466c8` | CTA buttons, links, active states |
| Primary hover | `#0353a4` | Button hover |
| Border | `#33415c` | Card borders, dividers |
| Text primary | `#ffffff` | Headings, body text |
| Text muted | `#979dac` | Secondary text, meta info |
| Text subtle | `#7d8597` | Placeholders, disabled |

---

## Pages & Routes

| Route | Type | Description |
|-------|------|-------------|
| `/` | Server Component | Redirects to `/ka` |
| `/[locale]` | Server Component | Home: Hero + About + Popular products + CTA |
| `/[locale]/catalog` | Server Component | Catalog with category filter + product grid |
| `/[locale]/catalog/[id]` | Server Component | Product detail: images, specs, Add to cart |
| `/[locale]/cart` | Client Component | Cart items + order form (name + phone) |
| `/admin` | Server Component | Password login form |
| `/admin/dashboard` | Server Component | Product list with edit/delete |
| `/admin/products/new` | Server Component | Add product form |
| `/admin/products/[id]/edit` | Server Component | Edit product form |

---

## Product JSON Schema

File: `public/data/products/{id}.json`

```json
{
  "id": "camera-001",
  "slug": "v380-pro-wifi-camera",
  "category": "cameras",
  "price": 85,
  "currency": "GEL",
  "isActive": true,
  "isFeatured": false,
  "images": ["camera-001-1.jpg", "camera-001-2.jpg"],
  "name": {
    "ka": "V380 PRO WiFi კამერა",
    "ru": "Камера V380 PRO WiFi",
    "en": "V380 PRO WiFi Camera"
  },
  "description": {
    "ka": "...",
    "ru": "...",
    "en": "..."
  },
  "specs": [
    {
      "key": { "ka": "გარჩევადობა", "ru": "Разрешение", "en": "Resolution" },
      "value": "3MP"
    }
  ],
  "createdAt": "2026-02-18T00:00:00Z"
}
```

### Categories
- `cameras` — IP/WiFi cameras (indoor/outdoor, PTZ, 4G)
- `nvr-kits` — NVR + camera bundles
- `storage` — HDD, SSD for DVR/NVR
- `services` — Installation, lock mounting

---

## Data Layer

### Reading products (Server Components)
```ts
// lib/products.ts
import fs from 'fs'
import path from 'path'

export function getAllProducts(): Product[] { ... }
export function getProductById(id: string): Product | null { ... }
export function getProductsByCategory(category: string): Product[] { ... }
export function getFeaturedProducts(): Product[] { ... }
```

### Writing products (Admin Server Actions)
```ts
// features/admin/actions/product.actions.ts
export async function createProduct(data: FormData): Promise<void>
export async function updateProduct(id: string, data: FormData): Promise<void>
export async function deleteProduct(id: string): Promise<void>
```

Image upload: `multipart/form-data` → save to `/public/images/products/` → store filename in JSON.

---

## Cart

- **State:** Zustand store persisted to localStorage
- **Items:** `{ product: Product; quantity: number }[]`
- **Badge:** Cart icon in header shows item count

---

## Order Flow

1. User fills cart → goes to `/[locale]/cart`
2. Enters name + phone number
3. Clicks "Оформить заказ" / "შეკვეთის გაფორმება" / "Place Order"
4. Client sends POST to `/api/orders`
5. API Route formats message and calls Telegram Bot API `sendMessage`
6. On success: show modal with phone number `597 470 518` and confirmation message
7. Cart is cleared

### Telegram message format
```
🛒 New Order — TechBrain.ge

👤 Name: John Doe
📞 Phone: +995 555 123 456
🌐 Language: ru

📦 Order items:
• V380 PRO WiFi Camera × 2 — 170 GEL
• NVR Kit 8CH × 1 — 450 GEL

💰 Total: 620 GEL

🕐 2026-02-18 14:30
```

---

## Admin Panel

### Authentication
- Route: `/admin`
- Password stored in `ADMIN_PASSWORD` env var
- On success: set httpOnly cookie `admin_session` = signed token, 7 days
- Middleware protects all `/admin/*` routes except `/admin` itself

### Product CRUD
- List all products (table: image, name, category, price, active toggle)
- Create: form with all fields + image upload
- Edit: pre-filled form
- Delete: confirm dialog → remove JSON file + image files
- Toggle `isActive` inline

---

## i18n

- Library: `next-intl`
- Locales: `ka` (default), `ru`, `en`
- URL structure: `/ka/catalog`, `/ru/catalog`, `/en/catalog`
- Language switcher in header
- All UI strings in `/messages/{locale}.json`
- Product content (name, description, specs keys) stored multilingual in JSON

---

## Tech Stack

| Package | Version | Purpose |
|---------|---------|---------|
| next | 15.x | Framework |
| next-intl | 3.x | i18n |
| zustand | 5.x | Cart state |
| tailwindcss | 3.x | Styling |
| shadcn/ui | latest | UI components |
| sonner | latest | Toasts |
| react-hook-form | 7.x | Forms |
| zod | 3.x | Validation |
| lucide-react | latest | Icons |

---

## Folder Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx          # With header/footer
│   │   ├── page.tsx            # Home
│   │   ├── catalog/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── cart/page.tsx
│   ├── admin/
│   │   ├── layout.tsx          # Admin layout (auth check)
│   │   ├── page.tsx            # Login
│   │   ├── dashboard/page.tsx
│   │   └── products/
│   │       ├── new/page.tsx
│   │       └── [id]/edit/page.tsx
│   └── api/
│       ├── orders/route.ts     # POST → Telegram
│       ├── admin/
│       │   ├── login/route.ts
│       │   ├── logout/route.ts
│       │   └── products/
│       │       ├── route.ts         # GET all, POST create
│       │       └── [id]/route.ts    # PUT update, DELETE
│       └── upload/route.ts     # Image upload
├── components/
│   ├── ui/                     # shadcn components
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── LocaleSwitcher.tsx
│   └── common/
│       ├── ProductCard.tsx
│       ├── CategoryFilter.tsx
│       └── CartIcon.tsx
├── features/
│   ├── catalog/
│   │   ├── components/
│   │   └── hooks/
│   ├── cart/
│   │   ├── components/
│   │   ├── store/cartStore.ts
│   │   └── types/
│   └── admin/
│       ├── components/
│       └── actions/
├── lib/
│   ├── products.ts             # Read JSON files
│   ├── constants/
│   └── utils/
├── messages/
│   ├── ka.json
│   ├── ru.json
│   └── en.json
└── middleware.ts               # i18n routing + admin auth
public/
├── data/products/              # Product JSON files
└── images/products/            # Product images
```

---

## Environment Variables

```env
# .env.local
ADMIN_PASSWORD=your_secure_password
ADMIN_SESSION_SECRET=random_secret_32chars
TELEGRAM_BOT_TOKEN=placeholder_replace_later
TELEGRAM_CHAT_ID=placeholder_replace_later
NEXT_PUBLIC_PHONE=597470518
NEXT_PUBLIC_APP_NAME=TechBrain
```

---

## Performance Targets

- Lighthouse Performance: 95+
- LCP: < 2.5s
- CLS: 0
- All product pages statically generated at build time
- Images optimized via Next.js `<Image>` component
