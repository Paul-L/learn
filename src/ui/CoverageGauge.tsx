import { useEffect, useRef, useState } from 'react';

interface CoverageGaugeProps {
  value?: number;
  size?: number;
  stroke?: number;
  animated?: boolean;
  target?: number | null;
  compact?: boolean;
}

export function CoverageGauge({
  value = 67,
  size = 260,
  stroke = 14,
  animated = false,
  target = null,
  compact = false,
}: CoverageGaugeProps) {
  const [display, setDisplay] = useState(animated ? Math.max(0, value - 4) : value);
  const displayRef = useRef(display);
  displayRef.current = display;

  useEffect(() => {
    if (!animated) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    const from = displayRef.current;
    const to = value;
    const dur = 1400;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (to - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, animated]);

  // Bottom-opening arc: start bottom-left (225°), sweep 270° clockwise to bottom-right (135°).
  // angle convention: 0° = top, increases clockwise
  const startAngle = 225;
  const sweep = 270;
  const r = (size - stroke) / 2 - 6;
  const cx = size / 2;
  const cy = size / 2;

  const polar = (a: number) => {
    const rad = ((a - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const arcPath = (from: number, to: number) => {
    const s = polar(from);
    const e = polar(to);
    const large = to - from > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  const progress = Math.max(0, Math.min(100, display)) / 100;
  const fullPath = arcPath(startAngle, startAngle + sweep);
  const activePath = arcPath(startAngle, startAngle + sweep * progress);

  const ticks: { inner: { x: number; y: number }; outer: { x: number; y: number }; major: boolean }[] = [];
  for (let i = 0; i <= 10; i++) {
    const a = startAngle + (sweep * i) / 10;
    const inner = polar(a);
    const rad = ((a - 90) * Math.PI) / 180;
    const outer = { x: cx + (r + 9) * Math.cos(rad), y: cy + (r + 9) * Math.sin(rad) };
    ticks.push({ inner, outer, major: i % 5 === 0 });
  }

  let targetMarker: { x: number; y: number } | null = null;
  if (target != null) {
    const a = startAngle + sweep * (target / 100);
    targetMarker = polar(a);
  }

  // Visual height of the gauge: bottom-tips of the arc sit at cy + r * sin(45°)
  // because the arc endpoints are at 225° and 135° in our convention.
  const visualBottom = cy + r * Math.sin(Math.PI / 4) + stroke / 2 + 6;
  const containerH = Math.ceil(visualBottom);

  return (
    <div className="relative" style={{ width: size, height: containerH }}>
      <svg
        width={size}
        height={containerH}
        viewBox={`0 0 ${size} ${containerH}`}
        className="block"
      >
        <path
          d={fullPath}
          stroke="#EFEAE0"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
        />
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.inner.x}
            y1={t.inner.y}
            x2={t.outer.x}
            y2={t.outer.y}
            stroke={t.major ? '#C9C0B0' : '#E0D8C8'}
            strokeWidth={t.major ? 1.5 : 1}
            strokeLinecap="round"
          />
        ))}
        {progress > 0 && (
          <path
            d={activePath}
            stroke="#C76F4B"
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
          />
        )}
        {targetMarker && (
          <circle
            cx={targetMarker.x}
            cy={targetMarker.y}
            r={5}
            fill="#FFFFFF"
            stroke="#1F1A14"
            strokeWidth={1.5}
          />
        )}
      </svg>

      <div
        className="pointer-events-none absolute inset-x-0 flex flex-col items-center"
        style={{ top: cy - (compact ? 56 : 64) }}
      >
        <div className="mb-1 text-[11px] uppercase tracking-[0.16em] text-muted">Couverture</div>
        <div
          className="num-serif leading-none text-ink"
          style={{ fontSize: compact ? 72 : 84 }}
        >
          {Math.round(display)}
          <span className="text-accent" style={{ fontSize: compact ? 36 : 42 }}>
            {' '}
            %
          </span>
        </div>
        <div
          className="mt-2 max-w-[220px] px-6 text-center text-[12px] text-muted"
          style={{ textWrap: 'balance' } as React.CSSProperties}
        >
          d'une conversation courante
        </div>
      </div>
    </div>
  );
}
