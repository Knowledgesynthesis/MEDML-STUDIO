import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Horizontal bars with a zero line; supports signed values and error bars. Responsive, text-first. */
export function HBars({
  rows,
  format = (v) => v.toFixed(3),
  color = 'var(--c1)',
  negColor = 'var(--c2)',
  domain,
}: {
  rows: { label: ReactNode; value: number; err?: number; sub?: ReactNode; color?: string }[];
  format?: (v: number) => string;
  color?: string;
  negColor?: string;
  domain?: [number, number];
}) {
  const lo = domain?.[0] ?? Math.min(0, ...rows.map((r) => r.value - (r.err ?? 0)));
  const hi = domain?.[1] ?? Math.max(0, ...rows.map((r) => r.value + (r.err ?? 0)));
  const span = hi - lo || 1;
  const pos = (v: number) => ((v - lo) / span) * 100;
  return (
    <div className="space-y-1.5">
      {rows.map((r, i) => {
        const a = pos(Math.min(0, r.value));
        const b = pos(Math.max(0, r.value));
        return (
          <div key={i} className="grid grid-cols-[minmax(0,9.5rem)_1fr_4.2rem] items-center gap-2 text-sm sm:grid-cols-[minmax(0,13rem)_1fr_4.5rem]">
            <div className="truncate" title={typeof r.label === 'string' ? r.label : undefined}>
              {r.label}
              {r.sub && <div className="truncate text-xs text-muted-fg">{r.sub}</div>}
            </div>
            <div className="relative h-5 rounded bg-muted">
              <div className="absolute inset-y-0 w-px bg-muted-fg/60" style={{ left: `${pos(0)}%` }} />
              <div className="absolute inset-y-0.5 rounded-sm" style={{ left: `${a}%`, width: `${Math.max(0.6, b - a)}%`, background: r.color ?? (r.value >= 0 ? color : negColor) }} />
              {r.err !== undefined && r.err > 0 && (
                <div className="absolute top-1/2 h-px bg-fg" style={{ left: `${pos(r.value - r.err)}%`, width: `${pos(r.value + r.err) - pos(r.value - r.err)}%` }} />
              )}
            </div>
            <div className="num text-right font-mono text-xs">{format(r.value)}</div>
          </div>
        );
      })}
    </div>
  );
}

function WaterfallRow({ label, detail, children, value, strong }: { label: ReactNode; detail?: ReactNode; children: ReactNode; value: string; strong?: boolean }) {
  return (
    <div className="grid grid-cols-[minmax(0,9.5rem)_1fr_4.6rem] items-center gap-2 text-sm sm:grid-cols-[minmax(0,13rem)_1fr_5rem]">
      <div className={cn('min-w-0', strong && 'font-semibold')}>
        <div className="truncate">{label}</div>
        {detail && <div className="truncate text-xs text-muted-fg">{detail}</div>}
      </div>
      <div className="relative h-6 rounded bg-muted">{children}</div>
      <div className={cn('num text-right font-mono text-xs', strong && 'font-semibold')}>{value}</div>
    </div>
  );
}

/** SHAP-style waterfall: starts at the base value, each feature moves the running total, ends at f(x). */
export function Waterfall({
  base,
  fx,
  items,
  format,
  baseLabel = 'Average prediction (base value)',
  outLabel = 'This patient',
}: {
  base: number;
  fx: number;
  items: { label: ReactNode; value: number; detail?: ReactNode }[];
  format: (v: number) => string;
  baseLabel?: string;
  outLabel?: string;
}) {
  const sorted = items.slice().sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  const steps = sorted.reduce<{ label: ReactNode; detail?: ReactNode; value: number; start: number; end: number }[]>((acc, it) => {
    const start = acc.length ? acc[acc.length - 1].end : base;
    return [...acc, { ...it, start, end: start + it.value }];
  }, []);
  const all = [base, fx, ...steps.flatMap((s) => [s.start, s.end])];
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  const pad = (hi - lo) * 0.05 || 0.01;
  const L = lo - pad;
  const span = hi + pad - L;
  const pos = (v: number) => ((v - L) / span) * 100;
  return (
    <div className="space-y-1.5">
      <WaterfallRow label={baseLabel} value={format(base)} strong>
        <div className="absolute inset-y-0 w-0.5 bg-fg" style={{ left: `${pos(base)}%` }} />
      </WaterfallRow>
      {steps.map((s, i) => {
        const a = pos(Math.min(s.start, s.end));
        const b = pos(Math.max(s.start, s.end));
        return (
          <WaterfallRow key={i} label={s.label} detail={s.detail} value={`${s.value >= 0 ? '+' : '−'}${format(Math.abs(s.value))}`}>
            <div className="absolute inset-y-1 rounded-sm" style={{ left: `${a}%`, width: `${Math.max(0.6, b - a)}%`, background: s.value >= 0 ? 'var(--c2)' : 'var(--c1)' }} />
          </WaterfallRow>
        );
      })}
      <WaterfallRow label={outLabel} value={format(fx)} strong>
        <div className="absolute inset-y-0 w-0.5 bg-fg" style={{ left: `${pos(fx)}%` }} />
      </WaterfallRow>
      <div className="flex gap-4 pt-1 text-xs text-muted-fg">
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: 'var(--c2)' }} /> pushes risk up
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: 'var(--c1)' }} /> pushes risk down
        </span>
      </div>
    </div>
  );
}
