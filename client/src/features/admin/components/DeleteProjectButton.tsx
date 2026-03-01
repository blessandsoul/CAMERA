'use client';

import { removeProject } from '@/features/admin/actions/project.actions';
import { Button } from '@/components/ui/button';

interface DeleteProjectButtonProps {
  projectId: string;
  projectTitle: string;
}

export function DeleteProjectButton({ projectId, projectTitle }: DeleteProjectButtonProps): React.ReactElement {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    if (!confirm(`წაშალოთ "${projectTitle}"?`)) {
      e.preventDefault();
    }
  }

  return (
    <form action={removeProject.bind(null, projectId)} onSubmit={handleSubmit}>
      <Button
        type="submit"
        variant="destructive"
        size="xs"
      >
        წაშლა
      </Button>
    </form>
  );
}
