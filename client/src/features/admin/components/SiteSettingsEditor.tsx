'use client';

import { useState } from 'react';
import { saveSiteSettings } from '@/features/admin/actions/site-settings.actions';
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

  return (
    <div className="max-w-2xl">
      {/* Sticky save bar */}
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
        {/* Contact */}
        <div className="p-4">
          <span className={sectionTitle}>Contact</span>
          <div className="grid grid-cols-3 gap-3 mt-2">
            <div>
              <label className={labelClass}>Phone</label>
              <input
                value={settings.contact.phone}
                onChange={(e) => update('contact', { phone: e.target.value })}
                placeholder="597470518"
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>WhatsApp (if different)</label>
              <input
                value={settings.contact.whatsapp}
                onChange={(e) => update('contact', { whatsapp: e.target.value })}
                placeholder="Same as phone"
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={settings.contact.email}
                onChange={(e) => update('contact', { email: e.target.value })}
                placeholder="info@techbrain.ge"
                className={fieldClass}
              />
            </div>
          </div>
        </div>

        {/* Business */}
        <div className="p-4">
          <span className={sectionTitle}>Business</span>
          <div className="grid grid-cols-3 gap-3 mt-2">
            <div className="col-span-3">
              <label className={labelClass}>Company Name</label>
              <input
                value={settings.business.companyName}
                onChange={(e) => update('business', { companyName: e.target.value })}
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>City</label>
              <input
                value={settings.business.address.city}
                onChange={(e) =>
                  update('business', { address: { ...settings.business.address, city: e.target.value } })
                }
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Region</label>
              <input
                value={settings.business.address.region}
                onChange={(e) =>
                  update('business', { address: { ...settings.business.address, region: e.target.value } })
                }
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Country Code</label>
              <input
                value={settings.business.address.country}
                onChange={(e) =>
                  update('business', { address: { ...settings.business.address, country: e.target.value } })
                }
                placeholder="GE"
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={settings.business.geo.latitude}
                onChange={(e) =>
                  update('business', { geo: { ...settings.business.geo, latitude: Number(e.target.value) } })
                }
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={settings.business.geo.longitude}
                onChange={(e) =>
                  update('business', { geo: { ...settings.business.geo, longitude: Number(e.target.value) } })
                }
                className={fieldClass}
              />
            </div>
          </div>
        </div>

        {/* Hours */}
        <div className="p-4">
          <span className={sectionTitle}>Business Hours</span>
          <div className="grid grid-cols-4 gap-3 mt-2">
            <div>
              <label className={labelClass}>Weekdays Open</label>
              <input
                type="time"
                value={settings.hours.weekdays.open}
                onChange={(e) =>
                  update('hours', { weekdays: { ...settings.hours.weekdays, open: e.target.value } })
                }
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Weekdays Close</label>
              <input
                type="time"
                value={settings.hours.weekdays.close}
                onChange={(e) =>
                  update('hours', { weekdays: { ...settings.hours.weekdays, close: e.target.value } })
                }
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Sunday Open</label>
              <input
                type="time"
                value={settings.hours.sunday.open}
                onChange={(e) =>
                  update('hours', { sunday: { ...settings.hours.sunday, open: e.target.value } })
                }
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Sunday Close</label>
              <input
                type="time"
                value={settings.hours.sunday.close}
                onChange={(e) =>
                  update('hours', { sunday: { ...settings.hours.sunday, close: e.target.value } })
                }
                className={fieldClass}
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-4">
          <span className={sectionTitle}>Statistics</span>
          <div className="grid grid-cols-4 gap-3 mt-2">
            <div>
              <label className={labelClass}>Cameras Installed</label>
              <input
                value={settings.stats.camerasInstalled}
                onChange={(e) => update('stats', { camerasInstalled: e.target.value })}
                placeholder="500+"
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Projects</label>
              <input
                value={settings.stats.projectsCompleted}
                onChange={(e) => update('stats', { projectsCompleted: e.target.value })}
                placeholder="120+"
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Years Exp.</label>
              <input
                value={settings.stats.yearsExperience}
                onChange={(e) => update('stats', { yearsExperience: e.target.value })}
                placeholder="5+"
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Warranty (yrs)</label>
              <input
                value={settings.stats.warrantyYears}
                onChange={(e) => update('stats', { warrantyYears: e.target.value })}
                placeholder="2"
                className={fieldClass}
              />
            </div>
          </div>
        </div>

        {/* Announcement Banner */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className={sectionTitle}>Announcement Banner</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.announcement.enabled}
                onChange={(e) => update('announcement', { enabled: e.target.checked })}
                className="w-3.5 h-3.5 accent-gray-900"
              />
              <span className="text-xs text-gray-600">Enabled</span>
            </label>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Text KA</label>
              <input
                value={settings.announcement.text_ka}
                onChange={(e) => update('announcement', { text_ka: e.target.value })}
                placeholder="ქართულად"
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Text RU</label>
              <input
                value={settings.announcement.text_ru}
                onChange={(e) => update('announcement', { text_ru: e.target.value })}
                placeholder="По-русски"
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Text EN</label>
              <input
                value={settings.announcement.text_en}
                onChange={(e) => update('announcement', { text_en: e.target.value })}
                placeholder="In English"
                className={fieldClass}
              />
            </div>
          </div>
        </div>

        {/* Social */}
        <div className="p-4">
          <span className={sectionTitle}>Social Links</span>
          <div className="grid grid-cols-3 gap-3 mt-2">
            <div>
              <label className={labelClass}>Facebook</label>
              <input
                value={settings.social.facebook}
                onChange={(e) => update('social', { facebook: e.target.value })}
                placeholder="https://facebook.com/..."
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Instagram</label>
              <input
                value={settings.social.instagram}
                onChange={(e) => update('social', { instagram: e.target.value })}
                placeholder="https://instagram.com/..."
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>TikTok</label>
              <input
                value={settings.social.tiktok}
                onChange={(e) => update('social', { tiktok: e.target.value })}
                placeholder="https://tiktok.com/@..."
                className={fieldClass}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
