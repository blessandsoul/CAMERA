import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, MapPin, SecurityCamera, Buildings, House, Storefront } from '@phosphor-icons/react/dist/ssr';
import { getTranslations } from 'next-intl/server';
import { getAllProjects } from '@/lib/content';
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

interface ProjectsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ProjectsPageProps): Promise<{ title: string }> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return { title: `TechBrain — ${t('projects.title')}` };
}

export default async function ProjectsPage({ params }: ProjectsPageProps): Promise<React.ReactElement> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const projects = getAllProjects();
  const loc = locale as Locale;

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-12">
      <Link
        href={`/${locale}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft size={16} weight="bold" />
        {t('projects.back_home')}
      </Link>

      <h1 className="text-3xl font-bold text-foreground mb-8">{t('projects.title')}</h1>

      {projects.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          {t('projects.empty')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => {
            const title = project.title[loc] || project.title.ka;
            const location = project.location[loc] || project.location.ka;
            const Icon = TYPE_ICONS[project.type];
            const typeLabel = t(TYPE_KEYS[project.type]);

            return (
              <Link key={project.id} href={`/${locale}/projects/${project.id}`} className="group">
                <article className="flex flex-col rounded-xl overflow-hidden border border-border/50 bg-card transition-all duration-300 motion-safe:hover:-translate-y-0.5 hover:border-primary/20 h-full">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-muted shrink-0">
                    {project.image ? (
                      <Image
                        src={project.image}
                        alt={title}
                        fill
                        priority={i === 0}
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <SecurityCamera size={36} weight="duotone" className="text-border/60" aria-hidden="true" />
                      </div>
                    )}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent pointer-events-none"
                      aria-hidden="true"
                    />

                    {/* Year badge */}
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/90 backdrop-blur-sm border border-border/60 text-[10px] font-bold tabular-nums text-muted-foreground">
                        <span className="w-1 h-1 rounded-full bg-primary" aria-hidden="true" />
                        {project.year}
                      </span>
                    </div>

                    {/* Cameras count */}
                    <div className="absolute bottom-3 left-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/90 backdrop-blur-sm border border-border/60 text-[10px] font-bold text-foreground">
                        <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden="true">
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-online" />
                        </span>
                        <span className="tabular-nums">{project.cameras}</span>
                        <span className="text-muted-foreground font-semibold">{t('projects.stat_cameras')}</span>
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex flex-col flex-1 p-5 gap-2">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Icon size={13} weight="duotone" className="text-primary shrink-0" aria-hidden="true" />
                      <span className="text-xs font-bold uppercase tracking-[0.12em]">{typeLabel}</span>
                    </div>

                    <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200">
                      {title}
                    </h3>

                    <div className="flex items-center gap-1 text-muted-foreground mt-auto">
                      <MapPin size={13} weight="fill" className="shrink-0" aria-hidden="true" />
                      <span className="text-xs truncate">{location}</span>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
