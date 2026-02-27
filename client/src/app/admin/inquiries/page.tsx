import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { getAllInquiries } from '@/lib/content';
import { removeInquiry } from '@/features/admin/actions/inquiry.actions';
import { requireAdmin } from '@/lib/admin-auth';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function AdminInquiriesPage(): Promise<React.ReactElement> {
  await requireAdmin();
  const inquiries = await getAllInquiries();

  return (
    <>
      <AdminHeader />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <h1 className="text-xl font-semibold text-foreground mb-6">
          Inquiries ({inquiries.length})
        </h1>

        {inquiries.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No inquiries yet.</div>
        ) : (
          <div className="space-y-3">
            {inquiries.map((inquiry) => (
              <div key={inquiry.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                      <span className="text-sm font-medium text-foreground">{inquiry.name}</span>
                      <a
                        href={`https://wa.me/995${inquiry.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline tabular-nums"
                      >
                        {inquiry.phone}
                      </a>
                      <span className="text-xs text-muted-foreground">
                        {new Date(inquiry.createdAt).toLocaleString('ru-RU', { timeZone: 'Asia/Tbilisi', day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{inquiry.message}</p>
                  </div>
                  <form action={removeInquiry.bind(null, inquiry.id)}>
                    <Button
                      type="submit"
                      variant="destructive"
                      size="xs"
                      className="rounded-full"
                    >
                      Delete
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
