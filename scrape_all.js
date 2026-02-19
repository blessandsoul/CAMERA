#!/usr/bin/env node
// Scrape all camera products from netis.ge using Playwright

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, 'scraped_products.json');

async function extractProduct(page) {
  return await page.evaluate(() => {
    // Name
    const nameEl = document.querySelector('h1.ty-product-block-title, h1');
    const name = nameEl ? nameEl.textContent.trim() : '';

    // Price
    const intEl = document.querySelector('.ty-integer');
    const decEl = document.querySelector('.ty-price-num > sup:first-of-type');
    let price = 0;
    if (intEl) {
      const intPart = intEl.textContent.trim().replace(/\s/g, '');
      const decPart = decEl ? decEl.textContent.trim() : '00';
      price = parseFloat(intPart + '.' + decPart) || 0;
    }

    // Images - get all image links in the product gallery
    const imgSet = new Set();
    document.querySelectorAll('a[href*="/images/detailed/"]').forEach(a => {
      const href = a.getAttribute('href');
      if (href) imgSet.add(href);
    });
    // Also from img src
    document.querySelectorAll('img[src*="/images/detailed/"]').forEach(img => {
      const src = img.getAttribute('src');
      if (src) imgSet.add(src);
    });
    // Also from data-src
    document.querySelectorAll('[data-src*="/images/detailed/"]').forEach(el => {
      const src = el.getAttribute('data-src');
      if (src) imgSet.add(src);
    });
    const imgs = Array.from(imgSet);

    // Specs - from .ty-product-feature elements
    const specs = {};
    document.querySelectorAll('.ty-product-feature').forEach(row => {
      const keyEl = row.querySelector('.ty-product-feature__label span');
      const valEl = row.querySelector('.ty-product-feature__value');
      if (!keyEl || !valEl) return;
      const key = keyEl.textContent.trim();
      // Value: text nodes only (skip checkbox/input text)
      let val = '';
      valEl.childNodes.forEach(node => {
        if (node.nodeType === 3) val += node.textContent;
      });
      val = val.trim();
      if (key && val) specs[key] = val;
    });

    return { name, price, imgs, specs, url: window.location.href };
  });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    extraHTTPHeaders: { 'Referer': 'https://netis.ge/' }
  });
  const page = await context.newPage();

  // Load catalog to get all product URLs
  console.log('Loading catalog...');
  await page.goto(
    'https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/?items_per_page=128',
    { waitUntil: 'domcontentloaded', timeout: 30000 }
  );
  await page.waitForTimeout(2000);

  const allUrls = await page.evaluate(() => {
    const seen = new Set();
    const urls = [];
    document.querySelectorAll('a').forEach(a => {
      const href = a.href;
      if (!href || seen.has(href)) return;
      if (!href.includes('netis.ge')) return;
      const path = new URL(href).pathname;
      const segments = path.split('/').filter(Boolean);
      if (segments.length >= 3 && !href.includes('?') && !href.includes('#')) {
        seen.add(href);
        urls.push(href);
      }
    });
    return urls;
  });

  // Filter to camera product URLs only - must have a product slug at end (not just category)
  const productUrls = allUrls.filter(u => {
    if (!u.includes('%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90') && !u.includes('კამერა')) return false;
    const path = new URL(u).pathname;
    const segments = path.split('/').filter(Boolean);
    // Must have 4+ segments (lang/cat/subcat/product-slug)
    return segments.length >= 4;
  });

  console.log(`Found ${productUrls.length} product URLs`);

  const results = [];
  const failed = [];

  for (let i = 0; i < productUrls.length; i++) {
    const url = productUrls[i];
    console.log(`[${i + 1}/${productUrls.length}] ${url.split('/').pop() || url}`);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(300);
      const data = await extractProduct(page);
      if (data.name) {
        results.push(data);
        process.stdout.write(` -> ${data.name} (${data.price} GEL, ${data.imgs.length} imgs, ${Object.keys(data.specs).length} specs)\n`);
      } else {
        console.log(' -> SKIP (no name, probably category page)');
        failed.push({ url, reason: 'no name' });
      }
    } catch (e) {
      console.log(` -> ERROR: ${e.message}`);
      failed.push({ url, reason: e.message });
    }
  }

  await browser.close();

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ products: results, failed }, null, 2), 'utf8');
  console.log(`\nDone! ${results.length} products, ${failed.length} failed`);
  console.log(`Saved to ${OUTPUT_FILE}`);
}

main().catch(console.error);
