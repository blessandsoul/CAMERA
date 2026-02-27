import { notFound } from 'next/navigation';
import Link from 'next/link';
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { InfoTooltip } from '@/features/admin/components/InfoTooltip';
import { getOrderById } from '@/lib/content';
import { changeOrderStatus } from '@/features/admin/actions/order.actions';
import { requireAdmin } from '@/lib/admin-auth';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

const statusLabels: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  completed: 'Completed',
};

const statusColors: Record<string, string> = {
  new: 'bg-info/10 text-info',
  contacted: 'bg-warning/10 text-warning',
  completed: 'bg-success/10 text-success',
};

const nextStatus: Record<string, 'contacted' | 'completed'> = {
  new: 'contacted',
  contacted: 'completed',
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps): Promise<React.ReactElement> {
  await requireAdmin();
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) notFound();

  const formattedDate = new Date(order.createdAt).toLocaleString('ru-RU', {
    timeZone: 'Asia/Tbilisi',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const localeLabels: Record<string, string> = {
    ka: 'Georgian',
    ru: 'Russian',
    en: 'English',
  };

  return (
    <>
      <AdminHeader />
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Orders
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Order #{order.id.slice(-6).toUpperCase()}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{formattedDate}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${statusColors[order.status]}`}>
              {statusLabels[order.status]}
            </span>
            {nextStatus[order.status] && (
              <form action={changeOrderStatus.bind(null, order.id, nextStatus[order.status])}>
                <Button type="submit" size="sm" variant="outline">
                  Mark as {statusLabels[nextStatus[order.status]]}
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Customer info */}
        <div className="rounded-xl border border-border bg-card p-5 mb-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Customer <InfoTooltip text="შეკვეთის გამფორმებლის საკონტაქტო ინფორმაცია" /></h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Name <InfoTooltip text="მომხმარებლის სახელი" /></p>
              <p className="text-sm font-medium text-foreground">{order.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Phone <InfoTooltip text="დააწკაპუნეთ ნომერზე WhatsApp-ში დასაკავშირებლად" /></p>
              <a
                href={`https://wa.me/995${order.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline tabular-nums"
              >
                {order.phone}
              </a>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Language <InfoTooltip text="ენა რომელზეც მომხმარებელმა გააფორმა შეკვეთა" /></p>
              <p className="text-sm font-medium text-foreground">{localeLabels[order.locale] || order.locale}</p>
            </div>
          </div>
        </div>

        {/* Order items */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Items <InfoTooltip text="შეკვეთილი პროდუქტების სია რაოდენობით და ფასით" /></h2>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm text-foreground truncate">{item.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">×{item.quantity}</span>
                </div>
                <span className="text-sm font-medium text-foreground tabular-nums shrink-0 ml-4">
                  {item.price * item.quantity} ₾
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-4 pt-4 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Total</span>
            <span className="text-base font-bold text-foreground tabular-nums">{order.total} ₾</span>
          </div>
        </div>
      </div>
    </>
  );
}
