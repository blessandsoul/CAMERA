import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TechBrain Admin',
};

export default function AdminLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <div className="min-h-[100dvh] bg-muted/50 text-foreground">
      {children}
    </div>
  );
}
