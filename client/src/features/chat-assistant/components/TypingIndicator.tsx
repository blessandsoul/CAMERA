'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Character } from './Character';

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex gap-2 items-center"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
        <Character state="thinking" size={28} />
      </div>

      <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-md flex gap-1 items-center">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-muted-foreground/50 rounded-full"
            animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.14 }}
          />
        ))}
      </div>
    </motion.div>
  );
}
