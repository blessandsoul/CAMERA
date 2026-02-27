'use client';

import { useState } from 'react';
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

  const labelClass = 'text-sm font-medium text-foreground';

  return (
    <form action={action} className="space-y-8 max-w-2xl">
      <input type="hidden" name="isActive" value={isActive ? 'true' : 'false'} />
      <input type="hidden" name="type" value={typeValue} />

      {/* Title (3 languages) */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground">Title</legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="title_ka" className={labelClass}>Georgian</Label>
            <Input id="title_ka" name="title_ka" type="text" defaultValue={project?.title.ka} required />
          </div>
          <div>
            <Label htmlFor="title_ru" className={labelClass}>Russian</Label>
            <Input id="title_ru" name="title_ru" type="text" defaultValue={project?.title.ru} />
          </div>
          <div>
            <Label htmlFor="title_en" className={labelClass}>English</Label>
            <Input id="title_en" name="title_en" type="text" defaultValue={project?.title.en} />
          </div>
        </div>
      </fieldset>

      {/* Location (3 languages) */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground">Location</legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="location_ka" className={labelClass}>Georgian</Label>
            <Input id="location_ka" name="location_ka" type="text" defaultValue={project?.location.ka} required />
          </div>
          <div>
            <Label htmlFor="location_ru" className={labelClass}>Russian</Label>
            <Input id="location_ru" name="location_ru" type="text" defaultValue={project?.location.ru} />
          </div>
          <div>
            <Label htmlFor="location_en" className={labelClass}>English</Label>
            <Input id="location_en" name="location_en" type="text" defaultValue={project?.location.en} />
          </div>
        </div>
      </fieldset>

      {/* Type + Cameras + Year */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="type" className={labelClass}>Type</Label>
          <Select value={typeValue} onValueChange={setTypeValue}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="office">Office</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="cameras" className={labelClass}>Cameras</Label>
          <Input id="cameras" name="cameras" type="number" min="0" defaultValue={project?.cameras ?? 0} required />
        </div>
        <div>
          <Label htmlFor="year" className={labelClass}>Year</Label>
          <Input id="year" name="year" type="text" defaultValue={project?.year ?? new Date().getFullYear().toString()} required />
        </div>
      </div>

      {/* Image URL */}
      <div>
        <Label htmlFor="image" className={labelClass}>Image URL</Label>
        <Input id="image" name="image" type="text" defaultValue={project?.image} placeholder="https://..." />
        <p className="mt-1 text-xs text-muted-foreground">Paste an image URL (Unsplash, etc.)</p>
      </div>

      {/* Active toggle */}
      <div className="flex items-center gap-3">
        <Switch
          checked={isActive}
          onCheckedChange={setIsActive}
          aria-label="Active"
        />
        <Label className="text-sm text-foreground">Active</Label>
      </div>

      {/* Submit */}
      <Button type="submit">
        {project ? 'Save Changes' : 'Create Project'}
      </Button>
    </form>
  );
}
