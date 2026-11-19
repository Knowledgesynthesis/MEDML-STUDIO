// Shared, memoised cohorts and fitted models so every widget on every page sees the same results
// and nothing is trained twice.

import { useEffect, useState } from 'react';
import { getDataset, type Dataset, type DatasetId } from './data/datasets';
import { fitModel, pick, stratifiedSplit, type FittedModel, type ModelSpec } from './ml/pipeline';

export interface Cohort {
  ds: Dataset;
  train: number[];
  test: number[];
  Xtr: number[][];
  ytr: number[];
  Xte: number[][];
  yte: number[];
}

const cohorts = new Map<DatasetId, Cohort>();
const models = new Map<string, FittedModel>();
const preds = new Map<string, number[]>();

export function getCohort(id: DatasetId): Cohort {
  let c = cohorts.get(id);
  if (!c) {
    const ds = getDataset(id);
    const { train, test } = stratifiedSplit(ds.y, 0.3, 2024);
    c = { ds, train, test, Xtr: pick(ds.X, train), ytr: pick(ds.y, train), Xte: pick(ds.X, test), yte: pick(ds.y, test) };
    cohorts.set(id, c);
  }
  return c;
}

const key = (id: DatasetId, spec: ModelSpec) => `${id}|${JSON.stringify(spec)}`;

export function isCached(id: DatasetId, spec: ModelSpec) {
  return models.has(key(id, spec));
}

export function getModel(id: DatasetId, spec: ModelSpec): FittedModel {
  const k = key(id, spec);
  let m = models.get(k);
  if (!m) {
    const c = getCohort(id);
    m = fitModel(spec, c.ds.features, c.Xtr, c.ytr);
    models.set(k, m);
  }
  return m;
}

export function getPreds(id: DatasetId, spec: ModelSpec, part: 'train' | 'test'): number[] {
  const k = `${key(id, spec)}|${part}`;
  let p = preds.get(k);
  if (!p) {
    const c = getCohort(id);
    p = getModel(id, spec).predict(part === 'train' ? c.Xtr : c.Xte);
    preds.set(k, p);
  }
  return p;
}

/**
 * Run an expensive synchronous computation after the browser has painted a loading state.
 * Returns null while computing. `deps` must uniquely describe the computation.
 */
export function useComputed<T>(compute: () => T, deps: unknown[], instant = false): T | null {
  const [state, setState] = useState<{ key: string; value: T } | null>(() => (instant ? { key: JSON.stringify(deps), value: compute() } : null));
  const k = JSON.stringify(deps);
  useEffect(() => {
    if (state?.key === k) return;
    let cancelled = false;
    const t = window.setTimeout(() => {
      const value = compute();
      if (!cancelled) setState({ key: k, value });
    }, 16);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k]);
  return state?.key === k ? state.value : null;
}

/** Standard model menu used across labs. Hyper-parameters are fixed so results are reproducible. */
export const STANDARD_SPECS: Record<string, ModelSpec> = {
  logistic: { kind: 'logistic', l2: 1 },
  logistic_quadratic: { kind: 'logistic_quadratic', l2: 1 },
  tree: { kind: 'tree', depth: 4, minLeaf: 20 },
  forest: { kind: 'forest', nTrees: 80, depth: 8, minLeaf: 5 },
  boosting: { kind: 'boosting', nTrees: 120, depth: 3, minLeaf: 10 },
  mlp: { kind: 'mlp' },
};
