import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { ArticleForm } from '@/features/admin/components/ArticleForm';
import { createArticle } from '@/features/admin/actions/article.actions';

export default function NewArticlePage(): React.ReactElement {
  return (
    <>
      <AdminHeader />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-8">New Article</h1>
        <ArticleForm action={createArticle} />
      </div>
    </>
  );
}
