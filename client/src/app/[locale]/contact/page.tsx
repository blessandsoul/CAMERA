import { getTranslations } from 'next-intl/server';
import { Phone, Envelope, MapPin, Clock } from '@phosphor-icons/react/dist/ssr';
import { ContactForm } from '@/features/contact/components/ContactForm';
import { getSiteSettings } from '@/lib/content';
import { formatPhone } from '@/lib/utils/format';

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ContactPageProps): Promise<{ title: string }> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });
  return { title: `TechBrain — ${t('title')}` };
}

export default async function ContactPage({ params }: ContactPageProps): Promise<React.ReactElement> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const settings = getSiteSettings();
  const phone = settings.contact.phone || '597470518';

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t('contact.title')}</h1>
        <p className="text-muted-foreground mb-8">{t('contact.subtitle')}</p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3">
            <ContactForm locale={locale} />
          </div>

          {/* Info sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact info */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-semibold text-foreground">{t('contact.info_title')}</h3>

              <a
                href={`https://wa.me/995${phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone size={18} weight="fill" className="text-primary shrink-0" />
                <span>{formatPhone(phone)}</span>
              </a>

              {settings.contact.email && (
                <a
                  href={`mailto:${settings.contact.email}`}
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Envelope size={18} weight="fill" className="text-primary shrink-0" />
                  <span>{settings.contact.email}</span>
                </a>
              )}

              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin size={18} weight="fill" className="text-primary shrink-0" />
                <span>{settings.business.address.city}, {settings.business.address.region}</span>
              </div>

              {/* Social links */}
              <div className="pt-3 border-t border-border/60">
                <div className="flex items-center gap-2">
                  <a
                    href="https://www.facebook.com/TechbrainGE"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                    </svg>
                  </a>
                  <a
                    href="https://www.instagram.com/techbrainge/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Business hours */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Clock size={18} weight="fill" className="text-primary" />
                {t('contact.hours_title')}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('contact.weekdays')}</span>
                  <span className="text-foreground font-medium">{settings.hours.weekdays.open} — {settings.hours.weekdays.close}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('contact.sunday')}</span>
                  <span className="text-foreground font-medium">{settings.hours.sunday.open} — {settings.hours.sunday.close}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
