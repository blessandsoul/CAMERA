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
    new: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    contacted: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
    completed: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
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
          Orders ({orders.length}){newCount > 0 && <span className="ml-2 text-sm text-blue-600">{newCount} new</span>}
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No orders yet.</div>
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
