'use client';

import { useState } from 'react';
import { saveSiteSettings } from '@/features/admin/actions/site-settings.actions';
import {
  ContactSection,
  BusinessSection,
  HoursSection,
  StatsSection,
  AnnouncementSection,
  SocialSection,
} from './SiteSettingsSections';
import { Button } from '@/components/ui/button';
import type { SiteSettings } from '@/lib/content';

interface Props {
  initialSettings: SiteSettings;
}

export function SiteSettingsEditor({ initialSettings }: Props): React.ReactElement {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function update<K extends keyof SiteSettings>(section: K, data: Partial<SiteSettings[K]>): void {
    setSettings((prev) => ({ ...prev, [section]: { ...prev[section], ...data } }));
  }

  async function handleSave(): Promise<void> {
    setSaving(true);
    setMessage(null);
    const result = await saveSiteSettings(JSON.stringify(settings));
    setMessage(result.success ? { type: 'success', text: 'შენახულია!' } : { type: 'error', text: result.error ?? 'შეცდომა' });
    setSaving(false);
  }

  const sectionProps = { settings, update };

  return (
    <div className="max-w-2xl">
      <div className="sticky top-0 z-10 bg-muted/50 pb-4 flex items-center gap-3">
        <Button
          type="button"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'შენახვა...' : 'ცვლილებების შენახვა'}
        </Button>
        {message && (
          <span className={`text-sm ${message.type === 'success' ? 'text-success' : 'text-destructive'}`}>
            {message.text}
          </span>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        <ContactSection {...sectionProps} />
        <BusinessSection {...sectionProps} />
        <HoursSection {...sectionProps} />
        <StatsSection {...sectionProps} />
        <AnnouncementSection {...sectionProps} />
        <SocialSection {...sectionProps} />
      </div>
    </div>
  );
}
