'use client';

import * as React from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function ChatInput({ onSend, disabled, onFocus, onBlur }: ChatInputProps) {
  const [value, setValue] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSend(value.trim());
      setValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-t border-border/50 bg-background">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder="კითხვა კამერებზე..."
        disabled={disabled}
        className="flex-1 text-sm"
      />
      <Button
        type="submit"
        size="icon"
        disabled={!value.trim() || disabled}
        className="shrink-0 transition-all duration-200 active:scale-95"
        aria-label="გაგზავნა"
      >
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
}
