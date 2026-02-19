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
  const [scanAngle, setScanAngle] = React.useState(0);
  const [mouseOffset, setMouseOffset] = React.useState({ x: 0, y: 0 });
  const svgRef = React.useRef<SVGSVGElement>(null);

  // IR LED blink
  React.useEffect(() => {
    if (state === 'idle' || state === 'talking') {
      const interval = setInterval(
        () => {
          setIsBlinking(true);
          setTimeout(() => setIsBlinking(false), 80);
        },
        3000 + Math.random() * 2000
      );
      return () => clearInterval(interval);
    }
  }, [state]);

  // Scan beam rotation when thinking
  React.useEffect(() => {
    if (state === 'thinking' || state === 'listening') {
      const interval = setInterval(() => {
        setScanAngle((prev) => (prev + 3) % 360);
      }, 30);
      return () => clearInterval(interval);
    }
  }, [state]);

  // Mouse tracking — lens follows cursor
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
      const max = 5;
      const nx = dist > 0 ? (dx / dist) * Math.min(dist / 50, 1) * max : 0;
      const ny = dist > 0 ? (dy / dist) * Math.min(dist / 50, 1) * max : 0;
      setMouseOffset({ x: nx, y: ny });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [state]);

  // Body sway variants — camera on bracket rotates/pans
  const bodyVariants: Variants = {
    idle: {
      rotate: [0, -4, 4, 0],
      transition: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
    },
    listening: {
      rotate: [-8, 8],
      transition: { repeat: Infinity, duration: 1.2, ease: 'easeInOut', repeatType: 'mirror' },
    },
    thinking: {
      rotate: [-12, 12],
      transition: { repeat: Infinity, duration: 0.9, ease: 'easeInOut', repeatType: 'mirror' },
    },
    talking: {
      y: [0, -2, 0],
      transition: { repeat: Infinity, duration: 0.4 },
    },
    happy: {
      rotate: [0, -10, 10, -6, 0],
      scale: 1.08,
      transition: { duration: 0.6, type: 'spring', stiffness: 300 },
    },
    sleeping: {
      rotate: 25,
      y: 4,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
    flash: {
      scale: [1, 1.12, 1],
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  const isSleeping = state === 'sleeping';

  // Lens iris size
  const irisR = isBlinking ? 1 : state === 'happy' ? 11 : state === 'listening' ? 12 : 9;
  const pupilR = isSleeping ? 0 : state === 'happy' ? 6 : 5;

  // Scan beam tip
  const scanRad = (scanAngle * Math.PI) / 180;
  const beamLen = 18;
  const bx = 50 + Math.cos(scanRad) * beamLen;
  const by = 50 + Math.sin(scanRad) * beamLen;

  return (
    <motion.svg
      ref={svgRef}
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      animate={state}
      variants={bodyVariants}
      style={{ transformOrigin: '50px 18px' }} // rotate from mount point
    >
      {/* ── MOUNT / BRACKET ── */}
      {/* Wall plate */}
      <rect x="38" y="6" width="24" height="8" rx="3" fill="hsl(var(--muted-foreground)/0.25)" />
      {/* Bracket arm */}
      <rect x="48" y="13" width="4" height="14" rx="2" fill="hsl(var(--muted-foreground)/0.3)" />
      {/* Pivot joint */}
      <circle cx="50" cy="27" r="4" fill="hsl(var(--secondary-foreground)/0.4)" />
      <circle cx="50" cy="27" r="2" fill="hsl(var(--muted-foreground)/0.5)" />

      {/* ── CAMERA HOUSING ── */}
      {/* Main dome / bullet body */}
      <motion.ellipse
        cx="50" cy="58"
        rx="28" ry="18"
        fill="hsl(var(--secondary))"
        stroke="hsl(var(--border))"
        strokeWidth="1.5"
      />
      {/* Bottom shade visor */}
      <ellipse cx="50" cy="68" rx="28" ry="6" fill="hsl(var(--muted-foreground)/0.12)" />
      {/* Housing highlight */}
      <ellipse cx="42" cy="50" rx="10" ry="5" fill="white" opacity={0.18} transform="rotate(-20, 42, 50)" />

      {/* ── LENS ASSEMBLY ── */}
      {/* Outer lens bezel */}
      <circle cx="50" cy="58" r="17" fill="hsl(var(--foreground)/0.12)" stroke="hsl(var(--border))" strokeWidth="1" />
      {/* Lens ring detail */}
      <circle cx="50" cy="58" r="14" fill="hsl(var(--foreground)/0.08)" stroke="hsl(var(--muted-foreground)/0.3)" strokeWidth="0.8" strokeDasharray="2 2" />
      {/* Glass inner */}
      <circle cx="50" cy="58" r="11" fill="hsl(215 40% 12%)" />
      <circle cx="50" cy="58" r="9" fill="hsl(215 50% 9%)" />

      {/* Scan / detection beam (thinking + listening) */}
      {(state === 'thinking' || state === 'listening') && (
        <motion.line
          x1="50" y1="58"
          x2={bx} y2={by}
          stroke={state === 'listening' ? 'hsl(var(--primary)/0.7)' : 'hsl(var(--warning)/0.6)'}
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        />
      )}

      {/* ── IRIS ── */}
      <motion.circle
        cx={50 + (isSleeping ? 0 : mouseOffset.x)}
        cy={58 + (isSleeping ? 0 : mouseOffset.y)}
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
        transition={{ duration: 0.12, ease: 'easeOut' }}
      />

      {/* Pupil */}
      <motion.circle
        cx={50 + (isSleeping ? 0 : mouseOffset.x * 0.6)}
        cy={58 + (isSleeping ? 0 : mouseOffset.y * 0.6)}
        r={pupilR}
        fill="hsl(222.2 84% 4%)"
        animate={{ r: pupilR }}
        transition={{ duration: 0.1 }}
      />

      {/* Lens glare */}
      {!isSleeping && (
        <>
          <ellipse
            cx={44 + mouseOffset.x * 0.25}
            cy={52 + mouseOffset.y * 0.25}
            rx="3" ry="2"
            fill="white" opacity={0.65}
            transform={`rotate(-25, ${44 + mouseOffset.x * 0.25}, ${52 + mouseOffset.y * 0.25})`}
          />
          <circle cx={55 + mouseOffset.x * 0.15} cy={63 + mouseOffset.y * 0.15} r="1" fill="white" opacity={0.3} />
        </>
      )}

      {/* IR blink overlay */}
      {isBlinking && (
        <motion.circle
          cx="50" cy="58" r="11"
          fill="hsl(var(--foreground)/0.85)"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.08 }}
        />
      )}

      {/* ── IR LED dots (4 corners of lens) ── */}
      {[
        { cx: 36, cy: 45 },
        { cx: 64, cy: 45 },
        { cx: 36, cy: 71 },
        { cx: 64, cy: 71 },
      ].map((dot, i) => (
        <motion.circle
          key={i}
          cx={dot.cx} cy={dot.cy} r="2"
          fill={state === 'flash' ? 'hsl(var(--warning))' : 'hsl(var(--destructive)/0.8)'}
          animate={{
            opacity: state === 'sleeping'
              ? [0.1, 0.2, 0.1]
              : state === 'flash'
                ? [0, 1, 0]
                : [0.5, 1, 0.5],
            scale: state === 'flash' ? [1, 1.6, 1] : 1,
          }}
          transition={{ duration: state === 'flash' ? 0.3 : 1.5, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}

      {/* Recording dot (top right housing) */}
      <motion.circle
        cx="71" cy="46" r="2.5"
        fill="hsl(var(--destructive))"
        animate={{ opacity: isSleeping ? 0.15 : [0.4, 1, 0.4] }}
        transition={{ duration: 1, repeat: Infinity }}
      />

      {/* Connector cable bump (back) */}
      <rect x="46" y="73" width="8" height="5" rx="2" fill="hsl(var(--muted-foreground)/0.25)" />

      {/* ── Happy expression: scan sweep arc ── */}
      {(state === 'happy' || state === 'talking') && (
        <motion.path
          d="M36 76 Q50 84 64 76"
          fill="none"
          stroke="hsl(var(--primary)/0.5)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* ── Thinking: orbiting dots ── */}
      {state === 'thinking' && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.circle
              key={i}
              cx={80 + i * 5}
              cy={30 - i * 5}
              r={3 - i * 0.6}
              fill="hsl(var(--warning)/0.8)"
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.3, 0.8] }}
              transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.18 }}
            />
          ))}
        </>
      )}

      {/* Flash burst */}
      {state === 'flash' && (
        <motion.circle
          cx="50" cy="58" r="22"
          fill="none"
          stroke="hsl(var(--warning)/0.5)"
          strokeWidth="3"
          initial={{ scale: 0.6, opacity: 0.8 }}
          animate={{ scale: 1.4, opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* ── Sleeping ZZZ ── */}
      {isSleeping && (
        <>
          {[0, 1, 2].map((_, i) => (
            <motion.text
              key={i}
              x={72 + i * 6}
              y={28 - i * 7}
              fill="hsl(var(--muted-foreground)/0.7)"
              fontSize={10 - i * 2}
              fontWeight="bold"
              fontFamily="sans-serif"
              animate={{
                opacity: [0, 1, 0],
                y: [28 - i * 7, 20 - i * 7, 12 - i * 7],
              }}
              transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.45 }}
            >
              z
            </motion.text>
          ))}
        </>
      )}

      {/* Drop shadow */}
      <ellipse cx="50" cy="94" rx="22" ry="3.5" fill="hsl(var(--foreground)/0.08)" />
    </motion.svg>
  );
}
