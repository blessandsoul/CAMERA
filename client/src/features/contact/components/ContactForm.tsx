'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface ContactFormProps {
  locale: string;
}

export function ContactForm({ locale }: ContactFormProps): React.ReactElement {
  const t = useTranslations('contact');
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, locale }),
      });
      const data = (await res.json()) as { success: boolean };
      if (data.success) {
        setSuccess(true);
      } else {
        setError(t('error_generic'));
      }
    } catch {
      setError(t('error_generic'));
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-success">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">{t('success_title')}</h3>
        <p className="text-muted-foreground text-sm">{t('success_message')}</p>
      </div>
    );
  }

  const fieldClass =
    'w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm';

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">{t('name_label')}</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder={t('name_placeholder')}
          required
          minLength={2}
          className={fieldClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">{t('phone_label')}</label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          placeholder={t('phone_placeholder')}
          required
          minLength={6}
          className={fieldClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">{t('message_label')}</label>
        <textarea
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          placeholder={t('message_placeholder')}
          required
          minLength={10}
          rows={5}
          className={`${fieldClass} resize-y`}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-2.5 bg-primary hover:bg-primary/90 active:scale-[0.98] text-primary-foreground text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50"
      >
        {submitting ? t('submitting') : t('submit')}
      </button>
    </form>
  );
}
