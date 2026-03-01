'use client';

import { useState } from 'react';
import { InfoTooltip } from './InfoTooltip';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Project } from '@/lib/content';

interface ProjectFormProps {
  project?: Project;
  action: (formData: FormData) => Promise<void>;
}

export function ProjectForm({ project, action }: ProjectFormProps): React.ReactElement {
  const [isActive, setIsActive] = useState(project?.isActive ?? true);
  const [typeValue, setTypeValue] = useState<string>(project?.type ?? 'commercial');

  const labelClass = 'text-xs text-muted-foreground';

  return (
    <form action={action} className="max-w-2xl">
      <input type="hidden" name="isActive" value={isActive ? 'true' : 'false'} />
      <input type="hidden" name="type" value={typeValue} />

      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {/* Title (3 languages) */}
        <div className="p-4">
          <span className="block text-xs font-medium text-foreground uppercase tracking-wider mb-2">სათაური <InfoTooltip text="პროექტის სახელი სამ ენაზე. ქართული სავალდებულოა" /></span>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className={labelClass}>KA</Label>
              <Input name="title_ka" defaultValue={project?.title.ka} placeholder="ქართულად" required />
            </div>
            <div>
              <Label className={labelClass}>RU</Label>
              <Input name="title_ru" defaultValue={project?.title.ru} placeholder="По-русски" />
            </div>
            <div>
              <Label className={labelClass}>EN</Label>
              <Input name="title_en" defaultValue={project?.title.en} placeholder="In English" />
            </div>
          </div>
        </div>

        {/* Location (3 languages) */}
        <div className="p-4">
          <span className="block text-xs font-medium text-foreground uppercase tracking-wider mb-2">მდებარეობა <InfoTooltip text="პროექტის მისამართი / ადგილმდებარეობა სამ ენაზე" /></span>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className={labelClass}>KA</Label>
              <Input name="location_ka" defaultValue={project?.location.ka} placeholder="ქართულად" required />
            </div>
            <div>
              <Label className={labelClass}>RU</Label>
              <Input name="location_ru" defaultValue={project?.location.ru} placeholder="По-русски" />
            </div>
            <div>
              <Label className={labelClass}>EN</Label>
              <Input name="location_en" defaultValue={project?.location.en} placeholder="In English" />
            </div>
          </div>
        </div>

        {/* Type + Cameras + Year */}
        <div className="p-4">
          <span className="block text-xs font-medium text-foreground uppercase tracking-wider mb-2">დეტალები <InfoTooltip text="პროექტის ტექნიკური დეტალები" /></span>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className={labelClass}>ტიპი <InfoTooltip text="პროექტის ტიპი: კომერციული, საცხოვრებელი, სავაჭრო ან საოფისე" /></Label>
              <Select value={typeValue} onValueChange={setTypeValue}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="commercial">კომერციული</SelectItem>
                  <SelectItem value="residential">საცხოვრებელი</SelectItem>
                  <SelectItem value="retail">სავაჭრო</SelectItem>
                  <SelectItem value="office">საოფისე</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={labelClass}>კამერები <InfoTooltip text="დამონტაჟებული კამერების რაოდენობა" /></Label>
              <Input name="cameras" type="number" min="0" defaultValue={project?.cameras ?? 0} required />
            </div>
            <div>
              <Label className={labelClass}>წელი <InfoTooltip text="მონტაჟის / დასრულების წელი" /></Label>
              <Input name="year" type="text" defaultValue={project?.year ?? new Date().getFullYear().toString()} required />
            </div>
          </div>
        </div>

        {/* Image URL + Active */}
        <div className="p-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Label className={labelClass}>სურათის URL <InfoTooltip text="სურათის ბმული — ჩასვით URL (Unsplash და სხვ.)" /></Label>
              <Input name="image" type="text" defaultValue={project?.image} placeholder="https://..." />
            </div>
            <div className="flex items-end pb-1">
              <div className="flex items-center gap-2">
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  aria-label="აქტიური"
                />
                <Label className="text-xs text-muted-foreground cursor-pointer">აქტიური <InfoTooltip text="გამორთვისას პროექტი არ გამოჩნდება საიტზე" /></Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Button type="submit" className="mt-4">
        {project ? 'ცვლილებების შენახვა' : 'პროექტის შექმნა'}
      </Button>
    </form>
  );
}
