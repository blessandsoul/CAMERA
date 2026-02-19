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
  const [mouseOffset, setMouseOffset] = React.useState({ x: 0, y: 0 });
  const [irOn, setIrOn] = React.useState(true);
  const [scanAngle, setScanAngle] = React.useState(-30);
  const svgRef = React.useRef<SVGSVGElement>(null);

  // IR LED slow pulse
  React.useEffect(() => {
    const t = setInterval(() => setIrOn((v) => !v), 900);
    return () => clearInterval(t);
  }, []);

  // Scan beam for thinking/listening
  React.useEffect(() => {
    if (state !== 'thinking' && state !== 'listening') return;
    let dir = 1;
    let angle = scanAngle;
    const t = setInterval(() => {
      angle += dir * 2.5;
      if (angle > 30) dir = -1;
      if (angle < -30) dir = 1;
      setScanAngle(angle);
    }, 20);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Mouse tracking
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
      const m = 4.5;
      setMouseOffset({
        x: d > 0 ? (dx / d) * Math.min(d / 55, 1) * m : 0,
        y: d > 0 ? (dy / d) * Math.min(d / 55, 1) * m : 0,
      });
    };
    window.addEventListener('mousemove', fn);
    return () => window.removeEventListener('mousemove', fn);
  }, [state]);

  // Whole-body variants — camera pans from its pivot
  const bodyVariants: Variants = {
    idle: {
      rotate: [0, -6, 6, -3, 0],
      transition: { repeat: Infinity, duration: 5, ease: 'easeInOut' },
    },
    listening: {
      rotate: [-14, 14],
      transition: { repeat: Infinity, duration: 1.1, ease: 'easeInOut', repeatType: 'mirror' },
    },
    thinking: {
      rotate: [-10, 10],
      transition: { repeat: Infinity, duration: 0.85, ease: 'easeInOut', repeatType: 'mirror' },
    },
    talking: {
      y: [0, -2.5, 0],
      transition: { repeat: Infinity, duration: 0.38 },
    },
    happy: {
      rotate: [0, -12, 12, -6, 0],
      scale: 1.07,
      transition: { duration: 0.7, type: 'spring', stiffness: 280 },
    },
    sleeping: {
      rotate: 28,
      y: 5,
      transition: { duration: 1, ease: 'easeOut' },
    },
    flash: {
      scale: [1, 1.1, 1],
      transition: { duration: 0.25 },
    },
  };

  const isSleeping = state === 'sleeping';

  // Iris size
  const irisR = isSleeping ? 3 : state === 'happy' ? 10 : state === 'listening' ? 11 : 8.5;
  const pupilR = isSleeping ? 1.5 : state === 'happy' ? 5.5 : 4.5;

  // Scan beam endpoint (relative to lens center 50,62)
  const beamRad = (scanAngle * Math.PI) / 180;
  const beamLen = 14;
  const beamX = 50 + Math.cos(beamRad) * beamLen;
  const beamY = 62 + Math.sin(beamRad) * beamLen;

  return (
    <motion.svg
      ref={svgRef}
      viewBox="0 0 100 110"
      width={size}
      height={size}
      className={className}
      animate={state}
      variants={bodyVariants}
      style={{ transformOrigin: '50px 16px' }}
    >
      <defs>
        {/* Lens glass gradient */}
        <radialGradient id="lensGrad" cx="38%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#1a2744" />
          <stop offset="60%" stopColor="#0a0f1e" />
          <stop offset="100%" stopColor="#060a14" />
        </radialGradient>
        {/* Housing gradient */}
        <linearGradient id="housingGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8ecf0" />
          <stop offset="100%" stopColor="#c8cfd8" />
        </linearGradient>
        {/* Housing dark variant */}
        <linearGradient id="housingDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d0d6de" />
          <stop offset="100%" stopColor="#b0b8c4" />
        </linearGradient>
        {/* Scan glow */}
        <radialGradient id="scanGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </radialGradient>
        {/* IR glow */}
        <radialGradient id="irGlow">
          <stop offset="0%" stopColor="#ff2222" stopOpacity="1" />
          <stop offset="100%" stopColor="#ff0000" stopOpacity="0" />
        </radialGradient>
        {/* Drop shadow filter */}
        <filter id="dropshadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#00000030" />
        </filter>
        {/* Iris glow */}
        <filter id="irisGlow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ══ WALL MOUNT PLATE ══ */}
      <rect x="36" y="5" width="28" height="9" rx="3.5" fill="url(#housingDark)" stroke="#a0a8b4" strokeWidth="0.8" filter="url(#dropshadow)" />
      {/* Mount screw holes */}
      <circle cx="41" cy="9.5" r="1.5" fill="#888fa0" />
      <circle cx="59" cy="9.5" r="1.5" fill="#888fa0" />

      {/* ══ BRACKET ARM ══ */}
      {/* Vertical stem */}
      <rect x="46.5" y="13" width="7" height="16" rx="3" fill="url(#housingDark)" stroke="#9aa0ae" strokeWidth="0.6" />
      {/* Tilt joint disk */}
      <circle cx="50" cy="29" r="6" fill="url(#housingDark)" stroke="#8890a0" strokeWidth="1" filter="url(#dropshadow)" />
      <circle cx="50" cy="29" r="3.5" fill="#b0b8c6" />
      <circle cx="50" cy="29" r="1.5" fill="#8890a0" />

      {/* ══ MAIN CAMERA HOUSING (bullet/dome shape) ══ */}
      {/* Outer shell */}
      <ellipse cx="50" cy="64" rx="30" ry="20" fill="url(#housingGrad)" stroke="#b8c0cc" strokeWidth="1.2" filter="url(#dropshadow)" />

      {/* Housing bottom shade */}
      <ellipse cx="50" cy="76" rx="30" ry="7" fill="#c0c8d4" opacity={0.6} />

      {/* Panel seam lines */}
      <line x1="22" y1="64" x2="78" y2="64" stroke="#b0b8c4" strokeWidth="0.5" strokeDasharray="2 2" opacity={0.5} />

      {/* Top highlight stripe */}
      <ellipse cx="50" cy="52" rx="20" ry="5" fill="white" opacity={0.25} />

      {/* Side screws */}
      <circle cx="26" cy="64" r="2.2" fill="#c0c8d4" stroke="#a8b0bc" strokeWidth="0.6" />
      <line x1="24.5" y1="64" x2="27.5" y2="64" stroke="#9098a8" strokeWidth="0.7" />
      <line x1="26" y1="62.5" x2="26" y2="65.5" stroke="#9098a8" strokeWidth="0.7" />
      <circle cx="74" cy="64" r="2.2" fill="#c0c8d4" stroke="#a8b0bc" strokeWidth="0.6" />
      <line x1="72.5" y1="64" x2="75.5" y2="64" stroke="#9098a8" strokeWidth="0.7" />
      <line x1="74" y1="62.5" x2="74" y2="65.5" stroke="#9098a8" strokeWidth="0.7" />

      {/* ══ LENS BEZEL / SURROUND ══ */}
      {/* Outer bezel ring */}
      <circle cx="50" cy="62" r="18.5" fill="#9098a8" stroke="#808898" strokeWidth="0.8" />
      {/* Bezel face */}
      <circle cx="50" cy="62" r="17" fill="#6870808" />
      {/* Lens thread ring */}
      <circle cx="50" cy="62" r="15.5" fill="none" stroke="#5a6070" strokeWidth="1.5" strokeDasharray="3 2" />

      {/* Lens glass */}
      <circle cx="50" cy="62" r="13.5" fill="url(#lensGrad)" />

      {/* Lens inner reflection rings */}
      <circle cx="50" cy="62" r="11" fill="none" stroke="#1e2a3a" strokeWidth="0.6" opacity={0.8} />
      <circle cx="50" cy="62" r="8" fill="none" stroke="#1a2438" strokeWidth="0.4" opacity={0.6} />

      {/* Scan beam (thinking / listening) */}
      {(state === 'thinking' || state === 'listening') && (
        <>
          <motion.line
            x1="50" y1="62"
            x2={beamX} y2={beamY}
            stroke={state === 'listening' ? 'hsl(var(--primary))' : 'hsl(var(--warning))'}
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity={0.9}
          />
          <motion.circle
            cx={beamX} cy={beamY} r="3"
            fill={state === 'listening' ? 'hsl(var(--primary)/0.35)' : 'hsl(var(--warning)/0.35)'}
            animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        </>
      )}

      {/* ══ IRIS ══ */}
      <motion.circle
        cx={50 + (isSleeping ? 0 : mouseOffset.x)}
        cy={62 + (isSleeping ? 0 : mouseOffset.y)}
        r={irisR}
        fill={
          state === 'happy'
            ? 'hsl(var(--primary))'
            : state === 'flash'
              ? 'hsl(var(--warning))'
              : state === 'listening'
                ? 'hsl(var(--info))'
                : 'hsl(var(--primary)/0.9)'
        }
        animate={{ r: irisR }}
        transition={{ duration: 0.13, ease: 'easeOut' }}
        filter="url(#irisGlow)"
      />

      {/* Pupil */}
      <motion.circle
        cx={50 + (isSleeping ? 0 : mouseOffset.x * 0.55)}
        cy={62 + (isSleeping ? 0 : mouseOffset.y * 0.55)}
        r={pupilR}
        fill="#020408"
        animate={{ r: pupilR }}
        transition={{ duration: 0.1 }}
      />

      {/* Lens glare — primary */}
      {!isSleeping && (
        <>
          <ellipse
            cx={43 + mouseOffset.x * 0.22}
            cy={55 + mouseOffset.y * 0.22}
            rx="3.5" ry="2.2"
            fill="white" opacity={0.75}
            transform={`rotate(-28, ${43 + mouseOffset.x * 0.22}, ${55 + mouseOffset.y * 0.22})`}
          />
          <circle
            cx={56 + mouseOffset.x * 0.12}
            cy={68 + mouseOffset.y * 0.12}
            r="1.2" fill="white" opacity={0.3}
          />
          {/* Lens coating shimmer */}
          <ellipse cx="50" cy="55" rx="7" ry="2" fill="white" opacity={0.06} />
        </>
      )}

      {/* ══ IR LEDS (4 around lens) ══ */}
      {[
        { cx: 34, cy: 50 },
        { cx: 66, cy: 50 },
        { cx: 34, cy: 74 },
        { cx: 66, cy: 74 },
      ].map((dot, i) => (
        <g key={i}>
          {/* glow halo */}
          {irOn && !isSleeping && (
            <circle cx={dot.cx} cy={dot.cy} r="4.5" fill="url(#irGlow)" opacity={0.35} />
          )}
          {/* LED body */}
          <circle
            cx={dot.cx} cy={dot.cy} r="2.2"
            fill={irOn && !isSleeping ? '#ff2020' : '#5a1010'}
            stroke="#300808" strokeWidth="0.5"
          />
          <circle cx={dot.cx - 0.5} cy={dot.cy - 0.5} r="0.7" fill="white" opacity={irOn && !isSleeping ? 0.6 : 0.15} />
        </g>
      ))}

      {/* ══ RECORDING DOT (top-right corner) ══ */}
      <motion.circle
        cx="72" cy="50" r="2.8"
        fill="hsl(var(--destructive))"
        stroke="#800000" strokeWidth="0.5"
        animate={{ opacity: isSleeping ? 0.1 : [0.3, 1, 0.3], scale: isSleeping ? 1 : [0.9, 1.1, 0.9] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      {/* REC text */}
      {!isSleeping && (
        <motion.text
          x="75" y="49.5"
          fill="hsl(var(--destructive))"
          fontSize="3.5"
          fontWeight="bold"
          fontFamily="monospace"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          REC
        </motion.text>
      )}

      {/* ══ CABLE CONNECTOR ══ */}
      <rect x="44" y="81" width="12" height="6" rx="2.5" fill="#b0b8c4" stroke="#9098a8" strokeWidth="0.6" />
      <rect x="46" y="83" width="8" height="2" rx="1" fill="#8890a0" />

      {/* Flash burst ring */}
      {state === 'flash' && (
        <motion.circle
          cx="50" cy="62" r="20"
          fill="none"
          stroke="hsl(var(--warning)/0.6)"
          strokeWidth="3"
          initial={{ scale: 0.7, opacity: 1 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.45 }}
        />
      )}

      {/* Happy arc under lens */}
      {(state === 'happy' || state === 'talking') && (
        <motion.path
          d="M37 80 Q50 89 63 80"
          fill="none"
          stroke="hsl(var(--primary)/0.5)"
          strokeWidth="2.2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Thinking / processing dots */}
      {state === 'thinking' && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.circle
              key={i}
              cx={78 + i * 6}
              cy={34 - i * 5}
              r={3 - i * 0.7}
              fill="hsl(var(--warning)/0.9)"
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.3, 0.7] }}
              transition={{ repeat: Infinity, duration: 0.85, delay: i * 0.17 }}
            />
          ))}
        </>
      )}

      {/* Sleeping ZZZ */}
      {isSleeping && (
        <>
          {[0, 1, 2].map((_, i) => (
            <motion.text
              key={i}
              x={74 + i * 7}
              y={32 - i * 8}
              fill="hsl(var(--muted-foreground)/0.65)"
              fontSize={11 - i * 2.5}
              fontWeight="bold"
              fontFamily="sans-serif"
              animate={{ opacity: [0, 1, 0], y: [32 - i * 8, 23 - i * 8, 14 - i * 8] }}
              transition={{ repeat: Infinity, duration: 2.8, delay: i * 0.5 }}
            >
              z
            </motion.text>
          ))}
        </>
      )}

      {/* Drop shadow */}
      <ellipse cx="50" cy="102" rx="24" ry="4" fill="hsl(var(--foreground)/0.07)" />
    </motion.svg>
  );
}
