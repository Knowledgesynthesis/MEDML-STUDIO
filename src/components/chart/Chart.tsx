import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

export interface Scales {
  x: (v: number) => number;
  y: (v: number) => number;
  width: number;
  height: number;
  left: number;
  top: number;
  innerW: number;
  innerH: number;
}

function niceTicks(lo: number, hi: number, count = 5): number[] {
  const span = hi - lo;
  if (span <= 0) return [lo];
  const raw = span / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= count) ?? mag * 10;
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + step * 1e-9; v += step) out.push(Number(v.toFixed(10)));
  return out;
}

function useWidth<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [w, setW] = useState(560);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const width = Math.round(entries[0].contentRect.width);
      if (width > 0) setW(width);
    });
    ro.observe(el);
    setW(el.clientWidth || 560);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

export interface ChartProps {
  x: [number, number];
  y: [number, number];
  xLabel?: string;
  yLabel?: string;
  xTicks?: number[];
  yTicks?: number[];
  xFormat?: (v: number) => string;
  yFormat?: (v: number) => string;
  aspect?: number;
  minHeight?: number;
  maxHeight?: number;
  ariaLabel: string;
  square?: boolean;
  children: (s: Scales) => ReactNode;
}

/** Responsive SVG chart: renders at true pixel width so labels stay legible on phones. */
export function Chart({ x, y, xLabel, yLabel, xTicks, yTicks, xFormat, yFormat, aspect = 0.62, minHeight = 220, maxHeight = 380, ariaLabel, square, children }: ChartProps) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const left = yLabel ? 52 : 40;
  const bottom = xLabel ? 42 : 26;
  const top = 10;
  const right = 12;
  let height = Math.max(minHeight, Math.min(maxHeight, width * aspect));
  if (square) height = Math.min(maxHeight, Math.max(minHeight, width - left - right + top + bottom));
  const innerW = Math.max(10, width - left - right);
  const innerH = Math.max(10, height - top - bottom);
  const sx = (v: number) => left + ((v - x[0]) / (x[1] - x[0])) * innerW;
  const sy = (v: number) => top + innerH - ((v - y[0]) / (y[1] - y[0])) * innerH;
  const xt = xTicks ?? niceTicks(x[0], x[1], Math.max(3, Math.floor(innerW / 70)));
  const yt = yTicks ?? niceTicks(y[0], y[1], Math.max(3, Math.floor(innerH / 45)));
  const fX = xFormat ?? ((v: number) => String(v));
  const fY = yFormat ?? ((v: number) => String(v));
  const s: Scales = { x: sx, y: sy, width, height, left, top, innerW, innerH };
  return (
    <div ref={ref} className="w-full">
      <svg width={width} height={height} role="img" aria-label={ariaLabel} className="block overflow-visible text-fg">
        <title>{ariaLabel}</title>
        <g>
          {yt.map((t) => (
            <g key={`y${t}`}>
              <line x1={left} x2={left + innerW} y1={sy(t)} y2={sy(t)} stroke="var(--grid)" />
              <text x={left - 6} y={sy(t)} dy="0.32em" textAnchor="end" fontSize="11" fill="var(--muted-fg)" className="num">
                {fY(t)}
              </text>
            </g>
          ))}
          {xt.map((t) => (
            <g key={`x${t}`}>
              <line y1={top} y2={top + innerH} x1={sx(t)} x2={sx(t)} stroke="var(--grid)" />
              <text x={sx(t)} y={top + innerH + 15} textAnchor="middle" fontSize="11" fill="var(--muted-fg)" className="num">
                {fX(t)}
              </text>
            </g>
          ))}
          <rect x={left} y={top} width={innerW} height={innerH} fill="none" stroke="var(--border)" />
          {xLabel && (
            <text x={left + innerW / 2} y={height - 6} textAnchor="middle" fontSize="12" fill="var(--muted-fg)">
              {xLabel}
            </text>
          )}
          {yLabel && (
            <text transform={`translate(13 ${top + innerH / 2}) rotate(-90)`} textAnchor="middle" fontSize="12" fill="var(--muted-fg)">
              {yLabel}
            </text>
          )}
        </g>
        <svg x={left} y={top} width={innerW} height={innerH} overflow="hidden">
          <g transform={`translate(${-left} ${-top})`}>{children(s)}</g>
        </svg>
      </svg>
    </div>
  );
}

export function Line({ s, pts, color, width = 2, dashed, opacity = 1, step }: { s: Scales; pts: [number, number][]; color: string; width?: number; dashed?: boolean; opacity?: number; step?: boolean }) {
  if (pts.length === 0) return null;
  let d = `M${s.x(pts[0][0])},${s.y(pts[0][1])}`;
  for (let i = 1; i < pts.length; i++) {
    if (step) d += `H${s.x(pts[i][0])}V${s.y(pts[i][1])}`;
    else d += `L${s.x(pts[i][0])},${s.y(pts[i][1])}`;
  }
  return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeDasharray={dashed ? '5 4' : undefined} opacity={opacity} strokeLinejoin="round" strokeLinecap="round" />;
}

export function Dots({ s, pts, color, r = 3.5, opacity = 1 }: { s: Scales; pts: [number, number][]; color: string; r?: number; opacity?: number }) {
  return (
    <g fill={color} opacity={opacity}>
      {pts.map(([a, b], i) => (
        <circle key={i} cx={s.x(a)} cy={s.y(b)} r={r} />
      ))}
    </g>
  );
}

export function VLine({ s, x, color = 'var(--fg)', dashed = true, label }: { s: Scales; x: number; color?: string; dashed?: boolean; label?: string }) {
  return (
    <g>
      <line x1={s.x(x)} x2={s.x(x)} y1={s.top} y2={s.top + s.innerH} stroke={color} strokeWidth={1.5} strokeDasharray={dashed ? '4 3' : undefined} />
      {label && (
        <text x={s.x(x) + 4} y={s.top + 12} fontSize="11" fill={color}>
          {label}
        </text>
      )}
    </g>
  );
}

export function Diagonal({ s, from = 0, to = 1 }: { s: Scales; from?: number; to?: number }) {
  return <line x1={s.x(from)} y1={s.y(from)} x2={s.x(to)} y2={s.y(to)} stroke="var(--muted-fg)" strokeDasharray="4 4" strokeWidth={1} />;
}

/** Mirrored or overlaid histogram bars. */
export function Bars({ s, bins, color, opacity = 0.55, down }: { s: Scales; bins: { x0: number; x1: number; v: number }[]; color: string; opacity?: number; down?: boolean }) {
  return (
    <g fill={color} opacity={opacity}>
      {bins.map((b, i) => {
        const x0 = s.x(b.x0);
        const w = Math.max(0.5, s.x(b.x1) - x0 - 1);
        const y0 = s.y(0);
        const y1 = s.y(down ? -b.v : b.v);
        return <rect key={i} x={x0} y={Math.min(y0, y1)} width={w} height={Math.abs(y1 - y0)} />;
      })}
    </g>
  );
}
