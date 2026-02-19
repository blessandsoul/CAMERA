'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getProjectById, saveProject, deleteProject } from '@/lib/content';
import type { Project } from '@/lib/content';

async function requireAdmin(): Promise<void> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  if (session?.value !== process.env.ADMIN_SESSION_SECRET) {
    redirect('/admin');
  }
}

export async function createProject(formData: FormData): Promise<void> {
  await requireAdmin();

  const project: Project = {
    id: `project-${Date.now()}`,
    title: {
      ka: (formData.get('title_ka') as string) || '',
      ru: (formData.get('title_ru') as string) || '',
      en: (formData.get('title_en') as string) || '',
    },
    location: {
      ka: (formData.get('location_ka') as string) || '',
      ru: (formData.get('location_ru') as string) || '',
      en: (formData.get('location_en') as string) || '',
    },
    type: (formData.get('type') as Project['type']) || 'commercial',
    cameras: Number(formData.get('cameras')) || 0,
    image: (formData.get('image') as string) || '',
    year: (formData.get('year') as string) || new Date().getFullYear().toString(),
    isActive: formData.get('isActive') === 'true',
    createdAt: new Date().toISOString(),
  };

  saveProject(project);
  revalidatePath('/');
  redirect('/admin/projects');
}

export async function updateProject(id: string, formData: FormData): Promise<void> {
  await requireAdmin();

  const existing = getProjectById(id);
  if (!existing) redirect('/admin/projects');

  const project: Project = {
    id,
    title: {
      ka: (formData.get('title_ka') as string) || existing.title.ka,
      ru: (formData.get('title_ru') as string) || existing.title.ru,
      en: (formData.get('title_en') as string) || existing.title.en,
    },
    location: {
      ka: (formData.get('location_ka') as string) || existing.location.ka,
      ru: (formData.get('location_ru') as string) || existing.location.ru,
      en: (formData.get('location_en') as string) || existing.location.en,
    },
    type: (formData.get('type') as Project['type']) || existing.type,
    cameras: Number(formData.get('cameras')) || existing.cameras,
    image: (formData.get('image') as string) || existing.image,
    year: (formData.get('year') as string) || existing.year,
    isActive: formData.get('isActive') === 'true',
    createdAt: existing.createdAt,
  };

  saveProject(project);
  revalidatePath('/');
  redirect('/admin/projects');
}

export async function removeProject(id: string): Promise<void> {
  await requireAdmin();
  deleteProject(id);
  revalidatePath('/');
  redirect('/admin/projects');
}
