import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const pct = (v: number, d = 0) => (Number.isFinite(v) ? `${(v * 100).toFixed(d)}%` : '—');
export const fx = (v: number, d = 2) => (Number.isFinite(v) ? v.toFixed(d) : '—');
