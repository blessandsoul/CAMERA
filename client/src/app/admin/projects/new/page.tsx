import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { ProjectForm } from '@/features/admin/components/ProjectForm';
import { createProject } from '@/features/admin/actions/project.actions';

export default function NewProjectPage(): React.ReactElement {
  return (
    <>
      <AdminHeader />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-8">New Project</h1>
        <ProjectForm action={createProject} />
      </div>
    </>
  );
}
