'use client';

import { useState } from 'react';
import { X } from '@phosphor-icons/react';

interface AnnouncementBarProps {
  message: string;
}

export function AnnouncementBar({ message }: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="bg-primary/8 border-b border-primary/15">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl flex items-center h-9 gap-4">

        {/* REC indicator — left spacer slot */}
        <div className="flex-1 flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-online opacity-60" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-online" />
          </span>
          <span className="hidden sm:inline text-[9px] font-mono uppercase tracking-[0.2em] text-online/70">live</span>
        </div>

        <p className="text-[11px] text-center text-muted-foreground tracking-wide">
          {message}
        </p>

        <div className="flex-1 flex justify-end">
          <button
            onClick={() => setDismissed(true)}
            className="text-muted-foreground/50 hover:text-foreground transition-colors p-1 rounded cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/50"
            aria-label="Dismiss announcement"
          >
            <X size={12} weight="bold" />
          </button>
        </div>

      </div>
    </div>
  );
}
