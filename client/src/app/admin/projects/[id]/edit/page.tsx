import { notFound } from 'next/navigation';
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { ProjectForm } from '@/features/admin/components/ProjectForm';
import { getProjectById } from '@/lib/content';
import { updateProject } from '@/features/admin/actions/project.actions';

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const project = getProjectById(id);
  if (!project) notFound();

  const action = updateProject.bind(null, id);

  return (
    <>
      <AdminHeader />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-8">Edit Project</h1>
        <ProjectForm project={project} action={action} />
      </div>
    </>
  );
}
