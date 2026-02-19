const fs = require('fs');
const path = require('path');

const JSON_DIR = path.join(__dirname, '..', 'client', 'public', 'data', 'products');
const MDX_DIR = path.join(__dirname, '..', 'content', 'products');

if (!fs.existsSync(MDX_DIR)) {
  fs.mkdirSync(MDX_DIR, { recursive: true });
}

const files = fs.readdirSync(JSON_DIR).filter((f) => f.endsWith('.json'));
console.log(`Found ${files.length} JSON product files to migrate.`);

let migrated = 0;
let errors = 0;

for (const file of files) {
  try {
    const raw = fs.readFileSync(path.join(JSON_DIR, file), 'utf-8');
    const product = JSON.parse(raw);

    const frontmatter = {
      id: product.id,
      slug: product.slug,
      category: product.category,
      price: product.price,
      currency: product.currency,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      images: product.images,
      name: product.name,
      specs: product.specs,
      createdAt: product.createdAt,
    };

    const body = product.description?.ka || '';
    const yaml = toYaml(frontmatter);
    const mdxContent = `---\n${yaml}---\n\n${body}\n`;

    const outFile = file.replace('.json', '.mdx');
    fs.writeFileSync(path.join(MDX_DIR, outFile), mdxContent, 'utf-8');
    migrated++;
  } catch (err) {
    console.error(`Error migrating ${file}:`, err.message);
    errors++;
  }
}

console.log(`\nDone! Migrated: ${migrated}, Errors: ${errors}`);

function toYaml(obj, indent = 0) {
  const pad = '  '.repeat(indent);
  let result = '';

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;

    if (typeof value === 'string') {
      if (value.includes(':') || value.includes('#') || value.includes('"') || value.includes("'") || value.includes('\n') || value === '' || value === 'true' || value === 'false') {
        result += `${pad}${key}: ${JSON.stringify(value)}\n`;
      } else {
        result += `${pad}${key}: ${value}\n`;
      }
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      result += `${pad}${key}: ${value}\n`;
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        result += `${pad}${key}: []\n`;
      } else if (typeof value[0] === 'string') {
        result += `${pad}${key}:\n`;
        for (const item of value) {
          result += `${pad}  - ${JSON.stringify(item)}\n`;
        }
      } else if (typeof value[0] === 'object') {
        result += `${pad}${key}:\n`;
        for (const item of value) {
          if (item.key && item.value !== undefined) {
            const keyObj = `{ ka: ${JSON.stringify(item.key.ka)}, en: ${JSON.stringify(item.key.en)}, ru: ${JSON.stringify(item.key.ru)} }`;
            result += `${pad}  - key: ${keyObj}\n`;
            result += `${pad}    value: ${JSON.stringify(item.value)}\n`;
          }
        }
      }
    } else if (typeof value === 'object') {
      result += `${pad}${key}:\n`;
      result += toYaml(value, indent + 1);
    }
  }

  return result;
}
