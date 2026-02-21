import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowLeft } from '@phosphor-icons/react/dist/ssr';
import { getAllArticles } from '@/lib/content';

interface BlogPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(): Promise<{ title: string }> {
  return { title: 'TechBrain — სტატიები და რჩევები' };
}

export default async function BlogPage({ params }: BlogPageProps): Promise<React.ReactElement> {
  const { locale } = await params;
  const articles = getAllArticles();

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-12">
      <Link
        href={`/${locale}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft size={16} weight="bold" />
        მთავარი
      </Link>

      <h1 className="text-3xl font-bold text-foreground mb-8">სტატიები და რჩევები</h1>

      {articles.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          ჯერ სტატიები არ არის.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, i) => (
            <Link key={article.id} href={`/${locale}/blog/${article.slug}`} className="group">
              <article className="flex flex-col rounded-xl overflow-hidden border border-border/50 bg-card transition-all duration-300 motion-safe:hover:-translate-y-0.5 hover:border-primary/20">
                {article.coverImage && (
                  <div className="relative h-48 overflow-hidden bg-muted shrink-0">
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      priority={i === 0}
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                )}
                <div className="flex flex-col flex-1 p-5 gap-3">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {article.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Clock size={13} weight="regular" />
                      <span className="text-xs">{article.readMin} წთ</span>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                    {article.excerpt}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
