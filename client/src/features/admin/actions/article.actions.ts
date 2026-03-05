'use server';

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getArticleById, writeArticleMdx, deleteArticleMdx } from '@/lib/content';
import { requireAdmin } from '@/lib/admin-auth';
import type { ArticleCategory } from '@/types/article.types';

const KA_TO_LATIN: Record<string, string> = {
  'ა': 'a', 'ბ': 'b', 'გ': 'g', 'დ': 'd', 'ე': 'e', 'ვ': 'v', 'ზ': 'z',
  'თ': 't', 'ი': 'i', 'კ': 'k', 'ლ': 'l', 'მ': 'm', 'ნ': 'n', 'ო': 'o',
  'პ': 'p', 'ჟ': 'zh', 'რ': 'r', 'ს': 's', 'ტ': 't', 'უ': 'u', 'ფ': 'f',
  'ქ': 'q', 'ღ': 'gh', 'ყ': 'k', 'შ': 'sh', 'ჩ': 'ch', 'ც': 'ts', 'ძ': 'dz',
  'წ': 'ts', 'ჭ': 'ch', 'ხ': 'kh', 'ჯ': 'j', 'ჰ': 'h',
};

function toUrlSlug(text: string): string {
  return text
    .split('')
    .map((ch) => KA_TO_LATIN[ch] ?? ch)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function createArticle(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = `article-${randomUUID()}`;
  const now = new Date().toISOString();

  const frontmatter = {
    id,
    slug: toUrlSlug((formData.get('title') as string) || '') || id,
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
  await writeArticleMdx(id, frontmatter, body);

  revalidatePath('/');
  redirect('/admin/articles');
}

export async function updateArticle(id: string, formData: FormData): Promise<void> {
  await requireAdmin();

  const existing = await getArticleById(id);
  if (!existing) redirect('/admin/articles');

  const frontmatter = {
    id,
    slug: existing!.slug,
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
  await writeArticleMdx(id, frontmatter, body);

  revalidatePath('/');
  redirect('/admin/articles');
}

export async function deleteArticle(id: string): Promise<void> {
  await requireAdmin();
  await deleteArticleMdx(id);
  revalidatePath('/');
  redirect('/admin/articles');
}

export async function toggleArticlePublished(id: string, isPublished: boolean): Promise<void> {
  await requireAdmin();

  const article = await getArticleById(id);
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

  await writeArticleMdx(id, frontmatter, article.content);
  revalidatePath('/');
}
