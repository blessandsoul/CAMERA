'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export function AdminHeader(): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const isOrders = pathname.startsWith('/admin/orders');
  const isInquiries = pathname.startsWith('/admin/inquiries');
  const isArticles = pathname.startsWith('/admin/articles');
  const isCatalog = pathname.startsWith('/admin/catalog-settings');
  const isSite = pathname.startsWith('/admin/site-settings');
  const isProjects = pathname.startsWith('/admin/projects');
  const isProducts = !isOrders && !isInquiries && !isArticles && !isCatalog && !isSite && !isProjects;

  async function handleLogout(): Promise<void> {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  }

  const navLink = (href: string, active: boolean, label: string): React.ReactElement => (
    <Link
      href={href}
      className={`text-sm px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
        active
          ? 'text-gray-900 bg-gray-100 font-medium'
          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      {label}
    </Link>
  );

  const showAddButton = isProducts || isArticles;
  const addHref = isArticles ? '/admin/articles/new' : '/admin/products/new';
  const addLabel = isArticles ? 'New Article' : 'Add Product';

  return (
    <header className="border-b border-gray-200 bg-white px-4 md:px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <Link href="/admin/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">TB</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm">Admin</span>
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {navLink('/admin/dashboard', isProducts, 'Products')}
          {navLink('/admin/orders', isOrders, 'Orders')}
          {navLink('/admin/inquiries', isInquiries, 'Inquiries')}
          {navLink('/admin/articles', isArticles, 'Articles')}
          {navLink('/admin/projects', isProjects, 'Projects')}
          {navLink('/admin/catalog-settings', isCatalog, 'Catalog')}
          {navLink('/admin/site-settings', isSite, 'Site')}
        </nav>
        <div className="flex items-center gap-3 shrink-0">
          {showAddButton && (
            <Link
              href={addHref}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="hidden sm:inline">{addLabel}</span>
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-900 rounded-lg transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
