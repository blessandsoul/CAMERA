import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { ProjectForm } from '@/features/admin/components/ProjectForm';
import { createProject } from '@/features/admin/actions/project.actions';
import { requireAdmin } from '@/lib/admin-auth';

export default async function NewProjectPage(): Promise<React.ReactElement> {
  await requireAdmin();
  return (
    <>
      <AdminHeader />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <h1 className="text-xl font-semibold text-foreground mb-8">ახალი პროექტი</h1>
        <ProjectForm action={createProject} />
      </div>
    </>
  );
}
