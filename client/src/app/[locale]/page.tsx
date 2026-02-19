import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import {
  ArrowRight,
  Phone,
  ShieldCheck,
  Wrench,
  Truck,
} from '@phosphor-icons/react/dist/ssr';
import { getFeaturedProducts, getAllProducts, getSiteSettings } from '@/lib/content';
import { ProductCard } from '@/components/common/ProductCard';
import { CategoryGrid } from '@/components/common/CategoryGrid';
import { TopProductsSlider } from '@/components/common/TopMatchesSlider';
import { ProjectsSection } from '@/components/common/ProjectsSection';
import { BlogSection } from '@/components/common/BlogSection';
import type { Locale } from '@/types/product.types';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });

  const descriptions: Record<string, string> = {
    ka: 'TechBrain — უსაფრთხოების კამერების გაყიდვა და მონტაჟი თბილისში. 500+ დამონტაჟებული სისტემა, 2 წლიანი გარანტია. კამერები, NVR კომპლექტები, შენახვა.',
    ru: 'TechBrain — продажа и монтаж камер видеонаблюдения в Тбилиси. 500+ установленных систем, гарантия 2 года. Камеры, NVR комплекты, накопители.',
    en: 'TechBrain — security camera sales and installation in Tbilisi, Georgia. 500+ installed systems, 2-year warranty. Cameras, NVR kits, storage devices.',
  };
  const description = descriptions[locale] ?? descriptions['en'];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://techbrain.ge';
  const canonicalUrl = `${siteUrl}/${locale}`;

  return {
    title: `TechBrain — ${t('hero_title')}`,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'ka-GE': `${siteUrl}/ka`,
        'ru-GE': `${siteUrl}/ru`,
        'en-US': `${siteUrl}/en`,
        'x-default': `${siteUrl}/ka`,
      },
    },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title: `TechBrain — ${t('hero_title')}`,
      description,
      siteName: 'TechBrain',
      images: [
        {
          url: `${siteUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'TechBrain — კამერები და უსაფრთხოების სისტემები',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `TechBrain — ${t('hero_title')}`,
      description,
      images: [`${siteUrl}/og-image.jpg`],
    },
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const featured = getFeaturedProducts();
  const allProducts = getAllProducts();
  const siteSettings = getSiteSettings();
  const phone = siteSettings.contact.phone || '597470518';

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://techbrain.ge';
  const { business, hours } = siteSettings;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        '@id': `${siteUrl}/#organization`,
        name: business.companyName,
        url: siteUrl,
        telephone: `+995${phone}`,
        image: [`${siteUrl}/og-image.jpg`, `${siteUrl}/logo.jpg`],
        description: t('home.hero_subtitle'),
        areaServed: {
          '@type': 'GeoCircle',
          geoMidpoint: { '@type': 'GeoCoordinates', latitude: business.geo.latitude, longitude: business.geo.longitude },
          geoRadius: '50000',
        },
        address: {
          '@type': 'PostalAddress',
          addressLocality: business.address.city,
          addressRegion: business.address.region,
          addressCountry: business.address.country,
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: business.geo.latitude,
          longitude: business.geo.longitude,
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
            opens: hours.weekdays.open,
            closes: hours.weekdays.close,
          },
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Sunday'],
            opens: hours.sunday.open,
            closes: hours.sunday.close,
          },
        ],
        sameAs: [`https://wa.me/995${phone}`],
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: business.companyName,
        inLanguage: locale,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    <div>

      {/* ── ABOVE FOLD (mobile): Hero + Slider + Categories ── */}
      <div>

      {/* ── HERO ── */}
      <section className="hero-bg relative -mt-17 flex items-center">

        {/* Ambient blur blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 -left-24 w-125 h-125 bg-primary/10 rounded-full blur-3xl motion-safe:animate-pulse" />
          <div className="absolute bottom-1/3 -right-24 w-100 h-100 bg-brand-purple/8 rounded-full blur-3xl motion-safe:animate-pulse motion-safe:[animation-delay:1000ms]" />
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-background to-transparent pointer-events-none" aria-hidden="true" />

        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10 pt-20 pb-4 md:pt-32 md:pb-10">

          {/* Badge — HUD status indicator (hidden on mobile) */}
          <div className="hidden sm:flex justify-center mb-4 md:mb-6">
            <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-lg bg-foreground/4 border border-foreground/8 backdrop-blur-sm">
              <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full rounded-full bg-online opacity-50 motion-safe:animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-online" />
              </span>
              <span className="text-xs font-semibold text-foreground/70 tracking-wide uppercase">
                {t('home.hero_badge')}
              </span>
            </span>
          </div>

          {/* Headline */}
          <div className="text-center -mt-6 sm:mt-0 mb-3 md:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-wrap-balance text-hero-shimmer">
              {t('home.hero_title')}
            </h1>
          </div>

          {/* Products Slider */}
          {allProducts.length > 0 && (
            <TopProductsSlider
              products={allProducts}
              locale={locale as Locale}
              labels={{
                title: t('home.featured_title'),
                inStock: t('catalog.in_stock'),
                priceOnRequest: t('catalog.price_on_request'),
                viewAll: t('home.hero_cta'),
                viewAllHref: `/${locale}/catalog`,
                noProducts: t('catalog.no_products'),
                categoryLabels: {
                  all: t('catalog.all'),
                  cameras: t('catalog.cameras'),
                  'nvr-kits': t('catalog.nvr_kits'),
                  storage: t('catalog.storage'),
                  services: t('catalog.services'),
                  accessories: t('catalog.accessories'),
                },
              }}
            />
          )}

        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="pt-8 pb-36 md:py-8 bg-background">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <CategoryGrid
            locale={locale}
            counts={allProducts.reduce<Record<string, number>>((acc, p) => {
              acc[p.category] = (acc[p.category] ?? 0) + 1;
              return acc;
            }, {})}
          />
        </div>
      </section>

      </div>

      {/* ── FEATURED PRODUCTS ── */}
      {featured.length > 0 && (
        <section className="py-10 lg:py-14 bg-background" aria-labelledby="featured-heading">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">

            {/* Section header */}
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
                  {t('home.featured_subtitle')}
                </span>
                <h2 id="featured-heading" className="text-2xl md:text-3xl font-bold text-foreground">
                  {t('home.featured_title')}
                </h2>
              </div>
              <Link
                href={`/${locale}/catalog`}
                className="hidden md:flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg px-2 py-1 mb-0.5"
              >
                {t('home.hero_cta')}
                <ArrowRight size={14} weight="bold" aria-hidden="true" />
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

      {/* ── PROJECTS ── */}
      <ProjectsSection />

      {/* ── BLOG ── */}
      <BlogSection locale={locale} />

      {/* ── WHY US ── */}
      <section className="py-10 lg:py-14 bg-secondary/30 border-y border-border/40" aria-labelledby="trust-heading">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">

          {/* Section header */}
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
              {t('home.about_subtitle')}
            </span>
            <h2 id="trust-heading" className="text-2xl md:text-3xl font-bold text-foreground">
              {t('home.about_title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="flex items-start gap-4 p-6 rounded-xl bg-background border border-border/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Wrench size={22} weight="duotone" className="text-primary" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">{t('home.about_install')}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">{t('home.about_install_desc')}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-xl bg-primary/5 border border-primary/15 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <ShieldCheck size={22} weight="duotone" className="text-primary" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">{t('home.about_guarantee')}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">{t('home.about_guarantee_desc')}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-xl bg-background border border-border/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Truck size={22} weight="duotone" className="text-primary" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">{t('home.about_delivery')}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">{t('home.about_delivery_desc')}</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA — Newsletter-style (AndrewAltair) ── */}
      <section className="cta-bg py-14 lg:py-20" aria-labelledby="cta-heading">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center max-w-4xl">

          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-lg bg-white/[0.08] border border-white/[0.12] backdrop-blur-sm mb-6">
            <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full rounded-full bg-online opacity-50 motion-safe:animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-online" />
            </span>
            <span className="text-xs font-semibold text-white/80 tracking-wide uppercase">{t('home.cta_subtitle')}</span>
          </div>

          <h2 id="cta-heading" className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            {t('home.cta_title')}
          </h2>

          <p className="text-lg text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('home.hero_subtitle')}
          </p>

          <a
            href={`https://wa.me/995${phone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-4 px-10 py-5 rounded-xl bg-white hover:bg-white/95 text-primary font-bold text-xl shadow-2xl shadow-black/20 transition-all duration-300 motion-safe:hover:scale-105 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 active:scale-[0.98]"
            aria-label={`WhatsApp — ${phone}`}
          >
            <Phone size={28} weight="fill" aria-hidden="true" />
            <span className="tabular-nums tracking-tight">{phone}</span>
          </a>

          <p className="mt-4 text-sm text-white/40">{t('home.cta_button')}</p>

        </div>
      </section>

    </div>
    </>
  );
}
