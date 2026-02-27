import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { ArticleForm } from '@/features/admin/components/ArticleForm';
import { createArticle } from '@/features/admin/actions/article.actions';
import { requireAdmin } from '@/lib/admin-auth';

export default async function NewArticlePage(): Promise<React.ReactElement> {
  await requireAdmin();
  return (
    <>
      <AdminHeader />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <h1 className="text-xl font-semibold text-foreground mb-8">New Article</h1>
        <ArticleForm action={createArticle} />
      </div>
    </>
  );
}
