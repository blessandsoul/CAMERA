#!/usr/bin/env node
// Generate product JSON files from scraped data
// Run: node generate_products.js

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SCRAPED_FILE = path.join(__dirname, 'scraped_products.json');
const PRODUCTS_DIR = path.join(__dirname, 'client', 'public', 'data', 'products');
const IMAGES_SRC = path.join(__dirname, 'images');
const IMAGES_DEST = path.join(__dirname, 'client', 'public', 'images', 'products');

// Ensure directories exist
fs.mkdirSync(PRODUCTS_DIR, { recursive: true });
fs.mkdirSync(IMAGES_DEST, { recursive: true });

// Spec key translations: Georgian → {en, ru}
const SPEC_TRANSLATIONS = {
  'ბრენდი': { en: 'Brand', ru: 'Бренд' },
  'კამერის ტიპი': { en: 'Camera Type', ru: 'Тип камеры' },
  'კორპუსის ტიპი': { en: 'Body Type', ru: 'Тип корпуса' },
  'CMOS სენსორი': { en: 'CMOS Sensor', ru: 'CMOS сенсор' },
  'ლინზა': { en: 'Lens', ru: 'Объектив' },
  'ხედვის კუთხე': { en: 'View Angle', ru: 'Угол обзора' },
  'ღამის ხედვა': { en: 'Night Vision', ru: 'Ночное видение' },
  'ღამის ხედვა (მანძილი)': { en: 'Night Vision (Distance)', ru: 'Ночное видение (дистанция)' },
  'რეზოლუცია': { en: 'Resolution', ru: 'Разрешение' },
  'მიკროფონი': { en: 'Microphone', ru: 'Микрофон' },
  'Micro SD': { en: 'Micro SD', ru: 'Micro SD' },
  'დაცვის კლასი': { en: 'Protection Class', ru: 'Класс защиты' },
  'ადამიანის და ავტომობილის სილუეტის ამოცნობა': { en: 'Human & Vehicle Detection', ru: 'Распознавание людей и машин' },
  'Wi-Fi': { en: 'Wi-Fi', ru: 'Wi-Fi' },
  'PTZ / PT': { en: 'PTZ / PT', ru: 'PTZ / PT' },
  '101 დადგენილება': { en: '101 Regulation', ru: '101 Регламент' },
  'ოპტიკური ზუმი': { en: 'Optical Zoom', ru: 'Оптический зум' },
  'ციფრული ზუმი': { en: 'Digital Zoom', ru: 'Цифровой зум' },
  '4G': { en: '4G', ru: '4G' },
  'ანალოგური': { en: 'Analog', ru: 'Аналоговый' },
};

// Value translations: Georgian → {en, ru}
const VALUE_TRANSLATIONS = {
  'IP': { en: 'IP', ru: 'IP' },
  'ანალოგური': { en: 'Analog', ru: 'Аналоговый' },
  'გარე გამოყენების': { en: 'Outdoor', ru: 'Для улицы' },
  'შიდა გამოყენების': { en: 'Indoor', ru: 'Для помещений' },
  'ჭკვიანი': { en: 'Smart IR', ru: 'Smart IR' },
  'შავ-თეთრი': { en: 'B&W', ru: 'Ч/Б' },
  'ფერადი': { en: 'Full Color', ru: 'Цветная' },
  'კი': { en: 'Yes', ru: 'Да' },
  'კი. (ორმხრივი აუდ. კავშირი)': { en: 'Yes (Two-way audio)', ru: 'Да (двусторонняя аудиосвязь)' },
  'არა': { en: 'No', ru: 'Нет' },
  'PT': { en: 'PT', ru: 'PT' },
  'PTZ': { en: 'PTZ', ru: 'PTZ' },
};

function translateSpecKey(ka) {
  const t = SPEC_TRANSLATIONS[ka];
  return t ? { ka, en: t.en, ru: t.ru } : { ka, en: ka, ru: ka };
}

