import { useId, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import { AlertTriangle, Lightbulb, Info, FlaskConical, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-xl border bg-card shadow-sm', className)} {...props} />;
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-4 sm:p-5', className)} {...props} />;
}

type Variant = 'primary' | 'outline' | 'ghost' | 'subtle';

export function Button({ className, variant = 'primary', size = 'md', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md' }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
        size === 'sm' ? 'h-8 px-3 text-sm' : 'h-10 px-4 text-sm',
        variant === 'primary' && 'bg-primary text-primary-fg hover:opacity-90',
        variant === 'outline' && 'border bg-card hover:bg-muted',
        variant === 'ghost' && 'hover:bg-muted',
        variant === 'subtle' && 'bg-muted hover:opacity-80',
        className,
      )}
      {...props}
    />
  );
}

export function Badge({ className, tone = 'default', ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: 'default' | 'good' | 'warn' | 'bad' | 'primary' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
        tone === 'default' && 'bg-muted text-muted-fg',
        tone === 'primary' && 'border-primary/40 bg-primary/10 text-primary',
        tone === 'good' && 'border-good/40 bg-good/10 text-good',
        tone === 'warn' && 'border-warn/40 bg-warn/10 text-warn',
        tone === 'bad' && 'border-bad/40 bg-bad/10 text-bad',
        className,
      )}
      {...props}
    />
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format = (v) => String(v),
  hint,
}: {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  hint?: ReactNode;
}) {
  const id = useId();
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <label htmlFor={id} className="font-medium">
          {label}
        </label>
        <span className="num font-mono text-sm">{format(value)}</span>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full" />
      {hint && <p className="text-xs text-muted-fg">{hint}</p>}
    </div>
  );
}

export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap gap-1 rounded-lg bg-muted p-1">
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn('rounded-md px-2.5 py-1 text-sm transition-colors', value === o.value ? 'bg-card font-medium shadow-sm' : 'text-muted-fg hover:text-fg')}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Select<T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)} className="block w-full rounded-lg border bg-card px-3 py-2 text-sm">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4 accent-[var(--primary)]" />
      <span>{label}</span>
    </label>
  );
}

export function Stat({ label, value, sub, tone }: { label: ReactNode; value: ReactNode; sub?: ReactNode; tone?: 'good' | 'warn' | 'bad' }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="text-xs text-muted-fg">{label}</div>
      <div className={cn('num mt-0.5 text-xl font-semibold', tone === 'good' && 'text-good', tone === 'warn' && 'text-warn', tone === 'bad' && 'text-bad')}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted-fg">{sub}</div>}
    </div>
  );
}

const CALLOUT = {
  pearl: { icon: Lightbulb, title: 'Clinical pearl', cls: 'border-c3/40 bg-c3/5', iconCls: 'text-c3' },
  pitfall: { icon: AlertTriangle, title: 'Pitfall', cls: 'border-warn/40 bg-warn/5', iconCls: 'text-warn' },
  evidence: { icon: FlaskConical, title: 'Evidence', cls: 'border-c1/40 bg-c1/5', iconCls: 'text-c1' },
  note: { icon: Info, title: 'Note', cls: 'border-border bg-muted/50', iconCls: 'text-muted-fg' },
  rule: { icon: CheckCircle2, title: 'Rule', cls: 'border-primary/40 bg-primary/5', iconCls: 'text-primary' },
} as const;

export function Callout({ kind, title, children }: { kind: keyof typeof CALLOUT; title?: string; children: ReactNode }) {
  const c = CALLOUT[kind];
  const Icon = c.icon;
  return (
    <div className={cn('my-4 rounded-lg border p-3 sm:p-4', c.cls)}>
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
        <Icon className={cn('h-4 w-4', c.iconCls)} aria-hidden />
        {title ?? c.title}
      </div>
      <div className="text-sm leading-relaxed [&>p]:my-1">{children}</div>
    </div>
  );
}

export function Formula({ children }: { children: ReactNode }) {
  return <div className="my-3 overflow-x-auto rounded-lg bg-muted px-3 py-2 font-mono text-sm">{children}</div>;
}

export function Loading({ label = 'Training models…' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center gap-2 py-6 text-sm text-muted-fg">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      {label}
    </div>
  );
}

export function Legend({ items }: { items: { color: string; label: string; dashed?: boolean }[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-fg">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5">
          <svg width="18" height="8" aria-hidden>
            <line x1="0" y1="4" x2="18" y2="4" stroke={it.color} strokeWidth="2.5" strokeDasharray={it.dashed ? '4 3' : undefined} />
          </svg>
          {it.label}
        </span>
      ))}
    </div>
  );
}
