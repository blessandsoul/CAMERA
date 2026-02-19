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
 * CCTV Bullet Camera — horizontal cylinder on L-bracket,
 * classic surveillance camera shape (like Hikvision/Dahua).
 * Rotates left/right from the bracket pivot.
 */
export function Character({ state, size = 48, className }: CharacterProps) {
  const [mouseOffset, setMouseOffset] = React.useState({ x: 0, y: 0 });
  const [irBlink, setIrBlink] = React.useState(true);
  const svgRef = React.useRef<SVGSVGElement>(null);

  // IR LED pulse
  React.useEffect(() => {
    const t = setInterval(() => setIrBlink((v) => !v), 800);
    return () => clearInterval(t);
  }, []);

  // Mouse tracking for iris
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
      const m = 3;
      setMouseOffset({
        x: d > 0 ? (dx / d) * Math.min(d / 60, 1) * m : 0,
        y: d > 0 ? (dy / d) * Math.min(d / 60, 1) * m : 0,
      });
    };
    window.addEventListener('mousemove', fn);
    return () => window.removeEventListener('mousemove', fn);
  }, [state]);

  const bodyVariants: Variants = {
    idle: {
      rotate: [0, -4, 4, 0],
      transition: { repeat: Infinity, duration: 5, ease: 'easeInOut' },
    },
    listening: {
      rotate: [-12, 12],
      transition: { repeat: Infinity, duration: 1.2, ease: 'easeInOut', repeatType: 'mirror' },
    },
    thinking: {
      rotate: [-8, 8],
      transition: { repeat: Infinity, duration: 0.8, ease: 'easeInOut', repeatType: 'mirror' },
    },
    talking: {
      rotate: [0, -3, 3, 0],
      transition: { repeat: Infinity, duration: 0.4 },
    },
    happy: {
      rotate: [0, -10, 10, -5, 0],
      scale: 1.06,
      transition: { duration: 0.6, type: 'spring', stiffness: 300 },
    },
    sleeping: {
      rotate: 20,
      y: 3,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
    flash: {
      scale: [1, 1.08, 1],
      transition: { duration: 0.25 },
    },
  };

  const isSleeping = state === 'sleeping';
  const irisR = isSleeping ? 2 : state === 'listening' ? 8 : state === 'happy' ? 7.5 : 6.5;
  const pupilR = isSleeping ? 1 : state === 'happy' ? 4 : 3.5;

  return (
    <motion.svg
      ref={svgRef}
      viewBox="0 0 120 90"
      width={size}
      height={size * (90 / 120)}
      className={className}
      animate={state}
      variants={bodyVariants}
      style={{ transformOrigin: '60px 10px' }}
    >
      {/* ── WALL MOUNT BRACKET ── */}
      {/* Ceiling/wall plate */}
      <rect x="48" y="2" width="24" height="6" rx="2" fill="#c0c8d0" stroke="#a0a8b0" strokeWidth="0.8" />
      <circle cx="55" cy="5" r="1.2" fill="#909aa4" />
      <circle cx="65" cy="5" r="1.2" fill="#909aa4" />

      {/* Vertical arm */}
      <rect x="56" y="7" width="8" height="18" rx="2" fill="#b0b8c4" stroke="#9098a4" strokeWidth="0.6" />

      {/* Pivot joint */}
      <circle cx="60" cy="26" r="5" fill="#b8c0cc" stroke="#8890a0" strokeWidth="1" />
      <circle cx="60" cy="26" r="2.5" fill="#a0a8b4" />

      {/* ── CAMERA BODY — horizontal cylinder ── */}
      {/* Main barrel — rounded rectangle (horizontal) */}
      <rect x="22" y="32" width="76" height="32" rx="16" ry="16"
        fill="#e4e8ec" stroke="#bcc4d0" strokeWidth="1"
      />

      {/* Barrel highlight (top surface) */}
      <rect x="30" y="33" width="60" height="8" rx="4"
        fill="white" opacity={0.2}
      />

      {/* Barrel bottom shadow */}
      <rect x="30" y="54" width="60" height="6" rx="3"
        fill="#a0a8b4" opacity={0.15}
      />

      {/* Side seam line */}
      <line x1="38" y1="34" x2="38" y2="62" stroke="#c0c8d4" strokeWidth="0.6" />

      {/* Sun shield / visor over lens end */}
      <path d="M16 30 Q14 48 16 64 L26 60 L26 34 Z"
        fill="#d0d6de" stroke="#b0b8c4" strokeWidth="0.8"
      />

      {/* ── LENS FRONT FACE ── */}
      {/* Lens bezel ring */}
      <circle cx="26" cy="48" r="14" fill="#6e7888" stroke="#5a6270" strokeWidth="1" />

      {/* Lens body */}
      <circle cx="26" cy="48" r="12" fill="#1a1e28" />

      {/* Lens glass layers */}
      <circle cx="26" cy="48" r="10" fill="#0c1018" />
      <circle cx="26" cy="48" r="8.5" fill="#080c14"
        stroke="#1a2030" strokeWidth="0.5"
      />

      {/* ── IRIS (eye-like) ── */}
      <motion.circle
        cx={26 + (isSleeping ? 0 : mouseOffset.x)}
        cy={48 + (isSleeping ? 0 : mouseOffset.y)}
        r={irisR}
        fill={
          state === 'happy'
            ? 'hsl(var(--primary))'
            : state === 'flash'
              ? 'hsl(var(--warning))'
              : state === 'listening'
                ? 'hsl(var(--info))'
                : 'hsl(var(--primary)/0.85)'
        }
        animate={{ r: irisR }}
        transition={{ duration: 0.12 }}
      />

      {/* Pupil */}
      <motion.circle
        cx={26 + (isSleeping ? 0 : mouseOffset.x * 0.5)}
        cy={48 + (isSleeping ? 0 : mouseOffset.y * 0.5)}
        r={pupilR}
        fill="#020406"
        animate={{ r: pupilR }}
        transition={{ duration: 0.1 }}
      />

      {/* Lens glare */}
      {!isSleeping && (
        <>
          <ellipse
            cx={21 + mouseOffset.x * 0.2}
            cy={43 + mouseOffset.y * 0.2}
            rx="2.5" ry="1.8"
            fill="white" opacity={0.7}
            transform={`rotate(-30, ${21 + mouseOffset.x * 0.2}, ${43 + mouseOffset.y * 0.2})`}
          />
          <circle
            cx={30 + mouseOffset.x * 0.1}
            cy={53 + mouseOffset.y * 0.1}
            r="0.8" fill="white" opacity={0.3}
          />
        </>
      )}

      {/* ── IR LEDs (around lens) ── */}
      {[
        { cx: 16, cy: 40 },
        { cx: 16, cy: 56 },
        { cx: 36, cy: 40 },
        { cx: 36, cy: 56 },
      ].map((dot, i) => (
        <g key={i}>
          {irBlink && !isSleeping && (
            <circle cx={dot.cx} cy={dot.cy} r="3.5" fill="#ff0000" opacity={0.2} />
          )}
          <circle
            cx={dot.cx} cy={dot.cy} r="1.8"
            fill={irBlink && !isSleeping ? '#ff2828' : '#4a0a0a'}
            stroke="#2a0404" strokeWidth="0.4"
          />
          {irBlink && !isSleeping && (
            <circle cx={dot.cx - 0.4} cy={dot.cy - 0.4} r="0.5" fill="white" opacity={0.5} />
          )}
        </g>
      ))}

      {/* ── STATUS LED (back end) ── */}
      <motion.circle
        cx="92" cy="44" r="2"
        fill="hsl(var(--destructive))"
        animate={{ opacity: isSleeping ? 0.1 : [0.3, 1, 0.3] }}
        transition={{ duration: 1, repeat: Infinity }}
      />

      {/* ── CABLE (rear) ── */}
      <path d="M96 48 Q104 48 106 52 Q108 56 110 56"
        fill="none" stroke="#808890" strokeWidth="2" strokeLinecap="round"
      />

      {/* ── Thinking dots ── */}
      {state === 'thinking' && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.circle
              key={i}
              cx={6 - i * 4}
              cy={38 - i * 4}
              r={2.5 - i * 0.4}
              fill="hsl(var(--warning)/0.9)"
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.3, 0.8] }}
              transition={{ repeat: Infinity, duration: 0.85, delay: i * 0.15 }}
            />
          ))}
        </>
      )}

      {/* ── Flash burst ── */}
      {state === 'flash' && (
        <motion.circle
          cx="26" cy="48" r="16"
          fill="none"
          stroke="hsl(var(--warning)/0.6)"
          strokeWidth="2.5"
          initial={{ scale: 0.8, opacity: 1 }}
          animate={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 0.4 }}
        />
      )}

      {/* ── ZZZ sleeping ── */}
      {isSleeping && (
        <>
          {[0, 1, 2].map((_, i) => (
            <motion.text
              key={i}
              x={8 + i * 5}
              y={28 - i * 6}
              fill="hsl(var(--muted-foreground)/0.6)"
              fontSize={9 - i * 2}
              fontWeight="bold"
              fontFamily="sans-serif"
              animate={{ opacity: [0, 1, 0], y: [28 - i * 6, 20 - i * 6, 12 - i * 6] }}
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
