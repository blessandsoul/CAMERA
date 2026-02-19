import Link from 'next/link';
import Image from 'next/image';
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { getAllProjectsAdmin } from '@/lib/content';
import { removeProject } from '@/features/admin/actions/project.actions';

export default function AdminProjectsPage(): React.ReactElement {
  const projects = getAllProjectsAdmin();

  return (
    <>
      <AdminHeader />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-semibold text-gray-900">Projects ({projects.length})</h1>
          <Link
            href="/admin/projects/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Project
          </Link>
        </div>

        {projects.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No projects yet</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div key={project.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                {/* Image */}
                {project.image && (
                  <div className="relative h-36 bg-gray-100">
                    <Image
                      src={project.image}
                      alt={project.title.ka}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {!project.isActive && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-gray-900/70 text-white text-[10px] font-medium">
                        Draft
                      </div>
                    )}
                  </div>
                )}

                {/* Info */}
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{project.title.ka}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="capitalize">{project.type}</span>
                    <span>·</span>
                    <span>{project.cameras} cameras</span>
                    <span>·</span>
                    <span>{project.year}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Link
                      href={`/admin/projects/${project.id}/edit`}
                      className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Edit
                    </Link>
                    <form action={removeProject.bind(null, project.id)}>
                      <button
                        type="submit"
                        className="text-xs px-3 py-1.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </form>
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
