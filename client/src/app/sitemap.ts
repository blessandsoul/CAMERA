import type { MetadataRoute } from 'next';
import { getAllProducts, getAllArticles } from '@/lib/content';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://techbrain.ge';
const locales = ['ka', 'ru', 'en'];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['', '/catalog', '/blog', '/contact'];
  const entries: MetadataRoute.Sitemap = [];

  // Static pages
  for (const locale of locales) {
    for (const route of staticRoutes) {
      entries.push({
        url: `${siteUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'weekly' : 'daily',
        priority: route === '' ? 1.0 : 0.8,
      });
    }
  }

  // Product detail pages
  try {
    const products = getAllProducts();
    for (const product of products) {
      for (const locale of locales) {
        entries.push({
          url: `${siteUrl}/${locale}/catalog/${product.id}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }
    }
  } catch {
    // Products unavailable at build time — skip
  }

  // Blog article pages
  try {
    const articles = getAllArticles();
    for (const article of articles) {
      for (const locale of locales) {
        entries.push({
          url: `${siteUrl}/${locale}/blog/${article.slug}`,
          lastModified: new Date(article.updatedAt),
          changeFrequency: 'monthly',
          priority: 0.5,
        });
      }
    }
  } catch {
    // Articles unavailable at build time — skip
  }

  return entries;
}
