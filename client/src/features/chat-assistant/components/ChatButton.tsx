'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Character } from './Character';
import type { CharacterState } from '../types';

interface ChatButtonProps {
  onClick: () => void;
  characterState: CharacterState;
  onWakeUp?: () => void;
}

export function ChatButton({ onClick, characterState, onWakeUp }: ChatButtonProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const isSleeping = characterState === 'sleeping';

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (isSleeping && onWakeUp) onWakeUp();
  };

  const displayState: CharacterState = isSleeping
    ? 'sleeping'
    : isHovered
      ? 'listening'
      : characterState;

  return (
    <div className="relative">
      {/* Tooltip */}
      <motion.div
        className="absolute -top-12 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg pointer-events-none"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 6 }}
        transition={{ duration: 0.18 }}
      >
        {isSleeping ? 'გაღვიძება! 📷' : 'კამერა-ასისტენტი'}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45" />
      </motion.div>

      <motion.button
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-16 h-16 rounded-2xl bg-foreground shadow-lg hover:shadow-xl transition-shadow cursor-pointer flex items-center justify-center border border-border/20 overflow-visible"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        initial={{ opacity: 0, scale: 0, rotate: -15 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        aria-label="კამერა-ასისტენტი"
      >
        {/* Pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-primary"
          animate={
            isSleeping
              ? { scale: [1, 1.06, 1], opacity: [0.15, 0.22, 0.15] }
              : isHovered
                ? { scale: [1, 1.18, 1], opacity: [0.4, 0, 0.4] }
                : { scale: [1, 1.12, 1], opacity: [0.3, 0, 0.3] }
          }
          transition={{ duration: isSleeping ? 3 : 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        <Character state={displayState} size={56} />
      </motion.button>
    </div>
  );
}
