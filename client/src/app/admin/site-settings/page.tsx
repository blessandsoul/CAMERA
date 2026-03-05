import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { SiteSettingsEditor } from '@/features/admin/components/SiteSettingsEditor';
import { getSiteSettings } from '@/lib/content';
import { requireAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export default async function SiteSettingsPage(): Promise<React.ReactElement> {
  await requireAdmin();
  const settings = await getSiteSettings();

  return (
    <>
      <AdminHeader />
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
        <h1 className="text-xl font-semibold text-foreground mb-6">საიტის პარამეტრები</h1>
        <SiteSettingsEditor initialSettings={settings} />
      </div>
    </>
  );
}
