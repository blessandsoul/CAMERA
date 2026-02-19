'use client';

import { useState, useRef } from 'react';
import TurndownService from 'turndown';
import { RichTextEditor } from './RichTextEditor';
import type { Article } from '@/types/article.types';

interface ArticleFormProps {
  article?: Article;
  action: (formData: FormData) => Promise<void>;
}

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

export function ArticleForm({ article, action }: ArticleFormProps): React.ReactElement {
  const [isPublished, setIsPublished] = useState(article?.isPublished ?? false);
  const [coverImage, setCoverImage] = useState(article?.coverImage ?? '');
  const [uploading, setUploading] = useState(false);
  const [bodyHtml, setBodyHtml] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const initialContent = article?.content
    ? markdownToSimpleHtml(article.content)
    : '';

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = (await res.json()) as { success: boolean; filename?: string };
    if (data.success && data.filename) {
      setCoverImage(`/images/products/${data.filename}`);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  function handleSubmit(formData: FormData): void {
    const markdown = turndown.turndown(bodyHtml || initialContent);
    formData.set('body', markdown);
    formData.set('coverImage', coverImage);
    formData.set('isPublished', isPublished ? 'true' : 'false');
    action(formData);
  }

  const fieldClass =
    'w-full px-3 py-1.5 rounded-md border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors text-sm';
  const labelClass = 'block text-xs text-gray-500 mb-0.5';

  return (
    <form ref={formRef} action={handleSubmit} className="max-w-3xl">
      <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
        {/* Cover Image */}
        <div className="p-4">
          <span className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">Cover Image</span>
          <div className="flex items-center gap-3">
            {coverImage && (
              <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-gray-100">
                <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setCoverImage('')}
                  className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-black/80 transition-colors"
                  aria-label="Remove cover"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-2.5 h-2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="px-3 py-1.5 rounded-md border border-dashed border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-900 text-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleCoverUpload} />
          </div>
        </div>

        {/* Meta */}
        <div className="p-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-4">
              <label className={labelClass}>Title</label>
              <input name="title" defaultValue={article?.title ?? ''} placeholder="სტატიის სათაური" className={fieldClass} required />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Slug (URL)</label>
              <input name="slug" defaultValue={article?.slug ?? ''} placeholder="rogor-aviron-kamera" className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select name="category" defaultValue={article?.category ?? 'guides'} className={fieldClass}>
                <option value="cameras">კამერები</option>
                <option value="nvr">NVR / DVR</option>
                <option value="installation">მონტაჟი</option>
                <option value="news">სიახლეები</option>
                <option value="guides">გაიდები</option>
              </select>
            </div>
            <div className="flex items-end gap-4 pb-0.5">
              <div>
                <label className={labelClass}>Min</label>
                <input name="readMin" type="number" min="1" max="60" defaultValue={article?.readMin ?? 5} className={`${fieldClass} w-16`} />
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer pb-1">
                <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="w-3.5 h-3.5 accent-gray-900" />
                <span className="text-xs text-gray-600">Published</span>
              </label>
            </div>
            <div className="col-span-4">
              <label className={labelClass}>Excerpt</label>
              <textarea name="excerpt" defaultValue={article?.excerpt ?? ''} rows={2} className={`${fieldClass} resize-y`} placeholder="მოკლე აღწერა..." />
            </div>
          </div>
        </div>

        {/* WYSIWYG Editor */}
        <div className="p-4">
          <span className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">Content</span>
          <RichTextEditor content={initialContent} onChange={setBodyHtml} />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="mt-4 px-5 py-2 bg-gray-900 hover:bg-gray-800 active:scale-[0.98] text-white text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer"
      >
        Save Article
      </button>
    </form>
  );
}

function markdownToSimpleHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hupbolia])/gm, '<p>')
    .replace(/<p><\/p>/g, '');
}
