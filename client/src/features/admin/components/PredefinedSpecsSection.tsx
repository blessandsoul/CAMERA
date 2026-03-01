'use client';

import { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CAMERA_SPECS } from '@/lib/constants/camera-specs';
import type { PredefinedSpec } from '@/lib/constants/camera-specs';

interface PredefinedSpecsSectionProps {
  values: Record<string, string[]>;
  onChange: (values: Record<string, string[]>) => void;
}

export function PredefinedSpecsSection({ values, onChange }: PredefinedSpecsSectionProps): React.ReactElement {
  const toggleValue = useCallback(
    (specId: string, value: string): void => {
      const current = values[specId] ?? [];
      const isSelected = current.includes(value);
      onChange({
        ...values,
        [specId]: isSelected ? current.filter((v) => v !== value) : [...current, value],
      });
    },
    [values, onChange]
  );

  const setTextValue = useCallback(
    (specId: string, value: string): void => {
      onChange({
        ...values,
        [specId]: value ? [value] : [],
      });
    },
    [values, onChange]
  );

  return (
    <div className="space-y-0.5">
      {CAMERA_SPECS.map((spec) => (
        <SpecRow
          key={spec.id}
          spec={spec}
          selected={values[spec.id] ?? []}
          onToggle={toggleValue}
          onTextChange={setTextValue}
        />
      ))}
    </div>
  );
}

interface SpecRowProps {
  spec: PredefinedSpec;
  selected: string[];
  onToggle: (specId: string, value: string) => void;
  onTextChange: (specId: string, value: string) => void;
}

function SpecRow({ spec, selected, onToggle, onTextChange }: SpecRowProps): React.ReactElement {
  if (spec.type === 'text') {
    return (
      <div className="flex items-center gap-3 py-2">
        <span className="text-xs text-muted-foreground w-36 shrink-0">{spec.keyKa}</span>
        <Input
          value={selected[0] ?? ''}
          onChange={(e) => onTextChange(spec.id, e.target.value)}
          placeholder="მაგ: 120°"
          className="max-w-48 h-8 text-xs"
        />
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 py-2">
      <span className="text-xs text-muted-foreground w-36 shrink-0 pt-1">{spec.keyKa}</span>
      <div className="flex flex-wrap gap-1.5">
        {spec.options?.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onToggle(spec.id, opt.value)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-200 cursor-pointer',
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/40'
              )}
            >
              {opt.value}
            </button>
          );
        })}
      </div>
    </div>
  );
}
