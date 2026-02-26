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
    setMessage(result.success ? { type: 'success', text: 'Saved!' } : { type: 'error', text: result.error ?? 'Error' });
    setSaving(false);
  }

  const fieldClass =
    'w-full px-3 py-1.5 rounded-md border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors text-sm';
  const labelClass = 'block text-xs text-gray-500 mb-0.5';
  const sectionTitle = 'text-xs font-medium text-gray-900 uppercase tracking-wider';

  const sectionProps = { settings, update, fieldClass, labelClass, sectionTitle };

  return (
    <div className="max-w-2xl">
      <div className="sticky top-0 z-10 bg-gray-50 pb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 bg-gray-900 hover:bg-gray-800 active:scale-[0.98] text-white text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        {message && (
          <span className={`text-sm ${message.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
            {message.text}
          </span>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
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
