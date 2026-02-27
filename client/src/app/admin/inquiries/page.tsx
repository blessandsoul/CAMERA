import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { InfoTooltip } from '@/features/admin/components/InfoTooltip';
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
          <InfoTooltip text="საკონტაქტო ფორმიდან შემოსული მოთხოვნები. ტელეფონზე დაწკაპება გახსნის WhatsApp-ს" />
        </h1>

        {inquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-muted-foreground">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">No inquiries yet.</p>
          </div>
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
