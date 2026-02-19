# TechBrain.ge Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a full dark-themed Next.js 16 catalog + cart + Telegram order site for TechBrain.ge with a password-protected admin panel and 3-language support (ka/ru/en).

**Architecture:** Pure static JSON files for product data, no database, no backend server. Next.js App Router with `[locale]` prefix. Cart in Zustand + localStorage. Orders sent via API Route to Telegram Bot. Admin panel protected by env-var password + httpOnly cookie.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, next-intl, Zustand, Zod, react-hook-form, sonner, lucide-react.

---

## Key Decisions

- **No `src/` directory exists yet** — create all files from scratch inside `client/src/`
- **Tailwind 4** uses CSS-based config (`@import "tailwindcss"` in globals.css), not `tailwind.config.js`
- **Dark theme only** — no light/dark toggle, custom CSS variables override shadcn defaults
- **`[locale]` routing** — all public pages under `/[locale]/...`, admin outside locale routing
- **Product images** stored in `client/public/images/products/` and served statically
- **Product data** stored in `client/public/data/products/*.json`
- **Admin writes files** via Node.js `fs` in Server Actions (works on Vercel with caution — files in `public/` need rebuild; acceptable for this scale)

---

## Task 1: Install missing dependencies and set up project structure

**Files:**
- Modify: `client/package.json`
- Create: `client/src/app/globals.css`
- Create: `client/src/app/layout.tsx`
- Create: `client/next.config.ts`
- Create: `client/.env.local`
- Create: `client/.env.example`
- Create: `client/src/middleware.ts`
- Create: `client/src/i18n/routing.ts`
- Create: `client/src/i18n/request.ts`
- Create: `client/messages/ka.json`
- Create: `client/messages/ru.json`
- Create: `client/messages/en.json`
- Create: `client/public/data/products/.gitkeep`
- Create: `client/public/images/products/.gitkeep`

**Step 1: Install next-intl and zustand**

Run from `client/` directory:
```bash
npm install next-intl zustand
```
Expected: packages added to `node_modules` and `package.json`.

**Step 2: Create `client/next.config.ts`**

```typescript
import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default withNextIntl(nextConfig);
```

**Step 3: Create `client/src/i18n/routing.ts`**

```typescript
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ka', 'ru', 'en'],
  defaultLocale: 'ka',
});
```

**Step 4: Create `client/src/i18n/request.ts`**

