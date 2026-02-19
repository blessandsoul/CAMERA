import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const cwd = process.cwd();

  const list = (dir: string) => {
    try { return fs.readdirSync(dir); } catch { return `ERROR: not readable`; }
  };

  const exists = (p: string) => fs.existsSync(p);

  return NextResponse.json({
    cwd,
    appFiles: list(cwd),
    contentExists: exists(path.join(cwd, 'content')),
    contentFiles: list(path.join(cwd, 'content')),
    productsExists: exists(path.join(cwd, 'content', 'products')),
    productsFiles: list(path.join(cwd, 'content', 'products')),
  });
}
