'use client';

import { useState } from 'react';
import { saveCatalogConfig } from '@/features/admin/actions/catalog.actions';
import { CategoriesEditor } from './CategoriesEditor';
import { FiltersEditor } from './FiltersEditor';
import { Button } from '@/components/ui/button';
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

  return (
    <div className="flex flex-col gap-6">
      <div className="sticky top-0 z-10 flex items-center gap-3 py-3 bg-muted/50">
        <Button
          type="button"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
        {message && (
          <span className={`text-sm ${message.type === 'success' ? 'text-emerald-600' : 'text-destructive'}`}>
            {message.text}
          </span>
        )}
      </div>

      <CategoriesEditor config={config} setConfig={setConfig} />
      <FiltersEditor config={config} setConfig={setConfig} />
    </div>
  );
}
