import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Logo } from './Logo';
import { getSiteSettings } from '@/lib/content';

interface FooterProps {
  locale: string;
}

export async function Footer({ locale }: FooterProps) {
  const t = await getTranslations({ locale });
  const settings = getSiteSettings();
  const phone = settings.contact.phone || '597470518';
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-surface mt-auto">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">

          {/* Brand */}
          <div>
            <div className="mb-4">
              <Logo size={32} />
            </div>
            <p className="text-base text-muted-foreground leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">{t('nav.catalog')}</h3>
            <ul className="space-y-2.5">
              {[
                { href: `/${locale}/catalog?category=cameras`, label: t('catalog.cameras') },
                { href: `/${locale}/catalog?category=nvr-kits`, label: t('catalog.nvr_kits') },
                { href: `/${locale}/catalog?category=storage`, label: t('catalog.storage') },
                { href: `/${locale}/catalog?category=services`, label: t('catalog.services') },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-base text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">{t('footer.contact')}</h3>
            <a
              href={`https://wa.me/995${phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-hover transition-colors duration-200 cursor-pointer group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
              </svg>
              <span className="font-bold text-lg tabular-nums group-hover:underline">{phone}</span>
            </a>
          </div>

        </div>

        <div className="border-t border-border/60 pt-8 text-center">
          <p className="text-sm text-subtle">© {year} {settings.business.companyName}. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
}
