import Link from 'next/link';

export default function LocaleNotFound(): React.ReactElement {
  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-24 text-center">
      <div className="max-w-md mx-auto">
        <div className="text-7xl font-bold text-primary mb-4 tabular-nums">404</div>
        <h1 className="text-2xl font-bold text-foreground mb-4">Page not found</h1>
        <p className="text-muted-foreground mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/ka/catalog"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:brightness-110 active:scale-[0.98] text-primary-foreground font-semibold rounded-xl transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 3.6m0 0L17.5 20.25H6.5L4.375 11.1m15.5 0H4.375M4.375 11.1L3.75 7.5h16.5" />
          </svg>
          View Catalog
        </Link>
      </div>
    </div>
  );
}
