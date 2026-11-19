import { describe, expect, it } from 'vitest';
import { MODULES } from './modules';
import { MODULE_META } from './meta';
import { REF_MAP, REFERENCES } from './references';
import { CASES } from './cases';
import { EXAM } from './exam';
import { GLOSSARY } from './glossary';
import { optionOrder } from '@/lib/optionOrder';

describe('content integrity', () => {
  it('navigation metadata matches the full module definitions', () => {
    expect(MODULE_META.map((m) => [m.id, m.number, m.title, m.summary, m.minutes])).toEqual(MODULES.map((m) => [m.id, m.number, m.title, m.summary, m.minutes]));
  });
  it('every module, case and exam reference resolves', () => {
    const ids = [...MODULES.flatMap((m) => m.refs), ...CASES.flatMap((c) => c.refs)];
    for (const id of ids) expect(REF_MAP[id], id).toBeDefined();
  });
  it('reference ids are unique and every reference has a link', () => {
    expect(new Set(REFERENCES.map((r) => r.id)).size).toBe(REFERENCES.length);
    for (const r of REFERENCES) expect(r.url).toMatch(/^https:\/\//);
  });
  it('every question has a valid answer index, ≥ 3 options and a rationale, and ids are unique', () => {
    const qs = [...MODULES.flatMap((m) => m.quiz), ...EXAM, ...CASES.map((c) => c.question)];
    for (const q of qs) {
      expect(q.options.length).toBeGreaterThanOrEqual(3);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(q.options.length);
      expect(q.rationale).toBeTruthy();
    }
    expect(new Set(qs.map((q) => q.id)).size).toBe(qs.length);
  });
  it('displayed answer positions carry no positional cue', () => {
    const qs = [...MODULES.flatMap((m) => m.quiz), ...EXAM];
    const counts = [0, 0, 0, 0];
    for (const q of qs) counts[optionOrder(q.id, q.options.length).indexOf(q.answer)]++;
    // displayed position of the correct answer should be roughly uniform
    expect(Math.max(...counts) / qs.length).toBeLessThan(0.4);
    expect(optionOrder('x', 4)).toEqual(optionOrder('x', 4));
  });
  it('glossary terms are unique and link to existing modules', () => {
    expect(new Set(GLOSSARY.map((t) => t.term)).size).toBe(GLOSSARY.length);
    const ids = new Set(MODULES.map((m) => m.id));
    for (const t of GLOSSARY) if (t.module) expect(ids.has(t.module), t.term).toBe(true);
  });
});
