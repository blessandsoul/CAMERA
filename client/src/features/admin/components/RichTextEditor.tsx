'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps): React.ReactElement {
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      ImageExtension.configure({
        inline: false,
        allowBase64: false,
      }),
      LinkExtension.configure({
        openOnClick: false,
      }),
      Underline,
    ],
    content,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[300px] px-4 py-3 focus:outline-none',
      },
    },
  });

  const addImage = useCallback(async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = (await res.json()) as { success: boolean; filename?: string };
    if (data.success && data.filename && editor) {
      editor
        .chain()
        .focus()
        .setImage({ src: `/images/products/${data.filename}` })
        .run();
    }
  }, [editor]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) addImage(file);
    if (fileRef.current) fileRef.current.value = '';
  }, [addImage]);

  const handleLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL:', prev || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return <div className="h-[300px] bg-muted/50 rounded-lg animate-pulse" />;

  const btnClass = (active: boolean): string =>
    `p-1.5 rounded text-sm transition-colors cursor-pointer ${
      active
        ? 'bg-foreground text-background'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
    }`;

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-border bg-muted/50">
        <Button type="button" variant="ghost" size="icon-xs" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))} title="მუქი">
          <strong className="text-xs">B</strong>
        </Button>
        <Button type="button" variant="ghost" size="icon-xs" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))} title="დახრილი">
          <em className="text-xs">I</em>
        </Button>
        <Button type="button" variant="ghost" size="icon-xs" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass(editor.isActive('underline'))} title="ხაზგასმული">
          <u className="text-xs">U</u>
        </Button>

        <div className="w-px h-5 bg-border mx-1" />

        <Button type="button" variant="ghost" size="xs" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnClass(editor.isActive('heading', { level: 1 }))} title="H1">
          H1
        </Button>
        <Button type="button" variant="ghost" size="xs" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive('heading', { level: 2 }))} title="H2">
          H2
        </Button>
        <Button type="button" variant="ghost" size="xs" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnClass(editor.isActive('heading', { level: 3 }))} title="H3">
          H3
        </Button>

        <div className="w-px h-5 bg-border mx-1" />

        <Button type="button" variant="ghost" size="xs" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))} title="მარკირებული სია">
          &#8226; სია
        </Button>
        <Button type="button" variant="ghost" size="xs" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))} title="ნუმერაციული სია">
          1. სია
        </Button>
        <Button type="button" variant="ghost" size="xs" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive('blockquote'))} title="ციტატა">
          &ldquo; ციტატა
        </Button>

        <div className="w-px h-5 bg-border mx-1" />

        <Button type="button" variant="ghost" size="xs" onClick={handleLink} className={btnClass(editor.isActive('link'))} title="ბმული">
          ბმული
        </Button>
        <Button type="button" variant="ghost" size="xs" onClick={() => fileRef.current?.click()} className={btnClass(false)} title="სურათი">
          სურ.
        </Button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageUpload} />
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
