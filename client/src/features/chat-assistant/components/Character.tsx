'use client';

import * as React from 'react';
import { motion, type Variants } from 'framer-motion';
import type { CharacterState } from '../types';

interface CharacterProps {
  state: CharacterState;
  size?: number;
  className?: string;
}

/**
 * Minimalist dome CCTV camera — clean, instantly recognizable.
 * Half-sphere dome on a flat base, big lens eye that tracks the mouse.
 */
export function Character({ state, size = 48, className }: CharacterProps) {
  const [mouseOffset, setMouseOffset] = React.useState({ x: 0, y: 0 });
  const [irBlink, setIrBlink] = React.useState(true);
  const svgRef = React.useRef<SVGSVGElement>(null);

  // IR LED pulse
  React.useEffect(() => {
    const t = setInterval(() => setIrBlink((v) => !v), 900);
    return () => clearInterval(t);
  }, []);

  // Mouse tracking for lens
  React.useEffect(() => {
    if (state === 'sleeping') return;
    const fn = (e: MouseEvent) => {
      if (!svgRef.current) return;
      const r = svgRef.current.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      const m = 4;
      setMouseOffset({
        x: d > 0 ? (dx / d) * Math.min(d / 50, 1) * m : 0,
        y: d > 0 ? (dy / d) * Math.min(d / 50, 1) * (m * 0.6) : 0,
      });
    };
    window.addEventListener('mousemove', fn);
    return () => window.removeEventListener('mousemove', fn);
  }, [state]);

  const bodyVariants: Variants = {
    idle: {
      rotate: [0, -3, 3, 0],
      transition: { repeat: Infinity, duration: 4.5, ease: 'easeInOut' },
    },
    listening: {
      rotate: [-8, 8],
      transition: { repeat: Infinity, duration: 1, ease: 'easeInOut', repeatType: 'mirror' },
    },
    thinking: {
      rotate: [-6, 6],
      transition: { repeat: Infinity, duration: 0.7, ease: 'easeInOut', repeatType: 'mirror' },
    },
    talking: {
      rotate: [-2, 2],
      transition: { repeat: Infinity, duration: 0.3, ease: 'easeInOut', repeatType: 'mirror' },
    },
    happy: {
      scale: 1.08,
      rotate: [-8, 8],
      transition: { duration: 0.5, ease: 'easeInOut', repeatType: 'mirror', repeat: 2 },
    },
    sleeping: {
      rotate: 15,
      y: 2,
      transition: { duration: 1, ease: 'easeOut' },
    },
    flash: {
      scale: [1, 1.1, 1],
      transition: { duration: 0.25, ease: 'easeOut' },
    },
  };

  const isSleeping = state === 'sleeping';
  const lensX = 50 + (isSleeping ? 0 : mouseOffset.x);
  const lensY = 58 + (isSleeping ? 0 : mouseOffset.y);
  const pupilX = 50 + (isSleeping ? 0 : mouseOffset.x * 0.5);
  const pupilY = 58 + (isSleeping ? 0 : mouseOffset.y * 0.5);

  const irisSize = isSleeping ? 4 : state === 'listening' ? 13 : state === 'happy' ? 12 : 10;
  const pupilSize = isSleeping ? 2 : state === 'happy' ? 6 : 5;

  // Iris color
  const irisColor =
    state === 'happy'
      ? 'hsl(var(--primary))'
      : state === 'flash'
        ? 'hsl(var(--warning))'
        : state === 'listening'
          ? 'hsl(var(--info))'
          : 'hsl(var(--primary)/0.85)';

  return (
    <motion.svg
      ref={svgRef}
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      animate={state}
      variants={bodyVariants}
      style={{ transformOrigin: '50px 40px' }}
    >
      {/* ── BASE PLATE ── */}
      <rect x="20" y="72" width="60" height="8" rx="4" fill="#bcc4d0" stroke="#a0a8b4" strokeWidth="0.8" />
      {/* Screw holes */}
      <circle cx="28" cy="76" r="1.5" fill="#9098a4" />
      <circle cx="72" cy="76" r="1.5" fill="#9098a4" />

      {/* ── DOME BODY — half sphere ── */}
      {/* Main dome shape */}
      <path
        d="M20 72 Q20 30 50 24 Q80 30 80 72 Z"
        fill="#e8ecf0"
        stroke="#c0c8d4"
        strokeWidth="1.2"
      />

      {/* Dome highlight — top gloss */}
      <path
        d="M32 42 Q42 28 58 28 Q64 30 68 38"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity={0.35}
      />

      {/* Dome lower ring / seam */}
      <ellipse cx="50" cy="72" rx="30" ry="4" fill="#d0d6de" stroke="#b8c0cc" strokeWidth="0.6" />

      {/* ── DARK LENS WINDOW (tinted glass) ── */}
      <ellipse
        cx="50" cy="56"
        rx="22" ry="16"
        fill="#1a1e28"
        stroke="#2a3040"
        strokeWidth="1"
        opacity={0.85}
      />

      {/* Lens glass reflection arc */}
      <path
        d="M34 48 Q50 38 66 48"
        fill="none"
        stroke="white"
        strokeWidth="1"
        opacity={0.15}
      />

      {/* ── LENS (the eye) ── */}
      {/* Outer lens ring */}
      <circle cx={lensX} cy={lensY} r="14" fill="#0c1018" stroke="#2a3040" strokeWidth="0.8" />

      {/* Inner lens body */}
      <circle cx={lensX} cy={lensY} r="11" fill="#080c14" />

      {/* Iris — colored ring */}
      <circle cx={lensX} cy={lensY} r={irisSize} fill={irisColor} />

      {/* Pupil */}
      <circle cx={pupilX} cy={pupilY} r={pupilSize} fill="#020406" />

      {/* Lens glare */}
      {!isSleeping && (
        <>
          <ellipse
            cx={lensX - 4}
            cy={lensY - 4}
            rx="3" ry="2"
            fill="white"
            opacity={0.65}
            transform={`rotate(-25, ${lensX - 4}, ${lensY - 4})`}
          />
          <circle cx={lensX + 3} cy={lensY + 4} r="1" fill="white" opacity={0.25} />
        </>
      )}

      {/* ── IR LEDs — two small dots on dark window ── */}
      <circle
        cx="33" cy="52" r="2"
        fill={irBlink && !isSleeping ? '#ff2828' : '#3a0a0a'}
        stroke="#2a0404" strokeWidth="0.3"
      />
      {irBlink && !isSleeping && (
        <circle cx="33" cy="52" r="4" fill="#ff0000" opacity={0.2} />
      )}
      <circle
        cx="67" cy="52" r="2"
        fill={irBlink && !isSleeping ? '#ff2828' : '#3a0a0a'}
        stroke="#2a0404" strokeWidth="0.3"
      />
      {irBlink && !isSleeping && (
        <circle cx="67" cy="52" r="4" fill="#ff0000" opacity={0.2} />
      )}

      {/* ── STATUS LED (recording) ── */}
      <motion.circle
        cx="72" cy="68" r="2"
        fill="hsl(var(--destructive))"
        animate={{ opacity: isSleeping ? 0.15 : [0.3, 1, 0.3] }}
        transition={{ duration: 1, repeat: Infinity }}
      />

      {/* ── FLASH burst ── */}
      {state === 'flash' && (
        <motion.circle
          cx="50" cy="58" r="18"
          fill="none"
          stroke="hsl(var(--warning)/0.5)"
          strokeWidth="3"
          initial={{ scale: 0.7, opacity: 1 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.4 }}
        />
      )}

      {/* ── Thinking dots ── */}
      {state === 'thinking' && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.circle
              key={i}
              cx={82 + i * 5}
              cy={40 - i * 5}
              r={2.5 - i * 0.4}
              fill="hsl(var(--warning)/0.9)"
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.3, 0.8] }}
              transition={{ repeat: Infinity, duration: 0.85, delay: i * 0.15, ease: 'easeInOut' }}
            />
          ))}
        </>
      )}

      {/* ── ZZZ sleeping ── */}
      {isSleeping && (
        <>
          {[0, 1, 2].map((_, i) => (
            <motion.text
              key={i}
              x={72 + i * 6}
              y={30 - i * 7}
              fill="hsl(var(--muted-foreground)/0.6)"
              fontSize={10 - i * 2}
              fontWeight="bold"
              fontFamily="sans-serif"
              animate={{ opacity: [0, 1, 0], y: [30 - i * 7, 22 - i * 7, 14 - i * 7] }}
              transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.4 }}
            >
              z
            </motion.text>
          ))}
        </>
      )}
    </motion.svg>
  );
}
