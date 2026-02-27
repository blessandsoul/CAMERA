'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
      className={`relative text-sm px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
        active
          ? 'text-foreground font-medium'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      }`}
    >
      {label}
      {active && (
        <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-4/5 h-0.5 rounded-full bg-primary" />
      )}
    </Link>
  );

  const showAddButton = isProducts || isArticles || isProjects;
  const addHref = isArticles ? '/admin/articles/new' : isProjects ? '/admin/projects/new' : '/admin/products/new';
  const addLabel = isArticles ? 'New Article' : isProjects ? 'New Project' : 'Add Product';

  return (
    <header className="border-b border-border bg-card px-4 md:px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <Link href="/admin/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 bg-foreground rounded-lg flex items-center justify-center">
            <span className="text-background font-bold text-xs">TB</span>
          </div>
          <span className="font-semibold text-foreground text-sm">Admin</span>
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
            <Button asChild>
              <Link href={addHref} className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="hidden sm:inline">{addLabel}</span>
              </Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
