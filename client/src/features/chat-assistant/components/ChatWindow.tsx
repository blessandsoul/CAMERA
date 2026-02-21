'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Aperture } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { QuickActions } from './QuickActions';
import { TypingIndicator } from './TypingIndicator';
import { Character } from './Character';
import type { ChatMessage as ChatMessageType, CharacterState } from '../types';

interface ChatWindowProps {
  messages: ChatMessageType[];
  isTyping: boolean;
  characterState: CharacterState;
  onSendMessage: (message: string) => void;
  onQuickAction: (actionId: string, label: string) => void;
  onClose: () => void;
  onClear: () => void;
  onInputFocus?: () => void;
  onInputBlur?: () => void;
}

export function ChatWindow({
  messages,
  isTyping,
  characterState,
  onSendMessage,
  onQuickAction,
  onClose,
  onClear,
  onInputFocus,
  onInputBlur,
}: ChatWindowProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const lastMessage = messages[messages.length - 1];
  const showQuickActions = lastMessage?.showQuickActions && !isTyping;

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88, y: 24, originX: 1, originY: 1 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88, y: 24 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className="absolute bottom-20 right-0 w-[360px] max-w-[calc(100vw-1.5rem)] h-[500px] max-h-[72dvh] bg-background border border-border/60 rounded-2xl flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary">
        <div className="flex items-center gap-2.5">
          {/* Character in header */}
          <div className="w-9 h-9 rounded-xl bg-background flex items-center justify-center shrink-0 border border-border/50">
            <Character state={characterState} size={32} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-foreground leading-none">
                კამერა-ასისტენტი
              </h3>
              <Aperture className="w-3 h-3 text-primary" />
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              <p className="text-[10px] text-muted-foreground leading-none">ონლაინ</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-background transition-all duration-150"
            title="გასუფთავება"
            aria-label="ჩატის გასუფთავება"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-background transition-all duration-150"
            aria-label="დახურვა"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-3 scroll-smooth"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'hsl(var(--border)) transparent' }}
      >
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <AnimatePresence>{isTyping && <TypingIndicator />}</AnimatePresence>
        {showQuickActions && <QuickActions onAction={onQuickAction} />}
        <div className="h-1" />
      </div>

      {/* Input */}
      <ChatInput
        onSend={onSendMessage}
        disabled={isTyping}
        onFocus={onInputFocus}
        onBlur={onInputBlur}
      />
    </motion.div>
  );
}
