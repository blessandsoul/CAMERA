'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { SiteSettings } from '@/lib/content';

export interface SectionProps {
  settings: SiteSettings;
  update: <K extends keyof SiteSettings>(section: K, data: Partial<SiteSettings[K]>) => void;
}

const labelClass = 'text-xs text-muted-foreground';
const sectionTitleClass = 'text-xs font-medium text-foreground uppercase tracking-wider';

export function ContactSection({ settings, update }: SectionProps): React.ReactElement {
  return (
    <div className="p-4">
      <span className={sectionTitleClass}>Contact</span>
      <div className="grid grid-cols-3 gap-3 mt-2">
        <div>
          <Label className={labelClass}>Phone</Label>
          <Input value={settings.contact.phone} onChange={(e) => update('contact', { phone: e.target.value })} placeholder="597470518" />
        </div>
        <div>
          <Label className={labelClass}>WhatsApp (if different)</Label>
          <Input value={settings.contact.whatsapp} onChange={(e) => update('contact', { whatsapp: e.target.value })} placeholder="Same as phone" />
        </div>
        <div>
          <Label className={labelClass}>Email</Label>
          <Input type="email" value={settings.contact.email} onChange={(e) => update('contact', { email: e.target.value })} placeholder="info@techbrain.ge" />
        </div>
      </div>
    </div>
  );
}

export function BusinessSection({ settings, update }: SectionProps): React.ReactElement {
  return (
    <div className="p-4">
      <span className={sectionTitleClass}>Business</span>
      <div className="grid grid-cols-3 gap-3 mt-2">
        <div className="col-span-3">
          <Label className={labelClass}>Company Name</Label>
          <Input value={settings.business.companyName} onChange={(e) => update('business', { companyName: e.target.value })} />
        </div>
        <div>
          <Label className={labelClass}>City</Label>
          <Input value={settings.business.address.city} onChange={(e) => update('business', { address: { ...settings.business.address, city: e.target.value } })} />
        </div>
        <div>
          <Label className={labelClass}>Region</Label>
          <Input value={settings.business.address.region} onChange={(e) => update('business', { address: { ...settings.business.address, region: e.target.value } })} />
        </div>
        <div>
          <Label className={labelClass}>Country Code</Label>
          <Input value={settings.business.address.country} onChange={(e) => update('business', { address: { ...settings.business.address, country: e.target.value } })} placeholder="GE" />
        </div>
        <div>
          <Label className={labelClass}>Latitude</Label>
          <Input type="number" step="0.0001" value={settings.business.geo.latitude} onChange={(e) => update('business', { geo: { ...settings.business.geo, latitude: Number(e.target.value) } })} />
        </div>
        <div>
          <Label className={labelClass}>Longitude</Label>
          <Input type="number" step="0.0001" value={settings.business.geo.longitude} onChange={(e) => update('business', { geo: { ...settings.business.geo, longitude: Number(e.target.value) } })} />
        </div>
      </div>
    </div>
  );
}

export function HoursSection({ settings, update }: SectionProps): React.ReactElement {
  return (
    <div className="p-4">
      <span className={sectionTitleClass}>Business Hours</span>
      <div className="grid grid-cols-4 gap-3 mt-2">
        <div>
          <Label className={labelClass}>Weekdays Open</Label>
          <Input type="time" value={settings.hours.weekdays.open} onChange={(e) => update('hours', { weekdays: { ...settings.hours.weekdays, open: e.target.value } })} />
        </div>
        <div>
          <Label className={labelClass}>Weekdays Close</Label>
          <Input type="time" value={settings.hours.weekdays.close} onChange={(e) => update('hours', { weekdays: { ...settings.hours.weekdays, close: e.target.value } })} />
        </div>
        <div>
          <Label className={labelClass}>Sunday Open</Label>
          <Input type="time" value={settings.hours.sunday.open} onChange={(e) => update('hours', { sunday: { ...settings.hours.sunday, open: e.target.value } })} />
        </div>
        <div>
          <Label className={labelClass}>Sunday Close</Label>
          <Input type="time" value={settings.hours.sunday.close} onChange={(e) => update('hours', { sunday: { ...settings.hours.sunday, close: e.target.value } })} />
        </div>
      </div>
    </div>
  );
}

export function StatsSection({ settings, update }: SectionProps): React.ReactElement {
  return (
    <div className="p-4">
      <span className={sectionTitleClass}>Statistics</span>
      <div className="grid grid-cols-4 gap-3 mt-2">
        <div>
          <Label className={labelClass}>Cameras Installed</Label>
          <Input value={settings.stats.camerasInstalled} onChange={(e) => update('stats', { camerasInstalled: e.target.value })} placeholder="500+" />
        </div>
        <div>
          <Label className={labelClass}>Projects</Label>
          <Input value={settings.stats.projectsCompleted} onChange={(e) => update('stats', { projectsCompleted: e.target.value })} placeholder="120+" />
        </div>
        <div>
          <Label className={labelClass}>Years Exp.</Label>
          <Input value={settings.stats.yearsExperience} onChange={(e) => update('stats', { yearsExperience: e.target.value })} placeholder="5+" />
        </div>
        <div>
          <Label className={labelClass}>Warranty (yrs)</Label>
          <Input value={settings.stats.warrantyYears} onChange={(e) => update('stats', { warrantyYears: e.target.value })} placeholder="2" />
        </div>
      </div>
    </div>
  );
}

export function AnnouncementSection({ settings, update }: SectionProps): React.ReactElement {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className={sectionTitleClass}>Announcement Banner</span>
        <div className="flex items-center gap-1.5">
          <Checkbox
            id="announcement-enabled"
            checked={settings.announcement.enabled}
            onCheckedChange={(checked) => update('announcement', { enabled: checked === true })}
          />
          <Label htmlFor="announcement-enabled" className="text-xs text-muted-foreground cursor-pointer">Enabled</Label>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className={labelClass}>Text KA</Label>
          <Input value={settings.announcement.text_ka} onChange={(e) => update('announcement', { text_ka: e.target.value })} placeholder="ქართულად" />
        </div>
        <div>
          <Label className={labelClass}>Text RU</Label>
          <Input value={settings.announcement.text_ru} onChange={(e) => update('announcement', { text_ru: e.target.value })} placeholder="По-русски" />
        </div>
        <div>
          <Label className={labelClass}>Text EN</Label>
          <Input value={settings.announcement.text_en} onChange={(e) => update('announcement', { text_en: e.target.value })} placeholder="In English" />
        </div>
      </div>
    </div>
  );
}

export function SocialSection({ settings, update }: SectionProps): React.ReactElement {
  return (
    <div className="p-4">
      <span className={sectionTitleClass}>Social Links</span>
      <div className="grid grid-cols-3 gap-3 mt-2">
        <div>
          <Label className={labelClass}>Facebook</Label>
          <Input value={settings.social.facebook} onChange={(e) => update('social', { facebook: e.target.value })} placeholder="https://facebook.com/..." />
        </div>
        <div>
          <Label className={labelClass}>Instagram</Label>
          <Input value={settings.social.instagram} onChange={(e) => update('social', { instagram: e.target.value })} placeholder="https://instagram.com/..." />
        </div>
        <div>
          <Label className={labelClass}>TikTok</Label>
          <Input value={settings.social.tiktok} onChange={(e) => update('social', { tiktok: e.target.value })} placeholder="https://tiktok.com/@..." />
        </div>
      </div>
    </div>
  );
}
