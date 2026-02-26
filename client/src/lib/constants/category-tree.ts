import type { ProductCategory } from '@/types/product.types';
import { getCatalogConfig } from '@/lib/content';
import type { CatalogCategoryConfig, CatalogLabel } from '@/lib/content';

export interface CategoryNode {
  id: string;
  parentCategory: ProductCategory | null;
  label: CatalogLabel;
  specFilter?: {
    kaKey: string;
    value: string;
  };
  children?: CategoryNode[];
}

function mapCategory(cat: CatalogCategoryConfig): CategoryNode {
  return {
    id: cat.id,
    parentCategory: cat.parentCategory as ProductCategory | null,
    label: cat.label,
    specFilter: cat.specFilter,
    children: cat.children?.map(mapCategory),
  };
}

export async function getCategoryTree(): Promise<CategoryNode[]> {
  const config = await getCatalogConfig();
  return config.categories.map(mapCategory);
}

export async function findCategoryNode(id: string): Promise<CategoryNode | undefined> {
  const tree = await getCategoryTree();
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children) {
      const child = node.children.find((c) => c.id === id);
      if (child) return child;
    }
  }
  return undefined;
}

export async function findParentNode(childId: string): Promise<CategoryNode | undefined> {
  const tree = await getCategoryTree();
  for (const node of tree) {
    if (node.children?.some((c) => c.id === childId)) return node;
  }
  return undefined;
}
