import Image from 'next/image';
import { MapPin, Buildings, House, Storefront, SecurityCamera } from '@phosphor-icons/react/dist/ssr';
import { getTranslations, getLocale } from 'next-intl/server';
import { getSiteSettings, getAllProjects } from '@/lib/content';
import type { Locale } from '@/types/product.types';

const TYPE_ICONS = {
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

function splitStat(value: string): { num: string; suffix: string } {
  const match = value.match(/^([\d,.]+)(.*)$/);
  return match ? { num: match[1], suffix: match[2] } : { num: value, suffix: '' };
}

export async function ProjectsSection(): Promise<React.JSX.Element> {
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;
  const settings = getSiteSettings();
  const projectData = getAllProjects();
  const cameraStat = splitStat(settings.stats.camerasInstalled);
  const projectsStat = splitStat(settings.stats.projectsCompleted);
  const yearsStat = splitStat(settings.stats.yearsExperience);

  if (projectData.length === 0) return <></>;

  return (
    <section className="py-10 lg:py-14 bg-background" aria-labelledby="projects-heading">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
              {t('projects.eyebrow')}
            </span>
            <h2 id="projects-heading" className="text-2xl md:text-3xl font-bold text-foreground">
              {t('projects.title')}
            </h2>
          </div>

          {/* Stats — desktop */}
          <div className="hidden md:flex items-center gap-8">
            <div className="text-right">
              <div className="text-3xl font-black text-foreground tabular-nums">{cameraStat.num}<span className="text-primary">{cameraStat.suffix}</span></div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest">{t('projects.stat_cameras')}</div>
            </div>
            <div className="h-8 w-px bg-border" aria-hidden="true" />
            <div className="text-right">
              <div className="text-3xl font-black text-foreground tabular-nums">{projectsStat.num}<span className="text-primary">{projectsStat.suffix}</span></div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest">{t('projects.stat_projects')}</div>
            </div>
            <div className="h-8 w-px bg-border" aria-hidden="true" />
            <div className="text-right">
              <div className="text-3xl font-black text-foreground tabular-nums">{yearsStat.num}<span className="text-primary">{yearsStat.suffix}</span></div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest">{t('projects.stat_years')}</div>
            </div>
          </div>
        </div>

        {/* Stats — mobile */}
        <div className="grid grid-cols-3 gap-3 mb-6 md:hidden">
          <div className="text-center p-3 rounded-xl bg-card border border-border/50">
            <div className="text-xl font-black text-foreground tabular-nums">{cameraStat.num}<span className="text-primary text-sm">{cameraStat.suffix}</span></div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{t('projects.stat_cameras')}</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-card border border-border/50">
            <div className="text-xl font-black text-foreground tabular-nums">{projectsStat.num}<span className="text-primary text-sm">{projectsStat.suffix}</span></div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{t('projects.stat_projects')}</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-card border border-border/50">
            <div className="text-xl font-black text-foreground tabular-nums">{yearsStat.num}<span className="text-primary text-sm">{yearsStat.suffix}</span></div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{t('projects.stat_years')}</div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {projectData.map((project) => {
            const Icon = TYPE_ICONS[project.type];
            const typeLabel = t(TYPE_KEYS[project.type]);
            const title = project.title[locale] || project.title.ka;
            const location = project.location[locale] || project.location.ka;
            return (
              <article
                key={project.id}
                className="group relative rounded-xl overflow-hidden border border-border/50 bg-card shadow-sm transition-all duration-300 hover:shadow-lg motion-safe:hover:-translate-y-0.5 hover:border-primary/20"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden bg-muted">
                  {project.image ? (
                    <Image
                      src={project.image}
                      alt={title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
                <div className="p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Icon size={13} weight="duotone" className="text-primary shrink-0" aria-hidden="true" />
                    <span className="text-xs font-bold uppercase tracking-[0.12em]">{typeLabel}</span>
                  </div>

                  <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200">
                    {title}
                  </h3>

                  <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                    <MapPin size={13} weight="fill" className="shrink-0" aria-hidden="true" />
                    <span className="text-xs truncate">{location}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

      </div>
    </section>
  );
}
