import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { CatalogSettingsEditor } from '@/features/admin/components/CatalogSettingsEditor';
import { getCatalogConfig } from '@/lib/content';

export default async function CatalogSettingsPage(): Promise<React.ReactElement> {
  const config = getCatalogConfig();

  return (
    <>
      <AdminHeader />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Catalog Settings</h1>
        <CatalogSettingsEditor initialConfig={config} />
      </div>
    </>
  );
}
