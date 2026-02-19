import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const cwd = process.cwd();
  const contentDir = path.join(cwd, 'content');
  const productsDir = path.join(contentDir, 'products');

  const contentExists = fs.existsSync(contentDir);
  const productsExists = fs.existsSync(productsDir);
  const productFiles = productsExists ? fs.readdirSync(productsDir).slice(0, 5) : [];

  const contentFiles = contentExists ? fs.readdirSync(contentDir) : [];

  return NextResponse.json({
    cwd,
    contentDir,
    contentExists,
    contentFiles,
    productsExists,
    productFiles,
  });
}
