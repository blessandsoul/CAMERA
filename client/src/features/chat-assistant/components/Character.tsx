'use client';

import * as React from 'react';
import { motion, type Variants } from 'framer-motion';
import type { CharacterState } from '../types';

interface CharacterProps {
  state: CharacterState;
  size?: number;
  className?: string;
}

export function Character({ state, size = 48, className }: CharacterProps) {
  const [isBlinking, setIsBlinking] = React.useState(false);
  const [mouseOffset, setMouseOffset] = React.useState({ x: 0, y: 0 });
  const [apertureBlades, setApertureBlades] = React.useState(0);
  const svgRef = React.useRef<SVGSVGElement>(null);

  // Blinking as shutter
  React.useEffect(() => {
    if (state === 'idle' || state === 'talking') {
      const interval = setInterval(
        () => {
          setIsBlinking(true);
          setTimeout(() => setIsBlinking(false), 120);
        },
        2500 + Math.random() * 2000
      );
      return () => clearInterval(interval);
    }
  }, [state]);

  // Aperture rotation when thinking
  React.useEffect(() => {
    if (state === 'thinking') {
      const interval = setInterval(() => {
        setApertureBlades((prev) => (prev + 15) % 360);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [state]);

  // Mouse tracking for lens pupil
  React.useEffect(() => {
    if (state === 'sleeping') return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const max = 4;
      const nx = dist > 0 ? (dx / dist) * Math.min(dist / 60, 1) * max : 0;
      const ny = dist > 0 ? (dy / dist) * Math.min(dist / 60, 1) * max : 0;
      setMouseOffset({ x: nx, y: ny });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [state]);

  const bodyVariants: Variants = {
    idle: {
      y: [0, -2, 0],
      transition: { repeat: Infinity, duration: 2.5, ease: 'easeInOut' },
    },
    listening: {
      scale: 1.03,
      transition: { duration: 0.2 },
    },
    thinking: {
      rotate: [-3, 3, -3],
      transition: { repeat: Infinity, duration: 0.6, ease: 'easeInOut' },
    },
    talking: {
      y: [0, -3, 0, -1, 0],
      transition: { repeat: Infinity, duration: 0.5 },
    },
    happy: {
      y: -6,
      scale: 1.08,
      transition: { type: 'spring', stiffness: 400, damping: 15 },
    },
    sleeping: {
      y: [0, 3, 0],
      rotate: [0, 5, 0],
      transition: { repeat: Infinity, duration: 3.5, ease: 'easeInOut' },
    },
    flash: {
      scale: [1, 1.15, 1],
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  const isSleeping = state === 'sleeping';
  const lensRadius = isBlinking ? 2 : state === 'listening' ? 17 : state === 'happy' ? 18 : 15;
  const pupilRadius = isSleeping ? 0 : state === 'happy' ? 10 : state === 'listening' ? 11 : 8;

  // Aperture blade count
  const bladeCount = 8;
  const bladeAngles = Array.from({ length: bladeCount }, (_, i) => i * (360 / bladeCount) + apertureBlades);

  return (
    <motion.svg
      ref={svgRef}
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      animate={state}
      variants={bodyVariants}
    >
      {/* Drop shadow */}
      <ellipse cx="50" cy="93" rx="26" ry="4" fill="hsl(var(--foreground)/0.12)" />

      {/* Camera body — main rectangle */}
      <motion.rect
        x="12" y="30" width="76" height="52" rx="8" ry="8"
        fill="hsl(var(--foreground))"
        stroke="hsl(var(--border))"
        strokeWidth="0"
      />

      {/* Body detail — front face plate */}
      <rect x="15" y="33" width="70" height="46" rx="6" fill="hsl(var(--foreground)/0.9)" />

      {/* Top grip / pentaprism hump */}
      <motion.rect
        x="26" y="20" width="36" height="14" rx="5"
        fill="hsl(var(--foreground))"
      />

      {/* Hot shoe (top accessory rail) */}
      <rect x="38" y="17" width="16" height="4" rx="2" fill="hsl(var(--foreground)/0.6)" />

      {/* Shutter button */}
      <motion.circle
        cx="58" cy="23" r="4"
        fill="hsl(var(--primary))"
        animate={
          state === 'flash'
            ? { scale: [1, 1.4, 1], fill: ['hsl(var(--primary))', 'hsl(var(--warning))', 'hsl(var(--primary))'] }
            : { scale: 1 }
        }
        transition={{ duration: 0.3 }}
      />

      {/* Mode dial */}
      <circle cx="40" cy="22" r="5" fill="hsl(var(--foreground)/0.7)" stroke="hsl(var(--border)/0.3)" strokeWidth="1" />
      <line x1="40" y1="18" x2="40" y2="20" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" />

      {/* Grip texture ridges (left side) */}
      {[0, 1, 2].map((i) => (
        <rect key={i} x="14" y={38 + i * 7} width="5" height="4" rx="1.5" fill="hsl(var(--foreground)/0.5)" />
      ))}

      {/* ---- LENS BARREL ---- */}
      {/* Outer lens ring */}
      <motion.circle
        cx="50" cy="57" r="26"
        fill="hsl(var(--foreground)/0.6)"
        stroke="hsl(var(--foreground)/0.4)"
        strokeWidth="1.5"
      />

      {/* Lens focus ring (rotating) */}
      <motion.circle
        cx="50" cy="57" r="22"
        fill="none"
        stroke="hsl(var(--foreground)/0.35)"
        strokeWidth="3"
        strokeDasharray="4 3"
        animate={{ rotate: state === 'thinking' ? 360 : 0 }}
        transition={{ duration: 2, repeat: state === 'thinking' ? Infinity : 0, ease: 'linear' }}
        style={{ originX: '50px', originY: '57px', transformOrigin: '50px 57px' }}
      />

      {/* Inner lens body */}
      <circle cx="50" cy="57" r="18" fill="hsl(222.2 84% 8%)" />

      {/* Aperture blades (visible when thinking) */}
      {state === 'thinking' &&
        bladeAngles.map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const bx = 50 + Math.cos(rad) * 10;
          const by = 57 + Math.sin(rad) * 10;
          return (
            <ellipse
              key={i}
              cx={bx}
              cy={by}
              rx="5"
              ry="2"
              fill="hsl(var(--foreground)/0.5)"
              transform={`rotate(${angle}, ${bx}, ${by})`}
            />
          );
        })}

      {/* Glass reflection layers */}
      <circle cx="50" cy="57" r="14" fill="hsl(210 60% 12%)" />
      <circle cx="50" cy="57" r="11" fill="hsl(215 70% 8%)" />

      {/* --- IRIS / PUPIL --- */}
      {/* Iris */}
      <motion.circle
        cx="50"
        cy="57"
        r={lensRadius}
        fill={
          state === 'happy'
            ? 'hsl(var(--primary))'
            : state === 'flash'
              ? 'hsl(var(--warning))'
              : state === 'listening'
                ? 'hsl(var(--info))'
                : 'hsl(var(--primary)/0.8)'
        }
        animate={{ r: lensRadius }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      />

      {/* Pupil */}
      <motion.circle
        cx={50 + (isSleeping ? 0 : mouseOffset.x)}
        cy={57 + (isSleeping ? 0 : mouseOffset.y)}
        r={pupilRadius}
        fill="hsl(222.2 84% 4%)"
        animate={{ r: pupilRadius }}
        transition={{ duration: 0.1 }}
      />

      {/* Lens glare highlight */}
      {!isSleeping && (
        <>
          <ellipse
            cx={44 + mouseOffset.x * 0.3}
            cy={51 + mouseOffset.y * 0.3}
            rx="3.5"
            ry="2.5"
            fill="white"
            opacity={0.7}
            transform={`rotate(-20, ${44 + mouseOffset.x * 0.3}, ${51 + mouseOffset.y * 0.3})`}
          />
          <circle
            cx={55 + mouseOffset.x * 0.2}
            cy={63 + mouseOffset.y * 0.2}
            r="1"
            fill="white"
            opacity={0.35}
          />
        </>
      )}

      {/* Shutter blink overlay */}
      {isBlinking && (
        <motion.rect
          x="24" y="43"
          width="52" height="28"
          rx="14"
          fill="hsl(var(--foreground))"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ duration: 0.12, ease: 'easeInOut' }}
          style={{ transformOrigin: '50px 57px' }}
        />
      )}

      {/* Flash unit (top right) */}
      <motion.rect
        x="68" y="25" width="12" height="8" rx="2"
        fill={state === 'flash' ? 'hsl(var(--warning))' : 'hsl(var(--foreground)/0.5)'}
        animate={
          state === 'flash'
            ? { opacity: [0, 1, 0.8, 1, 0], fill: ['hsl(var(--warning))', 'white', 'hsl(var(--warning))'] }
            : { opacity: 1 }
        }
        transition={{ duration: 0.4 }}
      />
      {/* Flash glow */}
      {state === 'flash' && (
        <motion.circle
          cx="74" cy="29" r="10"
          fill="hsl(var(--warning)/0.4)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.5, 0], opacity: [0, 0.8, 0] }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* Viewfinder (small square top-right of body) */}
      <rect x="70" y="36" width="10" height="7" rx="2" fill="hsl(var(--foreground)/0.4)" />
      <rect x="71" y="37" width="8" height="5" rx="1" fill="hsl(210 60% 15%)" />

      {/* Happy mouth — curved bottom of lens */}
      {(state === 'happy' || state === 'talking') && (
        <motion.path
          d="M40 72 Q50 79 60 72"
          fill="none"
          stroke="hsl(var(--primary-foreground)/0.6)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.35 }}
        />
      )}

      {/* Thinking dots */}
      {state === 'thinking' && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.circle
              key={i}
              cx={78 + i * 6}
              cy={28 - i * 4}
              r={3 - i * 0.5}
              fill="hsl(var(--primary)/0.7)"
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
              transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
            />
          ))}
        </>
      )}

      {/* Sleeping ZZZ */}
      {isSleeping && (
        <>
          {['z', 'z', 'z'].map((char, i) => (
            <motion.text
              key={i}
              x={72 + i * 6}
              y={28 - i * 6}
              fill="hsl(var(--primary)/0.6)"
              fontSize={10 - i * 2}
              fontWeight="bold"
              fontFamily="sans-serif"
              animate={{
                opacity: [0, 1, 0],
                y: [28 - i * 6, 22 - i * 6, 16 - i * 6],
              }}
              transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.4 }}
            >
              {char}
            </motion.text>
          ))}
        </>
      )}

      {/* AF points (listening) */}
      {state === 'listening' && (
        <>
          {[
            { x: 35, y: 45 },
            { x: 65, y: 45 },
            { x: 35, y: 69 },
            { x: 65, y: 69 },
          ].map((pt, i) => (
            <motion.rect
              key={i}
              x={pt.x - 4}
              y={pt.y - 4}
              width="8"
              height="8"
              rx="1"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="1.5"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
            />
          ))}
        </>
      )}
    </motion.svg>
  );
}
