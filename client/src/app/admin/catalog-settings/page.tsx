import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { CatalogSettingsEditor } from '@/features/admin/components/CatalogSettingsEditor';
import { getCatalogConfig } from '@/lib/content';
import { requireAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export default async function CatalogSettingsPage(): Promise<React.ReactElement> {
  await requireAdmin();
  const config = await getCatalogConfig();

  return (
    <>
      <AdminHeader />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <h1 className="text-xl font-semibold text-foreground mb-6">კატალოგის პარამეტრები</h1>
        <CatalogSettingsEditor initialConfig={config} />
      </div>
    </>
  );
}
