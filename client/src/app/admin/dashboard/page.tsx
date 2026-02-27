import Link from 'next/link';
import { getAllProductsAdmin, getAllArticlesAdmin, getAllOrders } from '@/lib/content';
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { ProductTable } from '@/features/admin/components/ProductTable';
import { requireAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage(): Promise<React.ReactElement> {
  await requireAdmin();
  const products = await getAllProductsAdmin();
  const articles = await getAllArticlesAdmin();
  const orders = await getAllOrders();

  const activeProducts = products.filter((p) => p.isActive).length;
  const publishedArticles = articles.filter((a) => a.isPublished).length;
  const newOrders = orders.filter((o) => o.status === 'new').length;
  const totalRevenue = orders.filter((o) => o.status === 'completed').reduce((s, o) => s + o.total, 0);

  const stats = [
    { label: 'Products', value: `${activeProducts}/${products.length}`, sub: 'active', href: '/admin/dashboard' },
    { label: 'Articles', value: `${publishedArticles}/${articles.length}`, sub: 'published', href: '/admin/articles' },
    { label: 'Orders', value: String(orders.length), sub: newOrders > 0 ? `${newOrders} new` : 'all time', href: '/admin/orders', highlight: newOrders > 0 },
    { label: 'Revenue', value: `${totalRevenue} ₾`, sub: 'completed', href: '/admin/orders' },
  ];

  return (
    <>
      <AdminHeader />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">{s.label}</p>
              <p className="text-2xl font-bold text-foreground tabular-nums leading-none">{s.value}</p>
              <p className={`text-xs mt-1.5 ${s.highlight ? 'text-primary font-medium' : 'text-muted-foreground'}`}>{s.sub}</p>
            </Link>
          ))}
        </div>

        {/* Products */}
        <h2 className="text-xl font-semibold text-foreground mb-4">Products ({products.length})</h2>
        <ProductTable products={products} />
      </div>
    </>
  );
}
