import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Clock, CalendarBlank } from '@phosphor-icons/react/dist/ssr';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getArticleBySlug, getAllArticles } from '@/lib/content';

interface BlogPostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams(): Promise<Array<{ locale: string; slug: string }>> {
  const articles = getAllArticles();
  const locales = ['ka', 'ru', 'en'];
  return locales.flatMap((locale) =>
    articles.map((a) => ({ locale, slug: a.slug }))
  );
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<{ title: string; description?: string }> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: 'Not found' };
  return {
    title: `TechBrain — ${article.title}`,
    description: article.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps): Promise<React.ReactElement> {
  const { locale, slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return (
      <div className="container mx-auto px-4 max-w-7xl py-24 text-center text-muted-foreground">
        სტატია ვერ მოიძებნა.
      </div>
    );
  }

  const dateFormatted = new Intl.DateTimeFormat('ka-GE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.createdAt));

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-12">
      <Link
        href={`/${locale}/blog`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft size={16} weight="bold" />
        სტატიები
      </Link>

      <article className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-4 inline-block">
            {article.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4 text-balance">
            {article.title}
          </h1>
          <div className="flex items-center gap-4 text-muted-foreground text-sm">
            <div className="flex items-center gap-1.5">
              <CalendarBlank size={15} weight="regular" />
              <span>{dateFormatted}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={15} weight="regular" />
              <span>{article.readMin} წთ</span>
            </div>
          </div>
        </header>

        {/* Cover */}
        {article.coverImage && (
          <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-10 bg-muted">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              priority
              className="object-cover"
            />
          </div>
        )}

        {/* MDX Content */}
        <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-li:text-muted-foreground dark:prose-invert">
          <MDXRemote source={article.content} />
        </div>
      </article>
    </div>
  );
}
