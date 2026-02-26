/**
 * Generates SQL INSERT statements from existing MDX/JSON content files.
 * Usage: npx tsx prisma/generate-seed-sql.ts > prisma/seed.sql
 */
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), 'content');

function esc(val: string | null | undefined): string {
  if (val === null || val === undefined) return 'NULL';
  return `'${String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '')}'`;
}

function escJson(val: unknown): string {
  if (val === null || val === undefined) return 'NULL';
  return esc(JSON.stringify(val));
}

function escBool(val: boolean | undefined): string {
  return val ? '1' : '0';
}

function escNum(val: number | null | undefined): string {
  if (val === null || val === undefined) return 'NULL';
  return String(val);
}

function escDate(val: string | undefined): string {
  if (!val) return 'NOW(3)';
  try {
    const d = new Date(val);
    return `'${d.toISOString().slice(0, 23).replace('T', ' ')}'`;
  } catch {
    return 'NOW(3)';
  }
}

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const lines: string[] = [];

function emit(sql: string): void {
  lines.push(sql);
}

// ── Products ───────────────────────────────────────────
function seedProducts(): void {
  const productsDir = path.join(CONTENT_DIR, 'products');
  if (!fs.existsSync(productsDir)) return;

  const files = fs.readdirSync(productsDir).filter((f) => f.endsWith('.mdx'));
  emit(`-- Products: ${files.length} records`);

  for (const file of files) {
    const raw = fs.readFileSync(path.join(productsDir, file), 'utf-8');
    const { data: fm, content } = matter(raw);

    emit(
      `INSERT INTO products (id, slug, category, price, originalPrice, currency, isActive, isFeatured, images, nameKa, nameRu, nameEn, descriptionKa, descriptionRu, descriptionEn, content, relatedProducts, createdAt, updatedAt) VALUES (` +
        `${esc(fm.id)}, ${esc(fm.slug)}, ${esc(fm.category)}, ${escNum(fm.price)}, ${escNum(fm.originalPrice)}, ${esc(fm.currency || 'GEL')}, ` +
        `${escBool(fm.isActive)}, ${escBool(fm.isFeatured)}, ${escJson(fm.images || [])}, ` +
        `${esc(fm.name?.ka)}, ${esc(fm.name?.ru || '')}, ${esc(fm.name?.en || '')}, ` +
        `NULL, NULL, NULL, ` +
        `${content.trim() ? esc(content.trim()) : 'NULL'}, ` +
        `${fm.relatedProducts ? escJson(fm.relatedProducts) : 'NULL'}, ` +
        `${escDate(fm.createdAt)}, ${escDate(fm.createdAt)}` +
        `);`
    );

    // Product specs
    if (fm.specs && Array.isArray(fm.specs)) {
      for (const spec of fm.specs) {
        emit(
          `INSERT INTO product_specs (id, productId, keyKa, keyRu, keyEn, value) VALUES (` +
            `${esc(uuid())}, ${esc(fm.id)}, ${esc(spec.key?.ka || '')}, ${esc(spec.key?.ru || '')}, ${esc(spec.key?.en || '')}, ${esc(spec.value || '')}` +
            `);`
        );
      }
    }
  }
}

// ── Articles ──────────────────────────────────────────
function seedArticles(): void {
  const articlesDir = path.join(CONTENT_DIR, 'articles');
  if (!fs.existsSync(articlesDir)) return;

  const files = fs.readdirSync(articlesDir).filter((f) => f.endsWith('.mdx'));
  emit(`\n-- Articles: ${files.length} records`);

  for (const file of files) {
    const raw = fs.readFileSync(path.join(articlesDir, file), 'utf-8');
    const { data: fm, content } = matter(raw);

    emit(
      `INSERT INTO articles (id, slug, title, excerpt, category, coverImage, isPublished, readMin, content, createdAt, updatedAt) VALUES (` +
        `${esc(fm.id)}, ${esc(fm.slug)}, ${esc(fm.title)}, ${esc(fm.excerpt || '')}, ${esc(fm.category)}, ` +
        `${esc(fm.coverImage || '')}, ${escBool(fm.isPublished)}, ${escNum(fm.readMin || 5)}, ` +
        `${esc(content.trim())}, ${escDate(fm.createdAt)}, ${escDate(fm.updatedAt || fm.createdAt)}` +
        `);`
    );
  }
}

