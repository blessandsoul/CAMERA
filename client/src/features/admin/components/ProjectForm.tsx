'use client';

import { useState } from 'react';
import type { Project } from '@/lib/content';

interface ProjectFormProps {
  project?: Project;
  action: (formData: FormData) => Promise<void>;
}

export function ProjectForm({ project, action }: ProjectFormProps): React.ReactElement {
  const [isActive, setIsActive] = useState(project?.isActive ?? true);

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <form action={action} className="space-y-8 max-w-2xl">
      {/* Title (3 languages) */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-gray-900">Title</legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="title_ka" className={labelClass}>Georgian</label>
            <input id="title_ka" name="title_ka" type="text" defaultValue={project?.title.ka} className={inputClass} required />
          </div>
          <div>
            <label htmlFor="title_ru" className={labelClass}>Russian</label>
            <input id="title_ru" name="title_ru" type="text" defaultValue={project?.title.ru} className={inputClass} />
          </div>
          <div>
            <label htmlFor="title_en" className={labelClass}>English</label>
            <input id="title_en" name="title_en" type="text" defaultValue={project?.title.en} className={inputClass} />
          </div>
        </div>
      </fieldset>

      {/* Location (3 languages) */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-gray-900">Location</legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="location_ka" className={labelClass}>Georgian</label>
            <input id="location_ka" name="location_ka" type="text" defaultValue={project?.location.ka} className={inputClass} required />
          </div>
          <div>
            <label htmlFor="location_ru" className={labelClass}>Russian</label>
            <input id="location_ru" name="location_ru" type="text" defaultValue={project?.location.ru} className={inputClass} />
          </div>
          <div>
            <label htmlFor="location_en" className={labelClass}>English</label>
            <input id="location_en" name="location_en" type="text" defaultValue={project?.location.en} className={inputClass} />
          </div>
        </div>
      </fieldset>

      {/* Type + Cameras + Year */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="type" className={labelClass}>Type</label>
          <select id="type" name="type" defaultValue={project?.type ?? 'commercial'} className={inputClass}>
            <option value="commercial">Commercial</option>
            <option value="residential">Residential</option>
            <option value="retail">Retail</option>
            <option value="office">Office</option>
          </select>
        </div>
        <div>
          <label htmlFor="cameras" className={labelClass}>Cameras</label>
          <input id="cameras" name="cameras" type="number" min="0" defaultValue={project?.cameras ?? 0} className={inputClass} required />
        </div>
        <div>
          <label htmlFor="year" className={labelClass}>Year</label>
          <input id="year" name="year" type="text" defaultValue={project?.year ?? new Date().getFullYear().toString()} className={inputClass} required />
        </div>
      </div>

      {/* Image URL */}
      <div>
        <label htmlFor="image" className={labelClass}>Image URL</label>
        <input id="image" name="image" type="text" defaultValue={project?.image} placeholder="https://..." className={inputClass} />
        <p className="mt-1 text-xs text-gray-400">Paste an image URL (Unsplash, etc.)</p>
      </div>

      {/* Active toggle */}
      <div className="flex items-center gap-3">
        <input type="hidden" name="isActive" value={isActive ? 'true' : 'false'} />
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${isActive ? 'bg-blue-500' : 'bg-gray-200'}`}
          role="switch"
          aria-checked={isActive}
          aria-label="Active"
        >
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${isActive ? 'left-5' : 'left-1'}`} />
        </button>
        <span className="text-sm text-gray-700">Active</span>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
      >
        {project ? 'Save Changes' : 'Create Project'}
      </button>
    </form>
  );
}