```typescript
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as 'ka' | 'ru' | 'en')) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

**Step 5: Create `client/src/middleware.ts`**

```typescript
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Admin auth check
  if (pathname.startsWith('/admin') && pathname !== '/admin') {
    const session = request.cookies.get('admin_session');
    if (!session?.value || session.value !== process.env.ADMIN_SESSION_SECRET) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // Skip intl for admin and api routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
```

**Step 6: Create `client/src/app/globals.css`**

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: #001233;
  --color-foreground: #ffffff;
  --color-surface: #001845;
  --color-surface-2: #002855;
  --color-primary: #0466c8;
  --color-primary-hover: #0353a4;
  --color-border: #33415c;
  --color-muted: #979dac;
  --color-subtle: #7d8597;
  --color-card: #001845;
  --color-destructive: #ef4444;
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
}

* {
  box-sizing: border-box;
}

html {
  color-scheme: dark;
}

body {
  background-color: #001233;
  color: #ffffff;
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #001233; }
::-webkit-scrollbar-thumb { background: #33415c; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #5c677d; }
```

**Step 7: Create `client/src/app/layout.tsx`**

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'TechBrain — კამერები და უსაფრთხოების სისტემები',
  description: 'კამერები და უსაფრთხოების სისტემები | Камеры и системы безопасности | Security cameras',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

**Step 8: Create root redirect `client/src/app/page.tsx`**

```typescript
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/ka');
}
```

**Step 9: Create translation files**

`client/messages/ka.json`:
```json
{
  "nav": {
    "catalog": "კატალოგი",
    "cart": "კალათა",
    "home": "მთავარი"
  },
  "home": {
    "hero_title": "კამერები და უსაფრთხოების სისტემები",
    "hero_subtitle": "პროფესიონალური მონიტორინგი თქვენი სახლისა და ბიზნესისთვის",
    "hero_cta": "კატალოგის ნახვა",
    "hero_call": "დარეკე",
    "about_title": "ჩვენ შესახებ",
    "about_install": "მონტაჟი",
    "about_install_desc": "პროფესიონალური კამერების მონტაჟი",
    "about_guarantee": "გარანტია",
    "about_guarantee_desc": "ყველა პროდუქტზე გარანტია",
    "about_delivery": "მიტანა",
    "about_delivery_desc": "სწრაფი მიტანა მთელ საქართველოში",
    "featured_title": "პოპულარული პროდუქტები",
    "cta_title": "გაქვთ კითხვები?",
    "cta_subtitle": "დაგვიკავშირდით და ჩვენ დაგეხმარებით",
    "cta_button": "დარეკე ახლა"
  },
  "catalog": {
    "title": "კატალოგი",
    "all": "ყველა",
    "cameras": "კამერები",
    "nvr_kits": "NVR კომპლექტები",
    "storage": "შენახვა",
    "services": "სერვისი",
    "add_to_cart": "კალათაში დამატება",
    "price": "ფასი",
    "specs": "მახასიათებლები",
    "no_products": "პროდუქტები არ მოიძებნა",
    "view_details": "დეტალების ნახვა"
  },
  "cart": {
    "title": "კალათა",
    "empty": "კალათა ცარიელია",
    "empty_cta": "კატალოგში გადასვლა",
    "quantity": "რაოდენობა",
    "total": "სულ",
    "remove": "წაშლა",
    "order_title": "შეკვეთის გაფორმება",
    "name_label": "სახელი და გვარი",
    "name_placeholder": "გიორგი გელაშვილი",
    "phone_label": "ტელეფონის ნომერი",
    "phone_placeholder": "+995 555 000 000",
    "submit": "შეკვეთის გაფორმება",
    "submitting": "გაგზავნა...",
    "success_title": "შეკვეთა მიღებულია!",
    "success_message": "ჩვენ დაგიკავშირდებით მალე. ასევე შეგიძლიათ დაგვიკავშირდეთ:",
    "success_close": "დახურვა",
    "gel": "₾"
  },
  "common": {
    "gel": "₾",
    "phone": "597 470 518",
    "loading": "იტვირთება...",
    "error": "შეცდომა მოხდა"
  }
}
```

`client/messages/ru.json`:
```json
{
  "nav": {
    "catalog": "Каталог",
    "cart": "Корзина",
    "home": "Главная"
  },
  "home": {
    "hero_title": "Камеры и системы безопасности",
    "hero_subtitle": "Профессиональный мониторинг для вашего дома и бизнеса",
    "hero_cta": "Смотреть каталог",
    "hero_call": "Позвонить",
    "about_title": "О нас",
    "about_install": "Монтаж",
    "about_install_desc": "Профессиональный монтаж камер",
    "about_guarantee": "Гарантия",
    "about_guarantee_desc": "Гарантия на все товары",
    "about_delivery": "Доставка",
    "about_delivery_desc": "Быстрая доставка по всей Грузии",
    "featured_title": "Популярные товары",
    "cta_title": "Есть вопросы?",
    "cta_subtitle": "Свяжитесь с нами и мы поможем",
    "cta_button": "Позвонить сейчас"
  },
  "catalog": {
    "title": "Каталог",
    "all": "Все",
    "cameras": "Камеры",
    "nvr_kits": "Комплекты NVR",
    "storage": "Накопители",
    "services": "Услуги",
    "add_to_cart": "В корзину",
    "price": "Цена",
    "specs": "Характеристики",
    "no_products": "Товары не найдены",
    "view_details": "Подробнее"
  },
  "cart": {
    "title": "Корзина",
    "empty": "Корзина пуста",
    "empty_cta": "Перейти в каталог",
    "quantity": "Количество",
    "total": "Итого",
    "remove": "Удалить",
    "order_title": "Оформить заказ",
    "name_label": "Имя и фамилия",
    "name_placeholder": "Иван Иванов",
    "phone_label": "Номер телефона",
    "phone_placeholder": "+995 555 000 000",
    "submit": "Оформить заказ",
    "submitting": "Отправка...",
    "success_title": "Заказ принят!",
    "success_message": "Мы свяжемся с вами в ближайшее время. Также вы можете позвонить нам:",
    "success_close": "Закрыть",
    "gel": "₾"
  },
  "common": {
    "gel": "₾",
    "phone": "597 470 518",
    "loading": "Загрузка...",
    "error": "Произошла ошибка"
  }
}
```

`client/messages/en.json`:
```json
{
  "nav": {
    "catalog": "Catalog",
    "cart": "Cart",
    "home": "Home"
  },
  "home": {
    "hero_title": "Cameras & Security Systems",
    "hero_subtitle": "Professional monitoring for your home and business",
    "hero_cta": "View Catalog",
    "hero_call": "Call Us",
    "about_title": "About Us",
    "about_install": "Installation",
    "about_install_desc": "Professional camera installation",
    "about_guarantee": "Warranty",
    "about_guarantee_desc": "Warranty on all products",
    "about_delivery": "Delivery",
    "about_delivery_desc": "Fast delivery across Georgia",
    "featured_title": "Featured Products",
    "cta_title": "Have questions?",
    "cta_subtitle": "Contact us and we will help you",
    "cta_button": "Call Now"
  },
  "catalog": {
    "title": "Catalog",
    "all": "All",
    "cameras": "Cameras",
    "nvr_kits": "NVR Kits",
    "storage": "Storage",
    "services": "Services",
    "add_to_cart": "Add to Cart",
    "price": "Price",
    "specs": "Specifications",
    "no_products": "No products found",
    "view_details": "View Details"
  },
  "cart": {
    "title": "Cart",
    "empty": "Your cart is empty",
    "empty_cta": "Go to catalog",
    "quantity": "Quantity",
    "total": "Total",
    "remove": "Remove",
    "order_title": "Place Order",
    "name_label": "Full Name",
    "name_placeholder": "John Doe",
    "phone_label": "Phone Number",
    "phone_placeholder": "+995 555 000 000",
    "submit": "Place Order",
    "submitting": "Sending...",
    "success_title": "Order Received!",
    "success_message": "We will contact you shortly. You can also call us:",
    "success_close": "Close",
    "gel": "₾"
  },
  "common": {
    "gel": "₾",
    "phone": "597 470 518",
    "loading": "Loading...",
    "error": "An error occurred"
  }
}
```

**Step 10: Create `.env.local`**

```env
ADMIN_PASSWORD=techbrain2024
ADMIN_SESSION_SECRET=tb_session_placeholder_32chars_xx
TELEGRAM_BOT_TOKEN=PLACEHOLDER_REPLACE_LATER
TELEGRAM_CHAT_ID=PLACEHOLDER_REPLACE_LATER
NEXT_PUBLIC_PHONE=597470518
NEXT_PUBLIC_APP_NAME=TechBrain
```

**Step 11: Create `.env.example`**

```env
# Admin panel password
ADMIN_PASSWORD=your_secure_password_here

# Random 32+ char string for session signing
ADMIN_SESSION_SECRET=random_secret_32_characters_minimum

# Get from @BotFather on Telegram
TELEGRAM_BOT_TOKEN=1234567890:AAABBBCCC

# Your Telegram chat/channel ID where orders arrive
TELEGRAM_CHAT_ID=-1001234567890

# Public phone number shown on site
NEXT_PUBLIC_PHONE=597470518
NEXT_PUBLIC_APP_NAME=TechBrain
```

**Step 12: Create public data directories**

```bash
mkdir -p client/public/data/products
mkdir -p client/public/images/products
```

**Step 13: Run dev server to verify no errors**

```bash
cd client && npm run dev
```
Expected: Server starts on http://localhost:3000, no TypeScript errors.

**Step 14: Commit**

```bash
git add client/src client/messages client/next.config.ts client/.env.example client/public/data client/public/images
git commit -m "feat: scaffold project structure with next-intl, i18n routing, dark theme CSS"
```

---

## Task 2: Types and product data layer

**Files:**
- Create: `client/src/types/product.types.ts`
- Create: `client/src/lib/products.ts`
- Create: `client/src/lib/constants/categories.ts`
- Create: `client/public/data/products/camera-001.json`
- Create: `client/public/data/products/camera-002.json`
- Create: `client/public/data/products/nvr-001.json`
- Create: `client/public/data/products/service-001.json`

**Step 1: Create `client/src/types/product.types.ts`**

```typescript
export type ProductCategory = 'cameras' | 'nvr-kits' | 'storage' | 'services';
export type Locale = 'ka' | 'ru' | 'en';

export interface LocalizedString {
  ka: string;
  ru: string;
  en: string;
}

export interface ProductSpec {
  key: LocalizedString;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  category: ProductCategory;
  price: number;
  currency: string;
  isActive: boolean;
  isFeatured: boolean;
  images: string[];
  name: LocalizedString;
  description: LocalizedString;
  specs: ProductSpec[];
  createdAt: string;
}
```

**Step 2: Create `client/src/lib/constants/categories.ts`**

```typescript
import type { ProductCategory } from '@/types/product.types';

export const CATEGORIES: { value: ProductCategory | 'all'; labelKey: string }[] = [
  { value: 'all', labelKey: 'catalog.all' },
  { value: 'cameras', labelKey: 'catalog.cameras' },
  { value: 'nvr-kits', labelKey: 'catalog.nvr_kits' },
  { value: 'storage', labelKey: 'catalog.storage' },
  { value: 'services', labelKey: 'catalog.services' },
];

export const PHONE = process.env.NEXT_PUBLIC_PHONE ?? '597470518';
```

**Step 3: Create `client/src/lib/products.ts`**

```typescript
import fs from 'fs';
import path from 'path';
import type { Product, ProductCategory } from '@/types/product.types';

const PRODUCTS_DIR = path.join(process.cwd(), 'public', 'data', 'products');

function readProductFile(filename: string): Product | null {
  try {
    const filePath = path.join(PRODUCTS_DIR, filename);
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as Product;
  } catch {
    return null;
  }
}

export function getAllProducts(): Product[] {
  try {
    if (!fs.existsSync(PRODUCTS_DIR)) return [];
    const files = fs.readdirSync(PRODUCTS_DIR).filter((f) => f.endsWith('.json'));
    return files
      .map((f) => readProductFile(f))
      .filter((p): p is Product => p !== null && p.isActive)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export function getAllProductsAdmin(): Product[] {
  try {
    if (!fs.existsSync(PRODUCTS_DIR)) return [];
    const files = fs.readdirSync(PRODUCTS_DIR).filter((f) => f.endsWith('.json'));
    return files
      .map((f) => readProductFile(f))
      .filter((p): p is Product => p !== null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export function getProductById(id: string): Product | null {
  return readProductFile(`${id}.json`);
}

export function getProductsByCategory(category: ProductCategory): Product[] {
  return getAllProducts().filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return getAllProducts().filter((p) => p.isFeatured).slice(0, 6);
}

export function getAllProductIds(): string[] {
  try {
    if (!fs.existsSync(PRODUCTS_DIR)) return [];
    return fs
      .readdirSync(PRODUCTS_DIR)
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace('.json', ''));
  } catch {
    return [];
  }
}
```

**Step 4: Create 4 sample product JSON files**

`client/public/data/products/camera-001.json`:
```json
{
  "id": "camera-001",
  "slug": "v380-pro-wifi-camera",
  "category": "cameras",
  "price": 85,
  "currency": "GEL",
  "isActive": true,
  "isFeatured": true,
  "images": [],
  "name": {
    "ka": "V380 PRO WiFi კამერა",
    "ru": "Камера V380 PRO WiFi",
    "en": "V380 PRO WiFi Camera"
  },
  "description": {
    "ka": "საიმედო WiFi კამერა შიდა და გარე გამოყენებისთვის. ღამის ხედვა, მოძრაობის დეტექტორი, ორმხრივი კავშირი.",
    "ru": "Надёжная WiFi камера для внутреннего и наружного использования. Ночное видение, детектор движения, двусторонняя связь.",
    "en": "Reliable WiFi camera for indoor and outdoor use. Night vision, motion detection, two-way audio."
  },
  "specs": [
    { "key": { "ka": "გარჩევადობა", "ru": "Разрешение", "en": "Resolution" }, "value": "3MP" },
    { "key": { "ka": "კავშირი", "ru": "Подключение", "en": "Connectivity" }, "value": "WiFi 2.4GHz" },
    { "key": { "ka": "ღამის ხედვა", "ru": "Ночное видение", "en": "Night Vision" }, "value": "30m IR" },
    { "key": { "ka": "დაცვა", "ru": "Защита", "en": "Protection" }, "value": "IP66" }
  ],
  "createdAt": "2026-02-18T00:00:00Z"
}
```

`client/public/data/products/camera-002.json`:
```json
{
  "id": "camera-002",
  "slug": "ptz-4g-outdoor-camera",
  "category": "cameras",
  "price": 165,
  "currency": "GEL",
  "isActive": true,
  "isFeatured": true,
  "images": [],
  "name": {
    "ka": "PTZ 4G გარე კამერა",
    "ru": "PTZ 4G камера для улицы",
    "en": "PTZ 4G Outdoor Camera"
  },
  "description": {
    "ka": "PTZ კამერა 4G კავშირით, 360° ბრუნვა, 6MP გარჩევადობა, ჩაშენებული სიმ-ბარათის სლოტი.",
    "ru": "PTZ камера с 4G связью, поворот 360°, разрешение 6MP, встроенный слот SIM-карты.",
    "en": "PTZ camera with 4G connectivity, 360° rotation, 6MP resolution, built-in SIM card slot."
  },
  "specs": [
    { "key": { "ka": "გარჩევადობა", "ru": "Разрешение", "en": "Resolution" }, "value": "6MP" },
    { "key": { "ka": "კავშირი", "ru": "Подключение", "en": "Connectivity" }, "value": "4G LTE" },
    { "key": { "ka": "ბრუნვა", "ru": "Поворот", "en": "Pan/Tilt" }, "value": "360° / 90°" },
    { "key": { "ka": "დაცვა", "ru": "Защита", "en": "Protection" }, "value": "IP67" }
  ],
  "createdAt": "2026-02-17T00:00:00Z"
}
```

`client/public/data/products/nvr-001.json`:
```json
{
  "id": "nvr-001",
  "slug": "8ch-nvr-3mp-kit",
  "category": "nvr-kits",
  "price": 450,
  "currency": "GEL",
  "isActive": true,
  "isFeatured": true,
  "images": [],
  "name": {
    "ka": "8 არხიანი NVR 3MP კომპლექტი",
    "ru": "Комплект NVR 8CH 3MP",
    "en": "8CH NVR 3MP Kit"
  },
  "description": {
    "ka": "8 კამერის კომპლექტი NVR-ით, 4TB HDD, WiFi კავშირი, ღამის ხედვა.",
    "ru": "Комплект из 8 камер с NVR, 4TB HDD, WiFi подключение, ночное видение.",
    "en": "8-camera kit with NVR, 4TB HDD, WiFi connectivity, night vision."
  },
  "specs": [
    { "key": { "ka": "არხები", "ru": "Каналы", "en": "Channels" }, "value": "8CH" },
    { "key": { "ka": "გარჩევადობა", "ru": "Разрешение", "en": "Resolution" }, "value": "3MP" },
    { "key": { "ka": "HDD", "ru": "HDD", "en": "HDD" }, "value": "4TB" },
    { "key": { "ka": "კავშირი", "ru": "Подключение", "en": "Connectivity" }, "value": "WiFi + IP" }
  ],
  "createdAt": "2026-02-16T00:00:00Z"
}
```

`client/public/data/products/service-001.json`:
```json
{
  "id": "service-001",
  "slug": "camera-installation-service",
  "category": "services",
  "price": 0,
  "currency": "GEL",
  "isActive": true,
  "isFeatured": false,
  "images": [],
  "name": {
    "ka": "კამერების მონტაჟი",
    "ru": "Монтаж камер",
    "en": "Camera Installation"
  },
  "description": {
    "ka": "პროფესიონალური კამერების მონტაჟი გარანტიით. სახლი, ბიზნესი, საწყობი. ფასი ინდივიდუალური.",
    "ru": "Профессиональный монтаж камер с гарантией. Дом, бизнес, склад. Цена индивидуальная.",
    "en": "Professional camera installation with warranty. Home, business, warehouse. Price on request."
  },
  "specs": [
    { "key": { "ka": "გარანტია", "ru": "Гарантия", "en": "Warranty" }, "value": "1 წელი / год / year" }
  ],
  "createdAt": "2026-02-15T00:00:00Z"
}
```

**Step 5: Commit**

```bash
git add client/src/types client/src/lib client/public/data/products
git commit -m "feat: add product types, data layer (fs-based), and sample products"
```

---

## Task 3: Cart store (Zustand)

**Files:**
- Create: `client/src/features/cart/types/cart.types.ts`
- Create: `client/src/features/cart/store/cartStore.ts`

**Step 1: Create `client/src/features/cart/types/cart.types.ts`**

```typescript
import type { Product } from '@/types/product.types';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}
```

**Step 2: Create `client/src/features/cart/store/cartStore.ts`**

```typescript
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartStore, CartItem } from '../types/cart.types';
import type { Product } from '@/types/product.types';

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product) => {
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { product, quantity: 1 }] };
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }));
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (sum, i) => sum + i.product.price * i.quantity,
          0
        );
      },
    }),
    {
      name: 'techbrain-cart',
    }
  )
);
```

**Step 3: Commit**

```bash
git add client/src/features/cart
git commit -m "feat: add Zustand cart store with localStorage persistence"
```

---

## Task 4: Shared UI components — Header, Footer, ProductCard

**Files:**
- Create: `client/src/components/layout/Header.tsx`
- Create: `client/src/components/layout/Footer.tsx`
- Create: `client/src/components/layout/LocaleSwitcher.tsx`
- Create: `client/src/components/common/CartIcon.tsx`
- Create: `client/src/components/common/ProductCard.tsx`
- Create: `client/src/lib/utils/cn.ts`

**Step 1: Create `client/src/lib/utils/cn.ts`**

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

**Step 2: Create `client/src/components/common/CartIcon.tsx`**

```typescript
'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/features/cart/store/cartStore';

interface CartIconProps {
  locale: string;
}

export function CartIcon({ locale }: CartIconProps) {
  const totalItems = useCartStore((s) => s.getTotalItems());

  return (
    <Link
      href={`/${locale}/cart`}
      className="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-[#001845] transition-colors duration-150"
      aria-label="Cart"
    >
      <ShoppingCart className="w-5 h-5 text-white" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold bg-[#0466c8] text-white rounded-full">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Link>
  );
}
```

**Step 3: Create `client/src/components/layout/LocaleSwitcher.tsx`**

```typescript
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

const LOCALES = [
  { code: 'ka', label: 'GEO' },
  { code: 'ru', label: 'RUS' },
  { code: 'en', label: 'ENG' },
];

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(newLocale: string) {
    // Replace current locale prefix in pathname
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  }

  return (
    <div className="flex items-center gap-1">
      {LOCALES.map((l) => (
        <button
          key={l.code}
          onClick={() => switchLocale(l.code)}
          className={`px-2 py-1 text-xs font-medium rounded transition-colors duration-150 ${
            locale === l.code
              ? 'bg-[#0466c8] text-white'
              : 'text-[#979dac] hover:text-white hover:bg-[#001845]'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
```

**Step 4: Create `client/src/components/layout/Header.tsx`**

```typescript
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Phone } from 'lucide-react';
import { LocaleSwitcher } from './LocaleSwitcher';
import { CartIcon } from '@/components/common/CartIcon';

interface HeaderProps {
  locale: string;
}

export function Header({ locale }: HeaderProps) {
  const t = useTranslations();
  const phone = process.env.NEXT_PUBLIC_PHONE ?? '597470518';

  return (
    <header className="sticky top-0 z-50 border-b border-[#33415c] backdrop-blur-md bg-[#001233]/80">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0466c8] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TB</span>
            </div>
            <span className="font-bold text-white text-lg">TechBrain</span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href={`/${locale}`}
              className="text-sm text-[#979dac] hover:text-white transition-colors duration-150"
            >
              {t('nav.home')}
            </Link>
            <Link
              href={`/${locale}/catalog`}
              className="text-sm text-[#979dac] hover:text-white transition-colors duration-150"
            >
              {t('nav.catalog')}
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <a
              href={`tel:${phone}`}
              className="hidden md:flex items-center gap-1.5 text-sm text-[#979dac] hover:text-white transition-colors duration-150"
            >
              <Phone className="w-4 h-4" />
              <span>{phone}</span>
            </a>
            <LocaleSwitcher />
            <CartIcon locale={locale} />
          </div>
        </div>
      </div>
    </header>
  );
}
```

**Step 5: Create `client/src/components/layout/Footer.tsx`**

```typescript
import Link from 'next/link';
import { Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  const t = useTranslations();
  const phone = process.env.NEXT_PUBLIC_PHONE ?? '597470518';

  return (
    <footer className="border-t border-[#33415c] bg-[#001845] mt-auto">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#0466c8] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TB</span>
              </div>
              <span className="font-bold text-white text-lg">TechBrain</span>
            </div>
            <p className="text-sm text-[#979dac]">
              კამერები და უსაფრთხოების სისტემები
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">{t('nav.catalog')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={`/${locale}/catalog?category=cameras`} className="text-sm text-[#979dac] hover:text-white transition-colors">
                  {t('catalog.cameras')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/catalog?category=nvr-kits`} className="text-sm text-[#979dac] hover:text-white transition-colors">
                  {t('catalog.nvr_kits')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/catalog?category=services`} className="text-sm text-[#979dac] hover:text-white transition-colors">
                  {t('catalog.services')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">კონტაქტი</h3>
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-2 text-[#0466c8] hover:text-[#0353a4] transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="font-semibold">{phone}</span>
            </a>
          </div>
        </div>

        <div className="border-t border-[#33415c] mt-8 pt-8 text-center text-xs text-[#7d8597]">
          © {new Date().getFullYear()} TechBrain. ყველა უფლება დაცულია.
        </div>
      </div>
    </footer>
  );
}
```

**Step 6: Create `client/src/components/common/ProductCard.tsx`**

```typescript
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import type { Product, Locale } from '@/types/product.types';
import { AddToCartButton } from '@/features/cart/components/AddToCartButton';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const name = product.name[locale];
  const hasImage = product.images.length > 0;
  const isService = product.category === 'services';

  return (
    <div className="group relative flex flex-col rounded-xl border border-[#33415c] bg-[#001845] overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-black/30 hover:-translate-y-0.5 hover:border-[#5c677d]">
      {/* Image */}
      <Link href={`/${locale}/catalog/${product.id}`} className="block aspect-[4/3] relative overflow-hidden bg-[#002855]">
        {hasImage ? (
          <Image
            src={`/images/products/${product.images[0]}`}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[#33415c] flex items-center justify-center">
              <span className="text-2xl">📷</span>
            </div>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <Link href={`/${locale}/catalog/${product.id}`}>
          <h3 className="font-semibold text-white leading-snug line-clamp-2 hover:text-[#0466c8] transition-colors">
            {name}
          </h3>
        </Link>

        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="font-bold text-lg text-white">
            {isService ? (
              <span className="text-sm text-[#979dac]">ფასი შეთანხმებით</span>
            ) : (
              <>{product.price} ₾</>
            )}
          </span>
          {!isService && <AddToCartButton product={product} />}
        </div>
      </div>
    </div>
  );
}
```

**Step 7: Create `client/src/features/cart/components/AddToCartButton.tsx`**

```typescript
'use client';

import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/features/cart/store/cartStore';
import type { Product } from '@/types/product.types';
import { useTranslations } from 'next-intl';

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const t = useTranslations();
  const addItem = useCartStore((s) => s.addItem);

  return (
    <button
      onClick={() => addItem(product)}
      className="flex items-center gap-1.5 px-3 py-2 bg-[#0466c8] hover:bg-[#0353a4] active:scale-[0.98] text-white text-sm font-medium rounded-lg transition-all duration-200"
      aria-label={t('catalog.add_to_cart')}
    >
      <ShoppingCart className="w-4 h-4" />
      <span className="hidden sm:inline">{t('catalog.add_to_cart')}</span>
    </button>
  );
}
```

**Step 8: Commit**

```bash
git add client/src/components client/src/lib/utils client/src/features/cart/components
git commit -m "feat: add Header, Footer, ProductCard, CartIcon, AddToCartButton components"
```

---

## Task 5: Locale layout and Home page

**Files:**
- Create: `client/src/app/[locale]/layout.tsx`
- Create: `client/src/app/[locale]/page.tsx`

**Step 1: Create `client/src/app/[locale]/layout.tsx`**

```typescript
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from 'sonner';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="min-h-[100dvh] flex flex-col">
        <Header locale={locale} />
        <main className="flex-1">{children}</main>
        <Footer locale={locale} />
      </div>
      <Toaster position="top-right" theme="dark" />
    </NextIntlClientProvider>
  );
}
```

**Step 2: Create `client/src/app/[locale]/page.tsx`** (Home page)

```typescript
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Phone, Shield, Wrench, Truck, ArrowRight } from 'lucide-react';
import { getFeaturedProducts, getAllProducts } from '@/lib/products';
import { ProductCard } from '@/components/common/ProductCard';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  return { title: `TechBrain — ${t('hero_title')}` };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const featured = getFeaturedProducts();
  const allProducts = getAllProducts();
  const phone = process.env.NEXT_PUBLIC_PHONE ?? '597470518';

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#001233] py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0466c8]/10 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0466c8]/10 border border-[#0466c8]/20 text-[#0466c8] text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              TechBrain — Security Systems
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight text-balance mb-6">
              {t('home.hero_title')}
            </h1>
            <p className="text-lg text-[#979dac] mb-8 max-w-xl">
              {t('home.hero_subtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href={`/${locale}/catalog`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0466c8] hover:bg-[#0353a4] active:scale-[0.98] text-white font-semibold rounded-xl transition-all duration-200"
              >
                {t('home.hero_cta')}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href={`tel:${phone}`}
                className="inline-flex items-center gap-2 px-6 py-3 border border-[#33415c] hover:border-[#5c677d] hover:bg-[#001845] text-white font-semibold rounded-xl transition-all duration-200"
              >
                <Phone className="w-5 h-5" />
                {t('home.hero_call')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-20 bg-[#001845]">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-12 text-center">{t('home.about_title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Wrench, title: t('home.about_install'), desc: t('home.about_install_desc') },
              { icon: Shield, title: t('home.about_guarantee'), desc: t('home.about_guarantee_desc') },
              { icon: Truck, title: t('home.about_delivery'), desc: t('home.about_delivery_desc') },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center p-6 rounded-xl border border-[#33415c] bg-[#001233]">
                <div className="w-12 h-12 rounded-xl bg-[#0466c8]/10 border border-[#0466c8]/20 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-[#0466c8]" />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-[#979dac]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-bold text-white">{t('home.featured_title')}</h2>
              <Link
                href={`/${locale}/catalog`}
                className="text-sm text-[#0466c8] hover:text-[#0353a4] flex items-center gap-1 transition-colors"
              >
                {t('nav.catalog')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-[#001845]">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{t('home.cta_title')}</h2>
          <p className="text-[#979dac] mb-8">{t('home.cta_subtitle')}</p>
          <a
            href={`tel:${phone}`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#0466c8] hover:bg-[#0353a4] active:scale-[0.98] text-white font-bold text-lg rounded-xl transition-all duration-200"
          >
            <Phone className="w-5 h-5" />
            {t('home.cta_button')} — {phone}
          </a>
        </div>
      </section>
    </>
  );
}
```

**Step 3: Start dev server and verify home page renders**

```bash
cd client && npm run dev
```
Open http://localhost:3000 — should redirect to http://localhost:3000/ka and show the home page.

**Step 4: Commit**

```bash
git add client/src/app
git commit -m "feat: add locale layout and home page with hero, about, featured products, CTA"
```

---

## Task 6: Catalog page

**Files:**
- Create: `client/src/app/[locale]/catalog/page.tsx`
- Create: `client/src/features/catalog/components/CategoryFilter.tsx`

**Step 1: Create `client/src/features/catalog/components/CategoryFilter.tsx`**

```typescript
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CATEGORIES } from '@/lib/constants/categories';

export function CategoryFilter() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get('category') ?? 'all';

  function setCategory(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete('category');
    } else {
      params.set('category', value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map(({ value, labelKey }) => (
        <button
          key={value}
          onClick={() => setCategory(value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            current === value
              ? 'bg-[#0466c8] text-white'
              : 'bg-[#001845] border border-[#33415c] text-[#979dac] hover:text-white hover:border-[#5c677d]'
          }`}
        >
          {t(labelKey as Parameters<typeof t>[0])}
        </button>
      ))}
    </div>
  );
}
```

**Step 2: Create `client/src/app/[locale]/catalog/page.tsx`**

```typescript
import { getTranslations } from 'next-intl/server';
import { getAllProducts, getProductsByCategory } from '@/lib/products';
import { ProductCard } from '@/components/common/ProductCard';
import { CategoryFilter } from '@/features/catalog/components/CategoryFilter';
import type { ProductCategory } from '@/types/product.types';
import { Package } from 'lucide-react';

interface CatalogPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}

export async function generateMetadata({ params }: CatalogPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'catalog' });
  return { title: `TechBrain — ${t('title')}` };
}

export default async function CatalogPage({ params, searchParams }: CatalogPageProps) {
  const { locale } = await params;
  const { category } = await searchParams;
  const t = await getTranslations({ locale });

  const validCategories: ProductCategory[] = ['cameras', 'nvr-kits', 'storage', 'services'];
  const activeCategory = category && validCategories.includes(category as ProductCategory)
    ? (category as ProductCategory)
    : null;

  const products = activeCategory
    ? getProductsByCategory(activeCategory)
    : getAllProducts();

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">{t('catalog.title')}</h1>

      {/* Filters */}
      <div className="mb-8">
        <CategoryFilter />
      </div>

      {/* Grid */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-[#001845] flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-[#7d8597]" />
          </div>
          <p className="text-[#979dac]">{t('catalog.no_products')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add client/src/app/\[locale\]/catalog client/src/features/catalog
git commit -m "feat: add catalog page with category filter"
```

---

## Task 7: Product detail page

**Files:**
- Create: `client/src/app/[locale]/catalog/[id]/page.tsx`

**Step 1: Create `client/src/app/[locale]/catalog/[id]/page.tsx`**

```typescript
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getProductById, getAllProductIds } from '@/lib/products';
import { AddToCartButton } from '@/features/cart/components/AddToCartButton';
import type { Locale } from '@/types/product.types';
import { ArrowLeft } from 'lucide-react';

interface ProductPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateStaticParams() {
  const ids = getAllProductIds();
  const locales = ['ka', 'ru', 'en'];
  return locales.flatMap((locale) =>
    ids.map((id) => ({ locale, id }))
  );
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { locale, id } = await params;
  const product = getProductById(id);
  if (!product) return { title: 'Not found' };
  return { title: `TechBrain — ${product.name[locale as Locale]}` };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale });
  const product = getProductById(id);

  if (!product) notFound();

  const l = locale as Locale;
  const isService = product.category === 'services';

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
      {/* Back */}
      <Link
        href={`/${locale}/catalog`}
        className="inline-flex items-center gap-1.5 text-sm text-[#979dac] hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('catalog.title')}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image */}
        <div className="aspect-square relative rounded-2xl overflow-hidden bg-[#001845] border border-[#33415c]">
          {product.images[0] ? (
            <Image
              src={`/images/products/${product.images[0]}`}
              alt={product.name[l]}
              fill
              priority
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl">📷</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-6">
          <div>
            <span className="text-xs font-medium text-[#0466c8] uppercase tracking-wide">
              {t(`catalog.${product.category.replace('-', '_') as 'cameras' | 'nvr_kits' | 'storage' | 'services'}`)}
            </span>
            <h1 className="text-3xl font-bold text-white mt-2 text-balance">
              {product.name[l]}
            </h1>
          </div>

          <p className="text-[#979dac] leading-relaxed">{product.description[l]}</p>

          {/* Price + CTA */}
          <div className="flex items-center gap-4 p-6 rounded-xl bg-[#001845] border border-[#33415c]">
            {isService ? (
              <span className="text-[#979dac]">ფასი შეთანხმებით / По договору / Price on request</span>
            ) : (
              <>
                <span className="text-3xl font-bold text-white">{product.price} ₾</span>
                <AddToCartButton product={product} />
              </>
            )}
          </div>

          {/* Specs */}
          {product.specs.length > 0 && (
            <div>
              <h2 className="font-semibold text-white mb-4">{t('catalog.specs')}</h2>
              <div className="rounded-xl border border-[#33415c] overflow-hidden">
                {product.specs.map((spec, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between px-4 py-3 ${
                      i % 2 === 0 ? 'bg-[#001845]' : 'bg-[#002855]'
                    }`}
                  >
                    <span className="text-sm text-[#979dac]">{spec.key[l]}</span>
                    <span className="text-sm font-medium text-white tabular-nums">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add "client/src/app/[locale]/catalog/[id]"
git commit -m "feat: add product detail page with specs table and add-to-cart"
```

---

## Task 8: Cart page + order form + Telegram API

**Files:**
- Create: `client/src/app/[locale]/cart/page.tsx`
- Create: `client/src/features/cart/components/CartPage.tsx`
- Create: `client/src/app/api/orders/route.ts`

**Step 1: Create `client/src/app/api/orders/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const OrderSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(6).max(20),
  locale: z.enum(['ka', 'ru', 'en']),
  items: z.array(
    z.object({
      name: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().nonnegative(),
    })
  ).min(1),
  total: z.number().nonnegative(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as unknown;
    const parsed = OrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    const { name, phone, locale, items, total } = parsed.data;

    const itemLines = items
      .map((i) => `• ${i.name} × ${i.quantity} — ${i.price * i.quantity} ₾`)
      .join('\n');

    const now = new Date().toLocaleString('ru-RU', {
      timeZone: 'Asia/Tbilisi',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const message = `🛒 New Order — TechBrain.ge\n\n👤 Name: ${name}\n📞 Phone: ${phone}\n🌐 Language: ${locale}\n\n📦 Order items:\n${itemLines}\n\n💰 Total: ${total} ₾\n\n🕐 ${now}`;

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || token === 'PLACEHOLDER_REPLACE_LATER' || !chatId || chatId === 'PLACEHOLDER_REPLACE_LATER') {
      // Placeholder mode — log and return success
      console.log('[Orders] Telegram placeholder mode. Order:', message);
      return NextResponse.json({ success: true });
    }

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    });

    if (!tgRes.ok) {
      console.error('[Orders] Telegram error:', await tgRes.text());
      return NextResponse.json({ success: false, error: 'Telegram error' }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Orders] Unexpected error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
```

**Step 2: Create `client/src/features/cart/components/CartPage.tsx`**

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Minus, Plus, Trash2, Phone } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import type { Locale } from '@/types/product.types';

interface CartPageProps {
  locale: string;
}

interface OrderForm {
  name: string;
  phone: string;
}

export function CartPage({ locale }: CartPageProps) {
  const t = useTranslations();
  const l = locale as Locale;
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore();
  const [form, setForm] = useState<OrderForm>({ name: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const phone = process.env.NEXT_PUBLIC_PHONE ?? '597470518';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          locale,
          items: items.map((i) => ({
            name: i.product.name[l],
            quantity: i.quantity,
            price: i.product.price,
          })),
          total: getTotalPrice(),
        }),
      });
      const data = await res.json() as { success: boolean };
      if (data.success) {
        setSuccess(true);
        clearCart();
      } else {
        setError(t('common.error'));
      }
    } catch {
      setError(t('common.error'));
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-24 text-center">
        <div className="max-w-md mx-auto p-8 rounded-2xl bg-[#001845] border border-[#33415c]">
          <div className="w-16 h-16 rounded-full bg-[#0466c8]/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('cart.success_title')}</h2>
          <p className="text-[#979dac] mb-6">{t('cart.success_message')}</p>
          <a
            href={`tel:${phone}`}
            className="inline-flex items-center gap-2 text-[#0466c8] font-bold text-xl hover:text-[#0353a4] transition-colors"
          >
            <Phone className="w-5 h-5" />
            {phone}
          </a>
          <div className="mt-8">
            <Link
              href={`/${locale}/catalog`}
              className="text-sm text-[#979dac] hover:text-white transition-colors"
            >
              {t('cart.empty_cta')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-24 text-center">
        <p className="text-[#979dac] mb-6">{t('cart.empty')}</p>
        <Link
          href={`/${locale}/catalog`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#0466c8] hover:bg-[#0353a4] text-white font-medium rounded-xl transition-all duration-200"
        >
          {t('cart.empty_cta')}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">{t('cart.title')}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex gap-4 p-4 rounded-xl bg-[#001845] border border-[#33415c]"
            >
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#002855] flex-shrink-0">
                {product.images[0] ? (
                  <Image
                    src={`/images/products/${product.images[0]}`}
                    alt={product.name[l]}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">📷</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{product.name[l]}</p>
                <p className="text-[#0466c8] font-bold">{product.price} ₾</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="w-8 h-8 rounded-lg bg-[#002855] hover:bg-[#33415c] text-white flex items-center justify-center transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center text-white font-medium tabular-nums">{quantity}</span>
                <button
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  className="w-8 h-8 rounded-lg bg-[#002855] hover:bg-[#33415c] text-white flex items-center justify-center transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => removeItem(product.id)}
                  className="w-8 h-8 rounded-lg text-[#7d8597] hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order form */}
        <div className="flex flex-col gap-6">
          {/* Total */}
          <div className="p-6 rounded-xl bg-[#001845] border border-[#33415c]">
            <div className="flex justify-between items-center">
              <span className="text-[#979dac]">{t('cart.total')}</span>
              <span className="text-2xl font-bold text-white">{getTotalPrice()} ₾</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 rounded-xl bg-[#001845] border border-[#33415c]">
            <h2 className="font-semibold text-white">{t('cart.order_title')}</h2>

            <div>
              <label className="block text-sm text-[#979dac] mb-1.5">{t('cart.name_label')}</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder={t('cart.name_placeholder')}
                className="w-full px-4 py-2.5 rounded-lg bg-[#002855] border border-[#33415c] text-white placeholder-[#7d8597] focus:outline-none focus:border-[#0466c8] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-[#979dac] mb-1.5">{t('cart.phone_label')}</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder={t('cart.phone_placeholder')}
                className="w-full px-4 py-2.5 rounded-lg bg-[#002855] border border-[#33415c] text-white placeholder-[#7d8597] focus:outline-none focus:border-[#0466c8] transition-colors"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#0466c8] hover:bg-[#0353a4] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] text-white font-semibold rounded-xl transition-all duration-200"
            >
              {submitting ? t('cart.submitting') : t('cart.submit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Create `client/src/app/[locale]/cart/page.tsx`**

```typescript
import { getTranslations } from 'next-intl/server';
import { CartPage } from '@/features/cart/components/CartPage';

interface CartRouteProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: CartRouteProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'cart' });
  return { title: `TechBrain — ${t('title')}` };
}

export default async function CartRoute({ params }: CartRouteProps) {
  const { locale } = await params;
  return <CartPage locale={locale} />;
}
```

**Step 4: Commit**

```bash
git add "client/src/app/[locale]/cart" client/src/features/cart/components/CartPage.tsx client/src/app/api
git commit -m "feat: add cart page, order form, and Telegram API route"
```

---

## Task 9: Admin authentication

**Files:**
- Create: `client/src/app/admin/page.tsx`
- Create: `client/src/app/admin/layout.tsx`
- Create: `client/src/app/api/admin/login/route.ts`
- Create: `client/src/app/api/admin/logout/route.ts`

**Step 1: Create `client/src/app/api/admin/login/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json() as { password?: string };

  if (body.password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ success: false, error: 'Wrong password' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('admin_session', process.env.ADMIN_SESSION_SECRET ?? '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  return response;
}
```

**Step 2: Create `client/src/app/api/admin/logout/route.ts`**

```typescript
import { NextResponse } from 'next/server';

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_session');
  return response;
}
```

**Step 3: Create `client/src/app/admin/page.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json() as { success: boolean };

    if (data.success) {
      router.push('/admin/dashboard');
    } else {
      setError('Wrong password');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#001233] px-4">
      <div className="w-full max-w-sm p-8 rounded-2xl bg-[#001845] border border-[#33415c]">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-[#0466c8] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">TB</span>
          </div>
          <span className="font-bold text-white">TechBrain Admin</span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-[#979dac] mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[#002855] border border-[#33415c] text-white placeholder-[#7d8597] focus:outline-none focus:border-[#0466c8] transition-colors"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#0466c8] hover:bg-[#0353a4] disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-200"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

**Step 4: Create `client/src/app/admin/layout.tsx`**

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TechBrain Admin',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-[#001233] text-white">
      {children}
    </div>
  );
}
```

**Step 5: Commit**

```bash
git add client/src/app/admin client/src/app/api/admin
git commit -m "feat: add admin login page with httpOnly cookie auth"
```

---

## Task 10: Admin dashboard + Product CRUD

**Files:**
- Create: `client/src/app/admin/dashboard/page.tsx`
- Create: `client/src/app/admin/products/new/page.tsx`
- Create: `client/src/app/admin/products/[id]/edit/page.tsx`
- Create: `client/src/features/admin/components/AdminHeader.tsx`
- Create: `client/src/features/admin/components/ProductForm.tsx`
- Create: `client/src/features/admin/actions/product.actions.ts`
- Create: `client/src/app/api/upload/route.ts`

**Step 1: Create `client/src/app/api/upload/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { cookies } from 'next/headers';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Auth check
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  if (session?.value !== process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ success: false, error: 'Invalid file type' }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ success: false, error: 'File too large (max 5MB)' }, { status: 400 });
  }

  const ext = file.type === 'image/png' ? '.png' : file.type === 'image/webp' ? '.webp' : '.jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const filePath = path.join(process.cwd(), 'public', 'images', 'products', filename);

  const bytes = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(bytes));

  return NextResponse.json({ success: true, filename });
}
```

**Step 2: Create `client/src/features/admin/actions/product.actions.ts`**

```typescript
'use server';

import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Product, ProductCategory, Locale } from '@/types/product.types';

const PRODUCTS_DIR = path.join(process.cwd(), 'public', 'data', 'products');
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'products');

async function requireAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  if (session?.value !== process.env.ADMIN_SESSION_SECRET) {
    redirect('/admin');
  }
}

export async function createProduct(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = `product-${Date.now()}`;
  const product: Product = {
    id,
    slug: (formData.get('slug') as string) || id,
    category: (formData.get('category') as ProductCategory) || 'cameras',
    price: Number(formData.get('price')) || 0,
    currency: 'GEL',
    isActive: formData.get('isActive') === 'true',
    isFeatured: formData.get('isFeatured') === 'true',
    images: JSON.parse((formData.get('images') as string) || '[]') as string[],
    name: {
      ka: (formData.get('name_ka') as string) || '',
      ru: (formData.get('name_ru') as string) || '',
      en: (formData.get('name_en') as string) || '',
    },
    description: {
      ka: (formData.get('description_ka') as string) || '',
      ru: (formData.get('description_ru') as string) || '',
      en: (formData.get('description_en') as string) || '',
    },
    specs: JSON.parse((formData.get('specs') as string) || '[]') as Product['specs'],
    createdAt: new Date().toISOString(),
  };

  if (!fs.existsSync(PRODUCTS_DIR)) fs.mkdirSync(PRODUCTS_DIR, { recursive: true });
  fs.writeFileSync(path.join(PRODUCTS_DIR, `${id}.json`), JSON.stringify(product, null, 2));

  revalidatePath('/');
  redirect('/admin/dashboard');
}

export async function updateProduct(id: string, formData: FormData): Promise<void> {
  await requireAdmin();

  const filePath = path.join(PRODUCTS_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) redirect('/admin/dashboard');

  const existing = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Product;
  const updated: Product = {
    ...existing,
    slug: (formData.get('slug') as string) || existing.slug,
    category: (formData.get('category') as ProductCategory) || existing.category,
    price: Number(formData.get('price')) || existing.price,
    isActive: formData.get('isActive') === 'true',
    isFeatured: formData.get('isFeatured') === 'true',
    images: JSON.parse((formData.get('images') as string) || JSON.stringify(existing.images)) as string[],
    name: {
      ka: (formData.get('name_ka') as string) || existing.name.ka,
      ru: (formData.get('name_ru') as string) || existing.name.ru,
      en: (formData.get('name_en') as string) || existing.name.en,
    },
    description: {
      ka: (formData.get('description_ka') as string) || existing.description.ka,
      ru: (formData.get('description_ru') as string) || existing.description.ru,
      en: (formData.get('description_en') as string) || existing.description.en,
    },
    specs: JSON.parse((formData.get('specs') as string) || JSON.stringify(existing.specs)) as Product['specs'],
  };

  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
  revalidatePath('/');
  redirect('/admin/dashboard');
}

export async function deleteProduct(id: string): Promise<void> {
  await requireAdmin();

  const filePath = path.join(PRODUCTS_DIR, `${id}.json`);
  if (fs.existsSync(filePath)) {
    const product = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Product;
    // Delete images
    for (const img of product.images) {
      const imgPath = path.join(IMAGES_DIR, img);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    fs.unlinkSync(filePath);
  }

  revalidatePath('/');
  redirect('/admin/dashboard');
}

export async function toggleProductActive(id: string, isActive: boolean): Promise<void> {
  await requireAdmin();

  const filePath = path.join(PRODUCTS_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) return;

  const product = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Product;
  product.isActive = isActive;
  fs.writeFileSync(filePath, JSON.stringify(product, null, 2));
  revalidatePath('/');
}
```

**Step 3: Create `client/src/features/admin/components/AdminHeader.tsx`**

```typescript
'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, LogOut, LayoutDashboard } from 'lucide-react';

export function AdminHeader() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  }

  return (
    <header className="border-b border-[#33415c] bg-[#001845] px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#0466c8] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">TB</span>
            </div>
            <span className="font-bold text-white">Admin</span>
          </div>
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-1.5 text-sm text-[#979dac] hover:text-white transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Products
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0466c8] hover:bg-[#0353a4] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-[#979dac] hover:text-white border border-[#33415c] hover:border-[#5c677d] rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
```

**Step 4: Create `client/src/app/admin/dashboard/page.tsx`**

```typescript
import Link from 'next/link';
import Image from 'next/image';
import { getAllProductsAdmin } from '@/lib/products';
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { deleteProduct, toggleProductActive } from '@/features/admin/actions/product.actions';
import { Pencil, Trash2 } from 'lucide-react';

export default async function AdminDashboardPage() {
  const products = getAllProductsAdmin();

  return (
    <>
      <AdminHeader />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Products ({products.length})</h1>
        </div>

        <div className="rounded-xl border border-[#33415c] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#33415c] bg-[#001845]">
                <th className="px-4 py-3 text-left text-sm font-medium text-[#979dac]">Image</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#979dac]">Name (KA)</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#979dac]">Category</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#979dac]">Price</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#979dac]">Active</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#979dac]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, i) => (
                <tr
                  key={product.id}
                  className={`border-b border-[#33415c] last:border-0 ${i % 2 === 0 ? 'bg-[#001233]' : 'bg-[#001845]'}`}
                >
                  <td className="px-4 py-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#002855]">
                      {product.images[0] ? (
                        <Image
                          src={`/images/products/${product.images[0]}`}
                          alt={product.name.ka}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">📷</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-white font-medium">{product.name.ka}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-[#0466c8]/10 text-[#0466c8] border border-[#0466c8]/20">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-white tabular-nums">
                      {product.price > 0 ? `${product.price} ₾` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <form action={toggleProductActive.bind(null, product.id, !product.isActive)}>
                      <button
                        type="submit"
                        className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                          product.isActive
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : 'bg-[#33415c]/10 text-[#7d8597] border-[#33415c]/20'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Hidden'}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="p-1.5 rounded-lg text-[#979dac] hover:text-white hover:bg-[#33415c] transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <form action={deleteProduct.bind(null, product.id)}>
                        <button
                          type="submit"
                          className="p-1.5 rounded-lg text-[#979dac] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          onClick={(e) => {
                            if (!confirm('Delete this product?')) e.preventDefault();
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
```

**Step 5: Create `client/src/features/admin/components/ProductForm.tsx`**

```typescript
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import type { Product } from '@/types/product.types';
import { Upload, X, Plus, Minus } from 'lucide-react';

interface ProductFormProps {
  product?: Product;
  action: (formData: FormData) => Promise<void>;
}

interface SpecRow {
  key_ka: string; key_ru: string; key_en: string; value: string;
}

export function ProductForm({ product, action }: ProductFormProps) {
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [specs, setSpecs] = useState<SpecRow[]>(
    product?.specs.map((s) => ({
      key_ka: s.key.ka, key_ru: s.key.ru, key_en: s.key.en, value: s.value,
    })) ?? []
  );
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json() as { success: boolean; filename?: string };
    if (data.success && data.filename) {
      setImages((imgs) => [...imgs, data.filename!]);
    }
    setUploading(false);
  }

  function addSpec() {
    setSpecs((s) => [...s, { key_ka: '', key_ru: '', key_en: '', value: '' }]);
  }

  function removeSpec(i: number) {
    setSpecs((s) => s.filter((_, idx) => idx !== i));
  }

  function updateSpec(i: number, field: keyof SpecRow, val: string) {
    setSpecs((s) => s.map((row, idx) => idx === i ? { ...row, [field]: val } : row));
  }

  const specsJson = JSON.stringify(specs.map((s) => ({
    key: { ka: s.key_ka, ru: s.key_ru, en: s.key_en },
    value: s.value,
  })));

  const fieldClass = "w-full px-3 py-2 rounded-lg bg-[#002855] border border-[#33415c] text-white placeholder-[#7d8597] focus:outline-none focus:border-[#0466c8] transition-colors text-sm";
  const labelClass = "block text-xs text-[#979dac] mb-1";

  return (
    <form action={action} className="flex flex-col gap-6 max-w-2xl">
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <input type="hidden" name="specs" value={specsJson} />

      {/* Images */}
      <section className="p-4 rounded-xl bg-[#001845] border border-[#33415c]">
        <h3 className="text-sm font-semibold text-white mb-3">Images</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {images.map((img) => (
            <div key={img} className="relative w-20 h-20 rounded-lg overflow-hidden bg-[#002855]">
              <Image src={`/images/products/${img}`} alt="" fill className="object-cover" />
              <button
                type="button"
                onClick={() => setImages((imgs) => imgs.filter((i) => i !== img))}
                className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-20 h-20 rounded-lg border-2 border-dashed border-[#33415c] hover:border-[#0466c8] flex items-center justify-center text-[#7d8597] hover:text-[#0466c8] transition-colors disabled:opacity-50"
          >
            <Upload className="w-5 h-5" />
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUpload} />
        {uploading && <p className="text-xs text-[#979dac]">Uploading...</p>}
      </section>

      {/* Basic info */}
      <section className="p-4 rounded-xl bg-[#001845] border border-[#33415c] grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelClass}>Slug (URL ID)</label>
          <input name="slug" defaultValue={product?.slug ?? ''} placeholder="v380-pro-wifi" className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <select name="category" defaultValue={product?.category ?? 'cameras'} className={fieldClass}>
            <option value="cameras">Cameras</option>
            <option value="nvr-kits">NVR Kits</option>
            <option value="storage">Storage</option>
            <option value="services">Services</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Price (GEL)</label>
          <input name="price" type="number" min="0" defaultValue={product?.price ?? 0} className={fieldClass} />
        </div>
        <div className="flex items-center gap-2">
          <input name="isActive" type="checkbox" value="true" defaultChecked={product?.isActive ?? true} id="isActive" className="rounded" />
          <label htmlFor="isActive" className="text-sm text-[#979dac]">Active (visible)</label>
        </div>
        <div className="flex items-center gap-2">
          <input name="isFeatured" type="checkbox" value="true" defaultChecked={product?.isFeatured ?? false} id="isFeatured" className="rounded" />
          <label htmlFor="isFeatured" className="text-sm text-[#979dac]">Featured (homepage)</label>
        </div>
      </section>

      {/* Names */}
      <section className="p-4 rounded-xl bg-[#001845] border border-[#33415c] flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-white">Product Name</h3>
        {(['ka', 'ru', 'en'] as const).map((lang) => (
          <div key={lang}>
            <label className={labelClass}>Name ({lang.toUpperCase()})</label>
            <input name={`name_${lang}`} defaultValue={product?.name[lang] ?? ''} className={fieldClass} />
          </div>
        ))}
      </section>

      {/* Descriptions */}
      <section className="p-4 rounded-xl bg-[#001845] border border-[#33415c] flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-white">Description</h3>
        {(['ka', 'ru', 'en'] as const).map((lang) => (
          <div key={lang}>
            <label className={labelClass}>Description ({lang.toUpperCase()})</label>
            <textarea name={`description_${lang}`} rows={3} defaultValue={product?.description[lang] ?? ''} className={`${fieldClass} resize-none`} />
          </div>
        ))}
      </section>

      {/* Specs */}
      <section className="p-4 rounded-xl bg-[#001845] border border-[#33415c] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Specifications</h3>
          <button type="button" onClick={addSpec} className="flex items-center gap-1 text-xs text-[#0466c8] hover:text-[#0353a4]">
            <Plus className="w-3 h-3" /> Add spec
          </button>
        </div>
        {specs.map((spec, i) => (
          <div key={i} className="grid grid-cols-4 gap-2 items-start">
            <input placeholder="Key KA" value={spec.key_ka} onChange={(e) => updateSpec(i, 'key_ka', e.target.value)} className={fieldClass} />
            <input placeholder="Key RU" value={spec.key_ru} onChange={(e) => updateSpec(i, 'key_ru', e.target.value)} className={fieldClass} />
            <input placeholder="Key EN" value={spec.key_en} onChange={(e) => updateSpec(i, 'key_en', e.target.value)} className={fieldClass} />
            <div className="flex gap-1">
              <input placeholder="Value" value={spec.value} onChange={(e) => updateSpec(i, 'value', e.target.value)} className={fieldClass} />
              <button type="button" onClick={() => removeSpec(i)} className="text-[#7d8597] hover:text-red-400 flex-shrink-0">
                <Minus className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </section>

      <button
        type="submit"
        className="py-3 bg-[#0466c8] hover:bg-[#0353a4] active:scale-[0.98] text-white font-semibold rounded-xl transition-all duration-200"
      >
        {product ? 'Save Changes' : 'Create Product'}
      </button>
    </form>
  );
}
```

**Step 6: Create `client/src/app/admin/products/new/page.tsx`**

```typescript
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { ProductForm } from '@/features/admin/components/ProductForm';
import { createProduct } from '@/features/admin/actions/product.actions';

export default function NewProductPage() {
  return (
    <>
      <AdminHeader />
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-8">Add Product</h1>
        <ProductForm action={createProduct} />
      </div>
    </>
  );
}
```

**Step 7: Create `client/src/app/admin/products/[id]/edit/page.tsx`**

```typescript
import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/products';
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { ProductForm } from '@/features/admin/components/ProductForm';
import { updateProduct } from '@/features/admin/actions/product.actions';

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditPageProps) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) notFound();

  const action = updateProduct.bind(null, id);

  return (
    <>
      <AdminHeader />
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-8">Edit: {product.name.ka}</h1>
        <ProductForm product={product} action={action} />
      </div>
    </>
  );
}
```

**Step 8: Commit**

```bash
git add client/src/app/admin client/src/features/admin client/src/app/api/upload
git commit -m "feat: add admin dashboard, product CRUD with image upload"
```

---

## Task 11: Final polish — Not Found page, build verification

**Files:**
- Create: `client/src/app/not-found.tsx`
- Create: `client/src/app/[locale]/not-found.tsx`

**Step 1: Create `client/src/app/not-found.tsx`**

```typescript
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#001233] text-center px-4">
      <div>
        <p className="text-8xl font-bold text-[#0466c8] mb-4">404</p>
        <p className="text-white text-xl mb-8">Page not found</p>
        <Link href="/ka" className="px-6 py-3 bg-[#0466c8] hover:bg-[#0353a4] text-white rounded-xl transition-colors">
          Go Home
        </Link>
      </div>
    </div>
  );
}
```

**Step 2: Run production build to check for TypeScript/build errors**

```bash
cd client && npm run build
```
Expected: Build succeeds with no TypeScript errors. All routes generate successfully.

**Step 3: Fix any TypeScript errors that appear during build**

Common issues to watch for:
- `params` must be `Promise<{...}>` in Next.js 16 (already handled in plan)
- `searchParams` must be `Promise<{...}>` in Next.js 16 (already handled)
- `cookies()` returns `Promise` in Next.js 16 (already handled with `await cookies()`)

**Step 4: Run dev and manually test**

Checklist:
- [ ] `http://localhost:3000` redirects to `/ka`
- [ ] Language switcher switches to `/ru` and `/en`
- [ ] Catalog shows all 4 sample products
- [ ] Category filter works
- [ ] Product detail page opens
- [ ] "Add to Cart" adds to cart badge in header
- [ ] Cart page shows items, can change quantity, remove
- [ ] Order form submits (check console for "[Orders] Telegram placeholder mode")
- [ ] Success screen shows phone number
- [ ] `/admin` shows login form
- [ ] Login with password from `.env.local` → redirects to dashboard
- [ ] Can add/edit/delete products
- [ ] Image upload works

**Step 5: Final commit**

```bash
git add .
git commit -m "feat: complete TechBrain.ge catalog site with admin panel"
```

---

## Environment Setup Summary

`.env.local` needed values:
```env
ADMIN_PASSWORD=techbrain2024
ADMIN_SESSION_SECRET=tb_session_placeholder_32chars_xx
TELEGRAM_BOT_TOKEN=PLACEHOLDER_REPLACE_LATER
TELEGRAM_CHAT_ID=PLACEHOLDER_REPLACE_LATER
NEXT_PUBLIC_PHONE=597470518
NEXT_PUBLIC_APP_NAME=TechBrain
```

When Telegram bot is ready:
1. Create bot via `@BotFather` on Telegram
2. Get bot token
3. Send `/start` to the bot from your account
4. Get your chat ID: `https://api.telegram.org/bot<TOKEN>/getUpdates`
5. Update `.env.local` with real `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`

---

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# From client/ directory
vercel

# Set environment variables in Vercel dashboard or via CLI:
vercel env add ADMIN_PASSWORD
vercel env add ADMIN_SESSION_SECRET
vercel env add TELEGRAM_BOT_TOKEN
vercel env add TELEGRAM_CHAT_ID
vercel env add NEXT_PUBLIC_PHONE
```

**Note on admin file writes on Vercel:** Vercel's filesystem is read-only in production. For admin product CRUD on Vercel, you have two options:
1. Use Vercel's `/tmp` directory for temp storage and push to GitHub via API (complex)
2. **Recommended:** Run admin locally and commit JSON files, then redeploy. This is standard for "content as code" approach and perfectly fine for a small catalog.
