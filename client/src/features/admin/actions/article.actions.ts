'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getArticleById, writeArticleMdx, deleteArticleMdx } from '@/lib/content';
import type { ArticleCategory } from '@/types/article.types';

async function requireAdmin(): Promise<void> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  if (session?.value !== process.env.ADMIN_SESSION_SECRET) {
    redirect('/admin');
  }
}

export async function createArticle(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = `article-${Date.now()}`;
  const now = new Date().toISOString();

  const frontmatter = {
    id,
    slug: (formData.get('slug') as string) || id,
    title: (formData.get('title') as string) || '',
    excerpt: (formData.get('excerpt') as string) || '',
    category: (formData.get('category') as ArticleCategory) || 'guides',
    coverImage: (formData.get('coverImage') as string) || '',
    isPublished: formData.get('isPublished') === 'true',
    readMin: Number(formData.get('readMin')) || 5,
    createdAt: now,
    updatedAt: now,
  };

  const body = (formData.get('body') as string) || '';
  writeArticleMdx(id, frontmatter, body);

  revalidatePath('/');
  redirect('/admin/articles');
}

export async function updateArticle(id: string, formData: FormData): Promise<void> {
  await requireAdmin();

  const existing = getArticleById(id);
  if (!existing) redirect('/admin/articles');

  const frontmatter = {
    id,
    slug: (formData.get('slug') as string) || existing!.slug,
    title: (formData.get('title') as string) || existing!.title,
    excerpt: (formData.get('excerpt') as string) || existing!.excerpt,
    category: (formData.get('category') as ArticleCategory) || existing!.category,
    coverImage: (formData.get('coverImage') as string) || existing!.coverImage,
    isPublished: formData.get('isPublished') === 'true',
    readMin: Number(formData.get('readMin')) || existing!.readMin,
    createdAt: existing!.createdAt,
    updatedAt: new Date().toISOString(),
  };

  const body = (formData.get('body') as string) || existing!.content;
  writeArticleMdx(id, frontmatter, body);

  revalidatePath('/');
  redirect('/admin/articles');
}

export async function deleteArticle(id: string): Promise<void> {
  await requireAdmin();
  deleteArticleMdx(id);
  revalidatePath('/');
  redirect('/admin/articles');
}

export async function toggleArticlePublished(id: string, isPublished: boolean): Promise<void> {
  await requireAdmin();

  const article = getArticleById(id);
  if (!article) return;

  const frontmatter = {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    category: article.category,
    coverImage: article.coverImage,
    isPublished,
    readMin: article.readMin,
    createdAt: article.createdAt,
    updatedAt: new Date().toISOString(),
  };

  writeArticleMdx(id, frontmatter, article.content);
  revalidatePath('/');
}
