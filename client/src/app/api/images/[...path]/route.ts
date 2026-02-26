import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const segments = (await params).path;

  // Sanitize: no ".." allowed
  if (segments.some((s) => s === '..' || s.includes('\0'))) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const relativePath = segments.join('/');
  const filePath = path.join(process.cwd(), 'public', 'images', relativePath);

  // Must stay within public/images/
  const resolved = path.resolve(filePath);
  const allowed = path.resolve(process.cwd(), 'public', 'images');
  if (!resolved.startsWith(allowed)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      return new NextResponse('Not found', { status: 404 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const buffer = await readFile(filePath);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': String(buffer.length),
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
