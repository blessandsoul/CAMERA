import Link from 'next/link';
import { getAllArticlesAdmin } from '@/lib/content';
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { toggleArticlePublished } from '@/features/admin/actions/article.actions';
import { DeleteArticleButton } from '@/features/admin/components/DeleteArticleButton';
import { requireAdmin } from '@/lib/admin-auth';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

export const dynamic = 'force-dynamic';

export default async function AdminArticlesPage(): Promise<React.ReactElement> {
  await requireAdmin();
  const articles = await getAllArticlesAdmin();

  return (
    <>
      <AdminHeader />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <h1 className="text-xl font-semibold text-foreground mb-6">Articles ({articles.length})</h1>

        {articles.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            No articles yet.{' '}
            <Link href="/admin/articles/new" className="text-foreground underline underline-offset-2 hover:no-underline">
              Write your first article.
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-x-auto bg-card">
            <Table className="min-w-120">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Title</TableHead>
                  <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Category</TableHead>
                  <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Read</TableHead>
                  <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="px-3 py-2">
                      <span className="text-sm text-foreground font-medium">{article.title}</span>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        {article.category}
                      </span>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <span className="text-sm text-muted-foreground tabular-nums">{article.readMin} min</span>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <form action={toggleArticlePublished.bind(null, article.id, !article.isPublished)}>
                        <Button
                          type="submit"
                          variant="ghost"
                          size="xs"
                          className={`rounded-full ${
                            article.isPublished
                              ? 'bg-success/10 text-success hover:bg-success/20'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {article.isPublished ? 'Published' : 'Draft'}
                        </Button>
                      </form>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/articles/${article.id}/edit`}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          aria-label="Edit article"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </Link>
                        <DeleteArticleButton articleId={article.id} articleTitle={article.title} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
}
