import Link from 'next/link';
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { InfoTooltip } from '@/features/admin/components/InfoTooltip';
import { getAllOrders } from '@/lib/content';
import { requireAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage(): Promise<React.ReactElement> {
  await requireAdmin();
  const orders = await getAllOrders();
  const newCount = orders.filter((o) => o.status === 'new').length;

  const statusColors: Record<string, string> = {
    new: 'bg-info/10 text-info',
    contacted: 'bg-warning/10 text-warning',
    completed: 'bg-success/10 text-success',
  };

  return (
    <>
      <AdminHeader />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <h1 className="text-xl font-semibold text-foreground mb-6">
          შეკვეთები ({orders.length}){newCount > 0 && <span className="ml-2 text-sm text-info">{newCount} ახალი</span>}
          <InfoTooltip text="საიტიდან შემოსული შეკვეთები. სტატუსები: New = ახალი, Contacted = დაკავშირებული, Completed = დასრულებული. დააწკაპუნეთ შეკვეთაზე დეტალებისთვის" />
        </h1>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-muted-foreground">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">შეკვეთები ჯერ არ არის.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="block rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:shadow-md hover:border-border/80"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                      <span className="text-sm font-medium text-foreground">{order.name}</span>
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {order.phone}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString('ru-RU', { timeZone: 'Asia/Tbilisi', day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                          {item.name} ×{item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-bold text-foreground tabular-nums">{order.total} ₾</span>
                    <span className={`text-xs px-3 py-1.5 rounded-full ${statusColors[order.status]}`}>
                      {order.status === 'new' ? 'ახალი' : order.status === 'contacted' ? 'დაკავშირებული' : 'დასრულებული'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
