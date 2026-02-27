'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface ImageManagerProps {
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
}

export function ImageManager({ images, setImages }: ImageManagerProps): React.ReactElement {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = (await res.json()) as { success: boolean; filename?: string; error?: string };
      if (data.success && data.filename) {
        setImages((imgs) => [...imgs, data.filename!]);
      } else {
        setError(data.error || `Upload failed (${res.status})`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function moveImage(index: number, direction: -1 | 1): void {
    setImages((imgs) => {
      const next = [...imgs];
      const target = index + direction;
      if (target < 0 || target >= next.length) return imgs;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-medium text-foreground uppercase tracking-wider">Images</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {images.map((img, idx) => (
          <div key={img} className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted group">
            <Image src={`/images/products/${img}`} alt="" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-center gap-0.5 pb-0.5 opacity-0 group-hover:opacity-100">
              {idx > 0 && (
                <button
                  type="button"
                  onClick={() => moveImage(idx, -1)}
                  className="w-4 h-4 bg-white/90 rounded flex items-center justify-center text-foreground cursor-pointer hover:bg-white transition-colors"
                  aria-label="Move image left"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-2.5 h-2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                </button>
              )}
              {idx < images.length - 1 && (
                <button
                  type="button"
                  onClick={() => moveImage(idx, 1)}
                  className="w-4 h-4 bg-white/90 rounded flex items-center justify-center text-foreground cursor-pointer hover:bg-white transition-colors"
                  aria-label="Move image right"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-2.5 h-2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setImages((imgs) => imgs.filter((i) => i !== img))}
              className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-black/80 transition-colors"
              aria-label="Remove image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-2.5 h-2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-16 h-16 rounded-lg border-2 border-dashed"
          aria-label="Upload image"
        >
          {uploading ? (
            <span className="text-[10px]">...</span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          )}
        </Button>
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUpload} />
      {error && (
        <p className="mt-2 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
