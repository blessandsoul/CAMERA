'use server';

import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getProductById, writeProductMdx, deleteProductMdx } from '@/lib/content';
import type { Product, ProductCategory } from '@/types/product.types';

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'products');

async function requireAdmin(): Promise<void> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  if (session?.value !== process.env.ADMIN_SESSION_SECRET) {
    redirect('/admin');
  }
}

export async function createProduct(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = `product-${Date.now()}`;
  const frontmatter = {
    id,
    slug: (formData.get('slug') as string) || id,
    category: (formData.get('category') as ProductCategory) || 'cameras',
    price: Number(formData.get('price')) || 0,
    currency: 'GEL',
    isActive: formData.get('isActive') === 'true',
    isFeatured: formData.get('isFeatured') === 'true',
    images: JSON.parse((formData.get('images') as string) || '[]') as string[],
    name: {
      ka: (formData.get('name_ka') as string) || '',
      ru: (formData.get('name_ru') as string) || '',
      en: (formData.get('name_en') as string) || '',
    },
    specs: JSON.parse((formData.get('specs') as string) || '[]') as Product['specs'],
    createdAt: new Date().toISOString(),
  };

  const body = (formData.get('description_ka') as string) || '';
  writeProductMdx(id, frontmatter, body);

  revalidatePath('/');
  redirect('/admin/dashboard');
}

export async function updateProduct(id: string, formData: FormData): Promise<void> {
  await requireAdmin();

  const existing = getProductById(id);
  if (!existing) redirect('/admin/dashboard');

  const frontmatter = {
    id,
    slug: (formData.get('slug') as string) || existing.slug,
    category: (formData.get('category') as ProductCategory) || existing.category,
    price: Number(formData.get('price')) || existing.price,
    currency: existing.currency,
    isActive: formData.get('isActive') === 'true',
    isFeatured: formData.get('isFeatured') === 'true',
    images: JSON.parse((formData.get('images') as string) || JSON.stringify(existing.images)) as string[],
    name: {
      ka: (formData.get('name_ka') as string) || existing.name.ka,
      ru: (formData.get('name_ru') as string) || existing.name.ru,
      en: (formData.get('name_en') as string) || existing.name.en,
    },
    specs: JSON.parse((formData.get('specs') as string) || JSON.stringify(existing.specs)) as Product['specs'],
    createdAt: existing.createdAt,
  };

  const body = (formData.get('description_ka') as string) || existing.content || '';
  writeProductMdx(id, frontmatter, body);

  revalidatePath('/');
  redirect('/admin/dashboard');
}

export async function deleteProduct(id: string): Promise<void> {
  await requireAdmin();

  const product = getProductById(id);
  if (product) {
    for (const img of product.images) {
      const imgPath = path.join(IMAGES_DIR, img);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    deleteProductMdx(id);
  }

  revalidatePath('/');
  redirect('/admin/dashboard');
}

export async function toggleProductActive(id: string, isActive: boolean): Promise<void> {
  await requireAdmin();

  const product = getProductById(id);
  if (!product) return;

  const frontmatter = {
    id: product.id,
    slug: product.slug,
    category: product.category,
    price: product.price,
    currency: product.currency,
    isActive,
    isFeatured: product.isFeatured,
    images: product.images,
    name: product.name,
    specs: product.specs,
    createdAt: product.createdAt,
  };

  writeProductMdx(id, frontmatter, product.content || '');
  revalidatePath('/');
}
