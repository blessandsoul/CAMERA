'use client';

import { Phone } from '@phosphor-icons/react';

interface MobileCallBarProps {
  phone: string;
  label: string;
}

export function MobileCallBar({ phone, label }: MobileCallBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-[env(safe-area-inset-bottom)]">
      <a
        href={`https://wa.me/995${phone}?text=`}
        onClick={(e) => {
          e.preventDefault();
          // Try WhatsApp voice call deeplink first, fall back to wa.me chat
          const callUrl = `intent://call/995${phone}#Intent;package=com.whatsapp;scheme=whatsapp;end`;
          const waCallUrl = `whatsapp://call?phone=995${phone}`;

          // Try the deeplink approach
          window.location.href = waCallUrl;
        }}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-3 bg-online hover:bg-online/90 transition-colors h-16 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        aria-label={`${label} ${phone}`}
      >
        <Phone size={24} weight="fill" className="text-white" aria-hidden="true" />
        <span className="text-xl font-bold text-white tabular-nums tracking-wide">
          {phone}
        </span>
      </a>
    </div>
  );
}
