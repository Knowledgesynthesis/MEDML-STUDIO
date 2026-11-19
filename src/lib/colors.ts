import type { ModelKind } from './ml/pipeline';

export const KIND_COLOR: Record<ModelKind, string> = {
  logistic: 'var(--c1)',
  logistic_quadratic: 'var(--c3)',
  tree: 'var(--c5)',
  forest: 'var(--c4)',
  boosting: 'var(--c2)',
  mlp: 'var(--bad)',
};
