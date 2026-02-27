import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { getAllOrders } from '@/lib/content';
import { changeOrderStatus } from '@/features/admin/actions/order.actions';
import { requireAdmin } from '@/lib/admin-auth';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage(): Promise<React.ReactElement> {
  await requireAdmin();
  const orders = await getAllOrders();
  const newCount = orders.filter((o) => o.status === 'new').length;

  const statusColors: Record<string, string> = {
    new: 'bg-info/10 text-info hover:bg-info/20',
    contacted: 'bg-warning/10 text-warning hover:bg-warning/20',
    completed: 'bg-success/10 text-success hover:bg-success/20',
  };

  const nextStatus: Record<string, 'contacted' | 'completed'> = {
    new: 'contacted',
    contacted: 'completed',
  };

  return (
    <>
      <AdminHeader />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <h1 className="text-xl font-semibold text-foreground mb-6">
          Orders ({orders.length}){newCount > 0 && <span className="ml-2 text-sm text-info">{newCount} new</span>}
        </h1>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-muted-foreground">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                      <span className="text-sm font-medium text-foreground">{order.name}</span>
                      <a
                        href={`https://wa.me/995${order.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline tabular-nums"
                      >
                        {order.phone}
                      </a>
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
                    {nextStatus[order.status] ? (
                      <form action={changeOrderStatus.bind(null, order.id, nextStatus[order.status])}>
                        <Button
                          type="submit"
                          variant="ghost"
                          size="xs"
                          className={`rounded-full ${statusColors[order.status]}`}
                        >
                          {order.status === 'new' ? 'New' : 'Contacted'}
                        </Button>
                      </form>
                    ) : (
                      <span className={`text-xs px-3 py-1.5 rounded-full ${statusColors[order.status]}`}>
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
