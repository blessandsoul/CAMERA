import { notFound } from 'next/navigation';
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { ArticleForm } from '@/features/admin/components/ArticleForm';
import { getArticleById } from '@/lib/content';
import { updateArticle } from '@/features/admin/actions/article.actions';

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const article = getArticleById(id);

  if (!article) notFound();

  const updateArticleWithId = updateArticle.bind(null, id);

  return (
    <>
      <AdminHeader />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-8">Edit: {article.title}</h1>
        <ArticleForm article={article} action={updateArticleWithId} />
      </div>
    </>
  );
}
