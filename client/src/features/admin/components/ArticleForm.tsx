'use client';

import { useState, useRef } from 'react';
import TurndownService from 'turndown';
import { RichTextEditor } from './RichTextEditor';
import { InfoTooltip } from './InfoTooltip';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  const [categoryValue, setCategoryValue] = useState<string>(article?.category ?? 'guides');
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
    formData.set('category', categoryValue);
    action(formData);
  }

  const labelClass = 'text-xs text-muted-foreground';

  return (
    <form ref={formRef} action={handleSubmit} className="max-w-3xl">
      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {/* Cover Image */}
        <div className="p-4">
          <span className="block text-xs font-medium text-foreground uppercase tracking-wider mb-2">გარეკანი <InfoTooltip text="სტატიის მთავარი სურათი — გამოჩნდება სტატიების სიაში და სტატიის თავში" /></span>
          <div className="flex items-center gap-3">
            {coverImage && (
              <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-muted">
                <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setCoverImage('')}
                  className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-black/80 transition-colors"
                  aria-label="გარეკანის წაშლა"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-2.5 h-2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'ატვირთვა...' : 'ატვირთვა'}
            </Button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleCoverUpload} />
          </div>
        </div>

        {/* Meta */}
        <div className="p-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-4">
              <Label className={labelClass}>სათაური <InfoTooltip text="სტატიის სათაური — გამოჩნდება საიტზე და SEO-ში" /></Label>
              <Input name="title" defaultValue={article?.title ?? ''} placeholder="სტატიის სათაური" required />
            </div>
            <div className="col-span-2">
              <Label className={labelClass}>სლაგი (URL) <InfoTooltip text="URL მისამართი ლათინურად. მაგ: rogor-aviron-kamera" /></Label>
              <Input name="slug" defaultValue={article?.slug ?? ''} placeholder="rogor-aviron-kamera" />
            </div>
            <div>
              <Label className={labelClass}>კატეგორია <InfoTooltip text="სტატიის კატეგორია — განსაზღვრავს რა სექციაში მოხვდება" /></Label>
              <Select value={categoryValue} onValueChange={setCategoryValue}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cameras">კამერები</SelectItem>
                  <SelectItem value="nvr">NVR / DVR</SelectItem>
                  <SelectItem value="installation">მონტაჟი</SelectItem>
                  <SelectItem value="news">სიახლეები</SelectItem>
                  <SelectItem value="guides">გაიდები</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-4 pb-0.5">
              <div>
                <Label className={labelClass}>წთ <InfoTooltip text="სავარაუდო კითხვის დრო წუთებში" /></Label>
                <Input name="readMin" type="number" min="1" max="60" defaultValue={article?.readMin ?? 5} className="w-16" />
              </div>
              <div className="flex items-center gap-1.5 pb-1">
                <Checkbox
                  id="isPublished"
                  checked={isPublished}
                  onCheckedChange={(checked) => setIsPublished(checked === true)}
                />
                <Label htmlFor="isPublished" className="text-xs text-muted-foreground cursor-pointer">გამოქვეყნებული <InfoTooltip text="გამოქვეყნებული სტატია ხილულია საიტზე. მონახაზი არის მხოლოდ ადმინში" /></Label>
              </div>
            </div>
            <div className="col-span-4">
              <Label className={labelClass}>მოკლე აღწერა <InfoTooltip text="მოკლე აღწერა — გამოჩნდება სტატიების სიაში და SEO description-ში" /></Label>
              <Textarea name="excerpt" defaultValue={article?.excerpt ?? ''} rows={2} className="resize-y" placeholder="მოკლე აღწერა..." />
            </div>
          </div>
        </div>

        {/* WYSIWYG Editor */}
        <div className="p-4">
          <span className="block text-xs font-medium text-foreground uppercase tracking-wider mb-2">შინაარსი <InfoTooltip text="სტატიის ძირითადი ტექსტი — შეგიძლიათ გამოიყენოთ ფორმატირება, სურათები და ბმულები" /></span>
          <RichTextEditor content={initialContent} onChange={setBodyHtml} />
        </div>
      </div>

      {/* Submit */}
      <Button type="submit" className="mt-4">
        სტატიის შენახვა
      </Button>
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