// ── Orders ────────────────────────────────────────────
function seedOrders(): void {
  const ordersPath = path.join(CONTENT_DIR, 'orders.json');
  if (!fs.existsSync(ordersPath)) return;

  const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf-8'));
  if (!Array.isArray(orders) || orders.length === 0) return;

  emit(`\n-- Orders: ${orders.length} records`);

  for (const o of orders) {
    emit(
      `INSERT INTO orders (id, name, phone, locale, total, status, createdAt) VALUES (` +
        `${esc(o.id)}, ${esc(o.name)}, ${esc(o.phone)}, ${esc(o.locale || 'ka')}, ` +
        `${escNum(o.total)}, ${esc(o.status || 'new')}, ${escDate(o.createdAt)}` +
        `);`
    );

    if (o.items && Array.isArray(o.items)) {
      for (const item of o.items) {
        emit(
          `INSERT INTO order_items (id, orderId, name, quantity, price) VALUES (` +
            `${esc(uuid())}, ${esc(o.id)}, ${esc(item.name)}, ${escNum(item.quantity)}, ${escNum(item.price)}` +
            `);`
        );
      }
    }
  }
}

// ── Inquiries ─────────────────────────────────────────
function seedInquiries(): void {
  const inquiriesPath = path.join(CONTENT_DIR, 'inquiries.json');
  if (!fs.existsSync(inquiriesPath)) return;

  const inquiries = JSON.parse(fs.readFileSync(inquiriesPath, 'utf-8'));
  if (!Array.isArray(inquiries) || inquiries.length === 0) return;

  emit(`\n-- Inquiries: ${inquiries.length} records`);

  for (const i of inquiries) {
    emit(
      `INSERT INTO inquiries (id, name, phone, message, locale, createdAt) VALUES (` +
        `${esc(i.id)}, ${esc(i.name)}, ${esc(i.phone)}, ${esc(i.message)}, ${esc(i.locale || 'ka')}, ${escDate(i.createdAt)}` +
        `);`
    );
  }
}

// ── Projects ──────────────────────────────────────────
function seedProjects(): void {
  const projectsPath = path.join(CONTENT_DIR, 'projects.json');
  if (!fs.existsSync(projectsPath)) return;

  const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf-8'));
  if (!Array.isArray(projects) || projects.length === 0) return;

  emit(`\n-- Projects: ${projects.length} records`);

  for (const p of projects) {
    emit(
      `INSERT INTO projects (id, titleKa, titleRu, titleEn, locationKa, locationRu, locationEn, type, cameras, image, year, isActive, createdAt) VALUES (` +
        `${esc(p.id)}, ${esc(p.title?.ka || '')}, ${esc(p.title?.ru || '')}, ${esc(p.title?.en || '')}, ` +
        `${esc(p.location?.ka || '')}, ${esc(p.location?.ru || '')}, ${esc(p.location?.en || '')}, ` +
        `${esc(p.type)}, ${escNum(p.cameras || 0)}, ${esc(p.image || '')}, ${esc(p.year || '')}, ` +
        `${escBool(p.isActive)}, ${escDate(p.createdAt)}` +
        `);`
    );
  }
}

// ── Catalog Config ────────────────────────────────────
function seedCatalogConfig(): void {
  const configPath = path.join(CONTENT_DIR, 'catalog-config.json');
  if (!fs.existsSync(configPath)) return;

  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  emit(`\n-- Catalog Config`);
  emit(
    `INSERT INTO catalog_config (id, categories, filters, updatedAt) VALUES (` +
      `'singleton', ${escJson(config.categories || [])}, ${escJson(config.filters || {})}, NOW(3)` +
      `);`
  );
}

// ── Site Settings ─────────────────────────────────────
function seedSiteSettings(): void {
  const settingsPath = path.join(CONTENT_DIR, 'site-settings.json');
  if (!fs.existsSync(settingsPath)) return;

  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
  emit(`\n-- Site Settings`);
  emit(
    `INSERT INTO site_settings (id, contact, business, hours, stats, social, announcement, updatedAt) VALUES (` +
      `'singleton', ${escJson(settings.contact || {})}, ${escJson(settings.business || {})}, ` +
      `${escJson(settings.hours || {})}, ${escJson(settings.stats || {})}, ` +
      `${escJson(settings.social || {})}, ${escJson(settings.announcement || {})}, NOW(3)` +
      `);`
  );
}

// ── Main ──────────────────────────────────────────────
emit('SET NAMES utf8mb4;');
emit('SET FOREIGN_KEY_CHECKS = 0;\n');

seedProducts();
seedArticles();
seedOrders();
seedInquiries();
seedProjects();
seedCatalogConfig();
seedSiteSettings();

emit('\nSET FOREIGN_KEY_CHECKS = 1;');

console.log(lines.join('\n'));