function translateSpecValue(ka) {
  const t = VALUE_TRANSLATIONS[ka];
  return t ? t.en : ka;
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function extractProductNameEN(name, specs) {
  // Name is already mostly in English/transliterated from product slug
  // Just use the Georgian name as-is for ka
  return name;
}

function inferCategory(specs) {
  const type = specs['კამერის ტიპი'] || '';
  const ptz = specs['PTZ / PT'] || '';
  if (ptz === 'PTZ' || ptz === 'PT') return 'ptz-cameras';
  if (type === 'ანალოგური') return 'analog-cameras';
  return 'ip-cameras';
}

function getImgFilename(imgUrl) {
  const decoded = decodeURIComponent(imgUrl);
  let filename = decoded.split('/').pop().split('?')[0];
  // Sanitize: replace non-word chars (same as download script)
  filename = filename.replace(/[^\w\-_.]/g, '_').replace(/__+/g, '_');
  return filename;
}

function buildProductFromScraped(data, index) {
  const specs = data.specs || {};

  // Build localized name
  // Use Georgian name as-is, generate English from URL slug
  const urlSlug = data.url.split('/').filter(Boolean).pop() || '';
  const nameEN = urlSlug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .slice(0, 100);

  const nameKA = data.name || nameEN;
  const nameRU = nameKA; // Will use Georgian for Russian too (acceptable)

  // Build description from specs
  const brand = specs['ბრენდი'] || '';
  const res = specs['რეზოლუცია'] || '';
  const lens = specs['ლინზა'] || '';
  const bodyType = specs['კორპუსის ტიპი'] || '';
  const nightVision = specs['ღამის ხედვა (მანძილი)'] || '';

  const descKA = `${nameKA}. ${bodyType} სამეთვალყურეო კამერა${res ? `, ${res}` : ''}${lens ? `, ${lens} ლინზა` : ''}${nightVision ? `, ღამის ხედვა ${nightVision}` : ''}.`;
  const descEN = `${brand} ${res} ${bodyType === 'გარე გამოყენების' ? 'outdoor' : 'indoor'} security camera${lens ? `, ${lens} lens` : ''}${nightVision ? `, ${nightVision} night vision` : ''}.`;
  const descRU = `${brand} ${res} ${bodyType === 'გარე გამოყენების' ? 'уличная' : 'внутренняя'} камера видеонаблюдения${lens ? `, объектив ${lens}` : ''}${nightVision ? `, ночное видение ${nightVision}` : ''}.`;

  // Build specs array
  const specsArr = Object.entries(specs).map(([ka, value]) => ({
    key: translateSpecKey(ka),
    value: value,
  }));

  // Build image list from scraped img URLs
  const images = (data.imgs || []).map(imgUrl => getImgFilename(imgUrl)).filter(Boolean);

  // Generate unique ID
  const id = `camera-${String(index + 1).padStart(3, '0')}`;

  return {
    id,
    slug: slugify(nameEN) || id,
    category: 'cameras',
    subcategory: inferCategory(specs),
    price: data.price || 0,
    currency: 'GEL',
    isActive: true,
    isFeatured: index < 12,
    images,
    name: {
      ka: nameKA,
      ru: nameRU,
      en: nameEN,
    },
    description: {
      ka: descKA,
      ru: descRU,
      en: descEN,
    },
    specs: specsArr,
    sourceUrl: data.url,
    createdAt: new Date(Date.now() - index * 3600000).toISOString(),
  };
}

// Load scraped data
if (!fs.existsSync(SCRAPED_FILE)) {
  console.error('scraped_products.json not found! Run the Playwright scraper first.');
  process.exit(1);
}

const scraped = JSON.parse(fs.readFileSync(SCRAPED_FILE, 'utf8'));
const products = Array.isArray(scraped) ? scraped : scraped.products || [];

console.log(`Processing ${products.length} scraped products...`);

// Copy images
console.log('\nCopying images...');
let imgCopied = 0;
let imgMissed = 0;

products.forEach(data => {
  (data.imgs || []).forEach(imgUrl => {
    const filename = getImgFilename(imgUrl);
    const src = path.join(IMAGES_SRC, filename);
    const dest = path.join(IMAGES_DEST, filename);
    if (fs.existsSync(src)) {
      if (!fs.existsSync(dest)) {
        fs.copyFileSync(src, dest);
        imgCopied++;
      }
    } else {
      imgMissed++;
    }
  });
});

console.log(`Images: ${imgCopied} copied, ${imgMissed} missing`);

// Generate JSON files
console.log('\nGenerating product JSON files...');
let generated = 0;
let skipped = 0;

// Clear old camera-* product files first
const existingFiles = fs.readdirSync(PRODUCTS_DIR).filter(f => f.startsWith('camera-') && f.endsWith('.json'));
existingFiles.forEach(f => fs.unlinkSync(path.join(PRODUCTS_DIR, f)));
console.log(`Cleared ${existingFiles.length} old product files`);

products.forEach((data, index) => {
  if (!data.name && !data.error) {
    skipped++;
    return;
  }
  if (data.error) {
    console.log(`  SKIP [${index}]: ${data.error} - ${data.url}`);
    skipped++;
    return;
  }

  const product = buildProductFromScraped(data, index);
  const outPath = path.join(PRODUCTS_DIR, `${product.id}.json`);
  fs.writeFileSync(outPath, JSON.stringify(product, null, 2), 'utf8');
  generated++;
  console.log(`  [${product.id}] ${product.name.ka.slice(0, 60)}`);
});

console.log(`\nDone! Generated: ${generated}, Skipped: ${skipped}`);
console.log(`Output: ${PRODUCTS_DIR}`);
