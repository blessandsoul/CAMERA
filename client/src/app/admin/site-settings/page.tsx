import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { SiteSettingsEditor } from '@/features/admin/components/SiteSettingsEditor';
import { getSiteSettings } from '@/lib/content';

export default async function SiteSettingsPage(): Promise<React.ReactElement> {
  const settings = getSiteSettings();

  return (
    <>
      <AdminHeader />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Site Settings</h1>
        <SiteSettingsEditor initialSettings={settings} />
      </div>
    </>
  );
}
