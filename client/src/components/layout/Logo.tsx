import Image from 'next/image';

interface LogoProps {
  size?: number; // circle diameter in px, default 36
  showWordmark?: boolean; // default true
}

export function Logo({ size = 36, showWordmark = true }: LogoProps) {
  return (
    <div className="flex items-center gap-2.5 select-none" aria-label="TechBrain">

      {/* Logo photo in circle */}
      <div
        className="rounded-full overflow-hidden shrink-0 ring-2 ring-primary/20"
        style={{ width: size, height: size }}
      >
        <Image
          src="/logo.jpg"
          alt="TechBrain"
          width={size}
          height={size}
          className="object-cover w-full h-full"
          priority
        />
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <span
          className="font-bold tracking-tight text-foreground leading-none"
          style={{ fontSize: size * 0.44 }}
        >
          tech<span
            style={{
              background: 'linear-gradient(135deg, #c040ff 0%, #0466c8 50%, #22d3ee 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >brain</span>
        </span>
      )}
    </div>
  );
}
