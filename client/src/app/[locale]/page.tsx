import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ArrowRight, Phone, ShieldCheck, Wrench, Truck } from '@phosphor-icons/react/dist/ssr';
import { getFeaturedProducts, getAllProducts, getSiteSettings } from '@/lib/content';
import { ProductCard } from '@/components/common/ProductCard';
import { FeaturedSectionToggle } from '@/components/common/FeaturedSectionToggle';
import { ProjectsSection } from '@/components/common/ProjectsSection';
import { BlogSection } from '@/components/common/BlogSection';
import { HeroRouter } from '@/components/home/HeroRouter';
import { CategoryProductsBlock } from '@/components/common/CategoryProductsBlock';
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

      {/* ══════════════════════════════════════════════════════════════════
          HERO — AndrewAltair layout: left text + right slider
      ══════════════════════════════════════════════════════════════════ */}
      <section className="hero-bg relative -mt-17 flex flex-col overflow-hidden">

        {/* Animated background blobs */}
        <div className="absolute inset-0 noise-overlay pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl motion-safe:animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl motion-safe:animate-pulse motion-safe:[animation-delay:1000ms]" />
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-background to-transparent pointer-events-none" aria-hidden="true" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20 pb-3 md:pt-28 lg:pt-24 lg:pb-3">
          <HeroRouter
            products={allProducts}
            locale={locale as Locale}
            phone={phone}
            labels={{
              heroTitle: t('home.hero_title'),
              heroSubtitle: t('home.hero_subtitle'),
              heroCta: t('home.hero_cta'),
              all: t('catalog.all'),
              cameras: t('catalog.cameras'),
              nvrKits: t('catalog.nvr_kits'),
              storage: t('catalog.storage'),
              accessories: t('catalog.accessories'),
              services: t('catalog.services'),
              priceOnRequest: t('catalog.price_on_request'),
              viewProduct: locale === 'ka' ? 'სრულად ნახვა' : locale === 'ru' ? 'Подробнее' : 'View product',
            }}
          />
        </div>

        {/* ── CATEGORIES + MINI PRODUCTS — inside same screen ── */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-6">
          {/* Section heading */}
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
              {t('home.popular_products_subtitle')}
            </span>
            <h2 className="text-lg font-bold text-foreground leading-tight">
              {t('home.popular_products')}
            </h2>
          </div>
          <CategoryProductsBlock
            products={allProducts}
            locale={locale as Locale}
            inStockLabel={locale === 'ru' ? 'В наличии' : locale === 'en' ? 'In Stock' : 'მარაგშია'}
            priceOnRequestLabel={t('catalog.price_on_request')}
            categoryLabels={{
              cameras:     t('catalog.cameras'),
              'nvr-kits':  t('catalog.nvr_kits'),
              storage:     t('catalog.storage'),
              accessories: t('catalog.accessories'),
              services:    t('catalog.services'),
            }}
          />
        </div>

      </section>

      {/* ── TRUST STATS ── */}
      <section className="py-6 bg-background">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

            <div className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} weight="duotone" className="text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xl font-black text-foreground tabular-nums leading-none">500+</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t('home.about_install')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5 hover:border-primary/40 hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} weight="duotone" className="text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xl font-black text-foreground tabular-nums leading-none">2 {locale === 'ru' ? 'года' : locale === 'en' ? 'years' : 'წელი'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t('home.about_guarantee')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Wrench size={20} weight="duotone" className="text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xl font-black text-foreground tabular-nums leading-none">24/7</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t('home.about_install_desc').slice(0, 28)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Truck size={20} weight="duotone" className="text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xl font-black text-foreground tabular-nums leading-none">{locale === 'ru' ? 'Быстро' : locale === 'en' ? 'Fast' : 'სწრაფი'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t('home.about_delivery')}</p>
              </div>
            </div>

          </div>
        </div>
      </section>

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

            <FeaturedSectionToggle
              products={featured}
              locale={locale as Locale}
              priceOnRequest={t('catalog.price_on_request')}
              variantALabel={t('home.slider_cards')}
              variantBLabel={t('home.slider_showcase')}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featured.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </FeaturedSectionToggle>

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
