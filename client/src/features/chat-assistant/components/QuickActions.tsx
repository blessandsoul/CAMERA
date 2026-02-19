'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Camera, Aperture, Package, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { QuickAction } from '../types';

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'cameras', label: 'კამერები', icon: Camera, category: 'cameras' },
  { id: 'lenses', label: 'ობიექტივები', icon: Aperture, category: 'lenses' },
  { id: 'accessories', label: 'აქსესუარები', icon: Package, category: 'accessories' },
  { id: 'support', label: 'დახმარება', icon: HelpCircle, category: 'support' },
];

interface QuickActionsProps {
  onAction: (actionId: string, label: string) => void;
}

export function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="flex flex-wrap gap-2 mt-2"
    >
      {QUICK_ACTIONS.map((action, index) => {
        const Icon = action.icon;
        return (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.08 * index, type: 'spring', stiffness: 300 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction(action.id, action.label)}
              className="text-xs gap-1.5 h-8 transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:border-primary active:scale-95"
            >
              <Icon className="w-3.5 h-3.5" />
              {action.label}
            </Button>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
