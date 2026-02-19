import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { getAllInquiries } from '@/lib/content';
import { removeInquiry } from '@/features/admin/actions/inquiry.actions';

export default async function AdminInquiriesPage(): Promise<React.ReactElement> {
  const inquiries = getAllInquiries();

  return (
    <>
      <AdminHeader />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">
          Inquiries ({inquiries.length})
        </h1>

        {inquiries.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No inquiries yet.</div>
        ) : (
          <div className="space-y-3">
            {inquiries.map((inquiry) => (
              <div key={inquiry.id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                      <span className="text-sm font-medium text-gray-900">{inquiry.name}</span>
                      <a
                        href={`https://wa.me/995${inquiry.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline tabular-nums"
                      >
                        {inquiry.phone}
                      </a>
                      <span className="text-xs text-gray-400">
                        {new Date(inquiry.createdAt).toLocaleString('ru-RU', { timeZone: 'Asia/Tbilisi', day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{inquiry.message}</p>
                  </div>
                  <form action={removeInquiry.bind(null, inquiry.id)}>
                    <button
                      type="submit"
                      className="text-xs px-3 py-1.5 rounded-full text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
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
