import Link from 'next/link';
import { getAllProductsAdmin, getAllArticlesAdmin, getAllOrders } from '@/lib/content';
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { ProductTable } from '@/features/admin/components/ProductTable';

export default async function AdminDashboardPage(): Promise<React.ReactElement> {
  const products = getAllProductsAdmin();
  const articles = getAllArticlesAdmin();
  const orders = getAllOrders();

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
              className="rounded-xl border border-gray-200 bg-white p-4 hover:border-gray-300 transition-colors"
            >
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">{s.value}</p>
              <p className={`text-xs mt-0.5 ${s.highlight ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>{s.sub}</p>
            </Link>
          ))}
        </div>

        {/* Products */}
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Products ({products.length})</h2>
        <ProductTable products={products} />
      </div>
    </>
  );
}
