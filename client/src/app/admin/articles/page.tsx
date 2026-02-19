import Link from 'next/link';
import { getAllArticlesAdmin } from '@/lib/content';
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { toggleArticlePublished } from '@/features/admin/actions/article.actions';
import { DeleteArticleButton } from '@/features/admin/components/DeleteArticleButton';

export default async function AdminArticlesPage(): Promise<React.ReactElement> {
  const articles = getAllArticlesAdmin();

  return (
    <>
      <AdminHeader />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Articles ({articles.length})</h1>

        {articles.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            No articles yet.{' '}
            <Link href="/admin/articles/new" className="text-gray-900 underline underline-offset-2 hover:no-underline">
              Write your first article.
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 overflow-x-auto bg-white">
            <table className="w-full min-w-120">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">Title</th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">Read</th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2">
                      <span className="text-sm text-gray-900 font-medium">{article.title}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        {article.category}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-sm text-gray-500 tabular-nums">{article.readMin} min</span>
                    </td>
                    <td className="px-3 py-2">
                      <form action={toggleArticlePublished.bind(null, article.id, !article.isPublished)}>
                        <button
                          type="submit"
                          className={`text-xs px-2 py-1 rounded-full transition-colors cursor-pointer ${
                            article.isPublished
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {article.isPublished ? 'Published' : 'Draft'}
                        </button>
                      </form>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/articles/${article.id}/edit`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                          aria-label="Edit article"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </Link>
                        <DeleteArticleButton articleId={article.id} articleTitle={article.title} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
