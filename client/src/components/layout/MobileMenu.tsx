'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { List, X } from '@phosphor-icons/react';

interface MobileMenuProps {
  locale: string;
  labels: {
    home: string;
    catalog: string;
    contact: string;
  };
}

export function MobileMenu({ locale, labels }: MobileMenuProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const links = [
    { href: `/${locale}`, label: labels.home },
    { href: `/${locale}/catalog`, label: labels.catalog },
    { href: `/${locale}/contact`, label: labels.contact },
  ];

  return (
    <>
      {/* Hamburger button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-accent transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        {open ? (
          <X size={20} weight="bold" className="text-foreground" />
        ) : (
          <List size={20} weight="bold" className="text-foreground" />
        )}
      </button>

      {/* Overlay + Drawer */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <nav
            className="fixed top-0 right-0 z-50 w-64 h-[100dvh] bg-background border-l border-border shadow-xl flex flex-col md:hidden motion-safe:animate-in motion-safe:slide-in-from-right"
            aria-label="Mobile navigation"
          >
            {/* Close */}
            <div className="flex items-center justify-end p-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X size={20} weight="bold" className="text-foreground" />
              </button>
            </div>

            {/* Links */}
            <div className="flex flex-col gap-1 px-4">
              {links.map((link) => {
                const isActive = pathname === link.href || (link.href !== `/${locale}` && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-3 text-base rounded-lg transition-colors ${
                      isActive
                        ? 'text-foreground font-medium bg-accent'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </>
      )}
    </>
  );
}
