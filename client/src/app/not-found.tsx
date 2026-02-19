import Link from 'next/link';

export default function NotFound(): React.ReactElement {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-background px-4 text-center">
      <div className="max-w-md">
        <div className="text-8xl font-bold text-primary mb-4 tabular-nums">404</div>
        <h1 className="text-2xl font-bold text-foreground mb-4">Page not found</h1>
        <p className="text-muted-foreground mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/ka"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:brightness-110 active:scale-[0.98] text-primary-foreground font-semibold rounded-xl transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          Go Home
        </Link>
      </div>
    </div>
  );
}
