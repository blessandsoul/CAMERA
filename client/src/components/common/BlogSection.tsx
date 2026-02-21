import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock } from '@phosphor-icons/react/dist/ssr';
import { getAllArticles } from '@/lib/content';

interface BlogSectionProps {
  locale: string;
}

export function BlogSection({ locale }: BlogSectionProps): React.ReactElement | null {
  const articles = getAllArticles().slice(0, 3);

  if (articles.length === 0) return null;

  return (
    <section className="py-10 lg:py-14 bg-secondary/30 border-t border-border/40" aria-labelledby="blog-heading">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
              სასარგებლო ინფორმაცია
            </span>
            <h2 id="blog-heading" className="text-2xl md:text-3xl font-bold text-foreground">
              სტატიები და რჩევები
            </h2>
          </div>
          <Link
            href={`/${locale}/blog`}
            className="hidden md:flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg px-2 py-1"
          >
            ყველა სტატია
            <ArrowRight size={14} weight="bold" aria-hidden="true" />
          </Link>
        </div>

        {/* Posts grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article, i) => {
            const dateFormatted = new Intl.DateTimeFormat('ka-GE', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }).format(new Date(article.createdAt));

            return (
              <Link key={article.id} href={`/${locale}/blog/${article.slug}`} className="group">
                <article
                  className="flex flex-col rounded-xl overflow-hidden border border-border/50 bg-card transition-all duration-300 motion-safe:hover:-translate-y-0.5 hover:border-primary/20 h-full"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-muted shrink-0">
                    {article.coverImage ? (
                      <Image
                        src={article.coverImage}
                        alt={article.title}
                        fill
                        priority={i === 0}
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-muted to-muted flex items-center justify-center">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-border" aria-hidden="true">
                          <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
                          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                          <path d="M3 15l5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                    <div
                      className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent pointer-events-none"
                      aria-hidden="true"
                    />
                    {/* Category badge */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background/90 backdrop-blur-sm border border-border/60 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <span className="w-1 h-1 rounded-full bg-primary" aria-hidden="true" />
                        {article.category}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex flex-col flex-1 p-5 gap-3">

                    {/* Date + read time */}
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span className="text-xs">{dateFormatted}</span>
                      <span className="w-1 h-1 rounded-full bg-border" aria-hidden="true" />
                      <div className="flex items-center gap-1">
                        <Clock size={13} weight="regular" aria-hidden="true" />
                        <span className="text-xs">{article.readMin} წთ</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200">
                      {article.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                      {article.excerpt}
                    </p>

                    {/* Read more */}
                    <div className="pt-1 mt-auto">
                      <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary group-hover:gap-2 transition-all duration-200">
                        წაკითხვა
                        <ArrowRight size={12} weight="bold" aria-hidden="true" />
                      </span>
                    </div>

                  </div>
                </article>
              </Link>
            );
          })}
        </div>

        {/* Mobile — see all */}
        <div className="mt-8 flex justify-center md:hidden">
          <Link
            href={`/${locale}/blog`}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            ყველა სტატია
            <ArrowRight size={14} weight="bold" aria-hidden="true" />
          </Link>
        </div>

      </div>
    </section>
  );
}
