'use server';

import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getProductById, writeProductMdx, deleteProductMdx } from '@/lib/content';
import { requireAdmin } from '@/lib/admin-auth';
import type { Product, ProductCategory } from '@/types/product.types';

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

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'products');

export async function createProduct(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = `product-${randomUUID()}`;
  const relatedRaw = JSON.parse((formData.get('relatedProducts') as string) || '[]') as string[];
  const relatedProducts = relatedRaw.length > 0 ? relatedRaw : undefined;

  const frontmatter = {
    id,
    slug: toUrlSlug((formData.get('name_ka') as string) || '') || id,
    categories: JSON.parse((formData.get('categories') as string) || '["cameras"]') as ProductCategory[],
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
    relatedProducts,
    createdAt: new Date().toISOString(),
  };

  const body = (formData.get('description_ka') as string) || '';
  await writeProductMdx(id, frontmatter, body);

  revalidatePath('/');
  redirect('/admin/dashboard');
}

export async function updateProduct(id: string, formData: FormData): Promise<void> {
  await requireAdmin();

  const existing = await getProductById(id);
  if (!existing) redirect('/admin/dashboard');

  const relatedRaw = JSON.parse((formData.get('relatedProducts') as string) || '[]') as string[];
  const relatedProducts = relatedRaw.length > 0 ? relatedRaw : undefined;

  const frontmatter = {
    id,
    slug: existing.slug,
    categories: JSON.parse((formData.get('categories') as string) || JSON.stringify(existing.categories)) as ProductCategory[],
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
    relatedProducts,
    createdAt: existing.createdAt,
  };

  const body = (formData.get('description_ka') as string) || existing.content || '';
  await writeProductMdx(id, frontmatter, body);

  revalidatePath('/');
  redirect('/admin/dashboard');
}

export async function deleteProduct(id: string): Promise<void> {
  await requireAdmin();

  const product = await getProductById(id);
  if (product) {
    for (const img of product.images) {
      const imgPath = path.join(IMAGES_DIR, img);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    await deleteProductMdx(id);
  }

  revalidatePath('/');
  redirect('/admin/dashboard');
}

export async function batchDeleteProducts(ids: string[]): Promise<void> {
  await requireAdmin();
  for (const id of ids) {
    const product = await getProductById(id);
    if (product) {
      for (const img of product.images) {
        const imgPath = path.join(IMAGES_DIR, img);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      }
      await deleteProductMdx(id);
    }
  }
  revalidatePath('/');
}

export async function batchToggleActive(ids: string[], isActive: boolean): Promise<void> {
  await requireAdmin();
  for (const id of ids) {
    const product = await getProductById(id);
    if (!product) continue;
    const frontmatter = {
      id: product.id,
      slug: product.slug,
      categories: product.categories,
      price: product.price,
      currency: product.currency,
      isActive,
      isFeatured: product.isFeatured,
      images: product.images,
      name: product.name,
      specs: product.specs,
      relatedProducts: product.relatedProducts,
      createdAt: product.createdAt,
    };
    await writeProductMdx(id, frontmatter, product.content || '');
  }
  revalidatePath('/');
}

export async function toggleProductActive(id: string, isActive: boolean): Promise<void> {
  await requireAdmin();

  const product = await getProductById(id);
  if (!product) return;

  const frontmatter = {
    id: product.id,
    slug: product.slug,
    categories: product.categories,
    price: product.price,
    currency: product.currency,
    isActive,
    isFeatured: product.isFeatured,
    images: product.images,
    name: product.name,
    specs: product.specs,
    relatedProducts: product.relatedProducts,
    createdAt: product.createdAt,
  };

  await writeProductMdx(id, frontmatter, product.content || '');
  revalidatePath('/');
}
