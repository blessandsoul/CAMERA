export type ArticleCategory = 'cameras' | 'nvr' | 'installation' | 'news' | 'guides';

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  coverImage: string;
  isPublished: boolean;
  readMin: number;
  createdAt: string;
  updatedAt: string;
  content: string; // raw MDX body
}
