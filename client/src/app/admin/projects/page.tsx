import Link from 'next/link';
import Image from 'next/image';
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { getAllProjectsAdmin } from '@/lib/content';
import { requireAdmin } from '@/lib/admin-auth';
import { DeleteProjectButton } from '@/features/admin/components/DeleteProjectButton';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function AdminProjectsPage(): Promise<React.ReactElement> {
  await requireAdmin();
  const projects = await getAllProjectsAdmin();

  return (
    <>
      <AdminHeader />
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-semibold text-foreground">პროექტები ({projects.length})</h1>
          <Button asChild>
            <Link href="/admin/projects/new" className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              ახალი პროექტი
            </Link>
          </Button>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-muted-foreground">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground mb-3">პროექტები ჯერ არ არის</p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/projects/new">შექმენით პირველი პროექტი</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div key={project.id} className="rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                {/* Image */}
                {project.image && (
                  <div className="relative h-36 bg-muted">
                    <Image
                      src={project.image}
                      alt={project.title.ka}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {!project.isActive && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-foreground/70 text-background text-[10px] font-medium">
                        მონახაზი
                      </div>
                    )}
                  </div>
                )}

                {/* Info */}
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-foreground line-clamp-1">{project.title.ka}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="capitalize">{project.type}</span>
                    <span>·</span>
                    <span>{project.cameras} კამერა</span>
                    <span>·</span>
                    <span>{project.year}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button variant="outline" size="xs" asChild>
                      <Link href={`/admin/projects/${project.id}/edit`}>
                        რედაქტირება
                      </Link>
                    </Button>
                    <DeleteProjectButton projectId={project.id} projectTitle={project.title.ka} />
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
