import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, MapPin, CalendarBlank, SecurityCamera, Buildings, House, Storefront } from '@phosphor-icons/react/dist/ssr';
import { getTranslations } from 'next-intl/server';
import { getProjectById, getAllProjects } from '@/lib/content';
import type { Locale } from '@/types/product.types';

const TYPE_ICONS: Record<string, typeof Buildings> = {
  commercial: Buildings,
  residential: House,
  retail: Storefront,
  office: Buildings,
};

const TYPE_KEYS: Record<string, string> = {
  commercial: 'projects.type_commercial',
  residential: 'projects.type_residential',
  retail: 'projects.type_retail',
  office: 'projects.type_office',
};

interface ProjectPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateStaticParams(): Promise<Array<{ locale: string; id: string }>> {
  const projects = getAllProjects();
  const locales = ['ka', 'ru', 'en'];
  return locales.flatMap((locale) =>
    projects.map((p) => ({ locale, id: p.id }))
  );
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<{ title: string }> {
  const { locale, id } = await params;
  const project = getProjectById(id);
  if (!project) return { title: 'Not found' };
  const loc = locale as Locale;
  const title = project.title[loc] || project.title.ka;
  return { title: `TechBrain — ${title}` };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps): Promise<React.ReactElement> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale });
  const project = getProjectById(id);
  const loc = locale as Locale;

  if (!project) {
    return (
      <div className="container mx-auto px-4 max-w-7xl py-24 text-center text-muted-foreground">
        {t('projects.not_found')}
      </div>
    );
  }

  const title = project.title[loc] || project.title.ka;
  const location = project.location[loc] || project.location.ka;
  const Icon = TYPE_ICONS[project.type];
  const typeLabel = t(TYPE_KEYS[project.type]);

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-12">
      <Link
        href={`/${locale}/projects`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft size={16} weight="bold" />
        {t('projects.back')}
      </Link>

      <article className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              <Icon size={13} weight="duotone" aria-hidden="true" />
              {typeLabel}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4 text-balance">
            {title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
            <div className="flex items-center gap-1.5">
              <MapPin size={15} weight="fill" />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CalendarBlank size={15} weight="regular" />
              <span className="tabular-nums">{project.year}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <SecurityCamera size={15} weight="duotone" />
              <span className="tabular-nums">{project.cameras} {t('projects.cameras_installed')}</span>
            </div>
          </div>
        </header>

        {/* Cover image */}
        {project.image && (
          <div className="relative w-full h-64 md:h-[28rem] rounded-2xl overflow-hidden mb-10 bg-muted">
            <Image
              src={project.image}
              alt={title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 896px"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"
              aria-hidden="true"
            />
          </div>
        )}

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl border border-border/50 bg-card">
            <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2">{t('projects.project_type')}</div>
            <div className="flex items-center gap-2">
              <Icon size={18} weight="duotone" className="text-primary" aria-hidden="true" />
              <span className="text-base font-bold text-foreground">{typeLabel}</span>
            </div>
          </div>
          <div className="p-5 rounded-xl border border-border/50 bg-card">
            <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2">{t('projects.location_label')}</div>
            <div className="flex items-center gap-2">
              <MapPin size={18} weight="fill" className="text-primary" aria-hidden="true" />
              <span className="text-base font-bold text-foreground">{location}</span>
            </div>
          </div>
          <div className="p-5 rounded-xl border border-border/50 bg-card">
            <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2">{t('projects.cameras_installed')}</div>
            <div className="flex items-center gap-2">
              <SecurityCamera size={18} weight="duotone" className="text-primary" aria-hidden="true" />
              <span className="text-base font-bold text-foreground tabular-nums">{project.cameras}</span>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
