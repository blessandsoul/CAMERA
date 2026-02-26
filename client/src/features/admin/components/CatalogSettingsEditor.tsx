'use client';

import { useState } from 'react';
import { saveCatalogConfig } from '@/features/admin/actions/catalog.actions';
import { CategoriesEditor } from './CategoriesEditor';
import { FiltersEditor } from './FiltersEditor';
import type { CatalogConfig } from '@/lib/content';

interface Props {
  initialConfig: CatalogConfig;
}

export function CatalogSettingsEditor({ initialConfig }: Props): React.ReactElement {
  const [config, setConfig] = useState<CatalogConfig>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSave(): Promise<void> {
    setSaving(true);
    setMessage(null);
    const result = await saveCatalogConfig(JSON.stringify(config));
    if (result.success) {
      setMessage({ type: 'success', text: 'Saved' });
    } else {
      setMessage({ type: 'error', text: result.error ?? 'Failed to save' });
    }
    setSaving(false);
  }

  const fieldClass =
    'w-full px-2 py-1 rounded-md border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors text-sm';

  return (
    <div className="flex flex-col gap-6">
      <div className="sticky top-0 z-10 flex items-center gap-3 py-3 bg-gray-50">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-1.5 bg-gray-900 hover:bg-gray-800 active:scale-[0.98] text-white text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        {message && (
          <span className={`text-sm ${message.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
            {message.text}
          </span>
        )}
      </div>

      <CategoriesEditor config={config} setConfig={setConfig} fieldClass={fieldClass} />
      <FiltersEditor config={config} setConfig={setConfig} fieldClass={fieldClass} />
    </div>
  );
}
