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
        className="absolute -top-12 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-md border border-border pointer-events-none"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 6 }}
        transition={{ duration: 0.18 }}
      >
        {isSleeping ? 'გაღვიძება! 📷' : 'გხედავ!'}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-secondary border-r border-b border-border rotate-45" />
      </motion.div>

      <motion.button
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-18 h-18 rounded-full bg-transparent cursor-pointer flex items-center justify-center overflow-visible"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        initial={{ opacity: 0, scale: 0, rotate: -15 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        aria-label="კამერა-ასისტენტი"
      >
        {/* Pulse ring — subtle glow under camera */}
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-3 rounded-full bg-primary/20 blur-md"
          animate={
            isSleeping
              ? { opacity: [0.1, 0.18, 0.1], scaleX: [1, 1.1, 1] }
              : isHovered
                ? { opacity: [0.4, 0.7, 0.4], scaleX: [1, 1.3, 1] }
                : { opacity: [0.2, 0.35, 0.2], scaleX: [1, 1.15, 1] }
          }
          transition={{ duration: isSleeping ? 3 : 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        <Character state={displayState} size={68} />
      </motion.button>
    </div>
  );
}
