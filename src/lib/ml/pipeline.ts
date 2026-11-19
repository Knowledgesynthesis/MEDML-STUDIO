// A fitted model = preprocessing (fit on training data) + estimator.
// Everything downstream (metrics, SHAP, LIME, PDP) only sees `predict(rawRows)`.

import { DecisionTree, GradientBoosting, LogisticRegression, Mlp, RandomForest, type Estimator } from './models';
import { Preprocessor, type FeatureMeta, type OutputColumn } from './preprocess';
import { Rng } from './stats';

export type ModelKind = 'logistic' | 'logistic_quadratic' | 'tree' | 'forest' | 'boosting' | 'mlp';

export interface ModelSpec {
  kind: ModelKind;
  /** tree depth (tree/forest/boosting) */
  depth?: number;
  /** ridge penalty (logistic) */
  l2?: number;
  /** number of trees (forest/boosting) */
  nTrees?: number;
  minLeaf?: number;
  seed?: number;
}

export const MODEL_INFO: Record<ModelKind, { name: string; short: string; summary: string }> = {
  logistic: {
    name: 'Logistic regression',
    short: 'LR',
    summary: 'Additive on the log-odds scale. Every coefficient is directly interpretable; a strong default for tabular clinical data.',
  },
  logistic_quadratic: {
    name: 'Logistic regression + squared terms',
    short: 'LR²',
    summary: 'Adds a squared term per continuous predictor so U-shaped risk (e.g. hypo- and hyperthermia) can be captured while staying transparent.',
  },
  tree: {
    name: 'Decision tree (CART)',
    short: 'Tree',
    summary: 'Recursive binary splits chosen by Gini impurity. Readable when shallow; unstable and step-shaped risk estimates.',
  },
  forest: {
    name: 'Random forest',
    short: 'RF',
    summary: 'Average of many deep trees grown on bootstrap samples with random feature subsets. Reduces variance; not directly readable.',
  },
  boosting: {
    name: 'Gradient boosting',
    short: 'GBM',
    summary: 'Shallow trees added sequentially, each fitting the gradient of the log-loss (XGBoost-style Newton leaves).',
  },
  mlp: {
    name: 'Neural network (1 hidden layer)',
    short: 'NN',
    summary: 'Multilayer perceptron with 16 tanh units trained by Adam. Flexible, data-hungry, no intrinsic interpretability.',
  },
};

export class FittedModel {
  constructor(
    public spec: ModelSpec,
    public prep: Preprocessor,
    public est: Estimator,
    public meta: FeatureMeta[],
  ) {}

  predict(X: number[][]): number[] {
    return this.est.predict(this.prep.transform(X));
  }

  predictOne(x: number[]): number {
    return this.predict([x])[0];
  }

  get columns(): OutputColumn[] {
    return this.prep.columns;
  }

  get name(): string {
    return MODEL_INFO[this.spec.kind].name;
  }
}

export function buildEstimator(spec: ModelSpec): Estimator {
  const seed = spec.seed ?? 1;
  switch (spec.kind) {
    case 'logistic':
    case 'logistic_quadratic':
      return new LogisticRegression({ l2: spec.l2 ?? 1 });
    case 'tree':
      return new DecisionTree({ maxDepth: spec.depth ?? 4, minSamplesLeaf: spec.minLeaf ?? 20 }, new Rng(seed));
    case 'forest':
      return new RandomForest({ nTrees: spec.nTrees ?? 100, maxDepth: spec.depth ?? 8, minSamplesLeaf: spec.minLeaf ?? 5, seed });
    case 'boosting':
      return new GradientBoosting({
        nEstimators: spec.nTrees ?? 150,
        learningRate: 0.1,
        maxDepth: spec.depth ?? 3,
        minSamplesLeaf: spec.minLeaf ?? 10,
        subsample: 0.8,
        lambda: 1,
        seed,
      });
    case 'mlp':
      return new Mlp({ hidden: 16, epochs: 150, learningRate: 0.01, l2: 1e-3, seed });
  }
}

export function fitModel(spec: ModelSpec, meta: FeatureMeta[], X: number[][], y: number[]): FittedModel {
  const needsScaling = spec.kind === 'logistic' || spec.kind === 'logistic_quadratic' || spec.kind === 'mlp';
  const prep = new Preprocessor(meta, { standardize: needsScaling, quadratic: spec.kind === 'logistic_quadratic' }).fit(X);
  const est = buildEstimator(spec);
  est.fit(prep.transform(X), y);
  return new FittedModel(spec, prep, est, meta);
}

export interface Split {
  train: number[];
  test: number[];
}

/** Stratified random split so both partitions keep the outcome prevalence. */
export function stratifiedSplit(y: number[], testFraction = 0.3, seed = 2024): Split {
  const rng = new Rng(seed);
  const pos = rng.shuffle(y.map((v, i) => (v === 1 ? i : -1)).filter((i) => i >= 0));
  const neg = rng.shuffle(y.map((v, i) => (v === 0 ? i : -1)).filter((i) => i >= 0));
  const nPosTest = Math.round(pos.length * testFraction);
  const nNegTest = Math.round(neg.length * testFraction);
  const test = [...pos.slice(0, nPosTest), ...neg.slice(0, nNegTest)].sort((a, b) => a - b);
  const train = [...pos.slice(nPosTest), ...neg.slice(nNegTest)].sort((a, b) => a - b);
  return { train, test };
}

export const pick = <T,>(arr: T[], idx: number[]): T[] => idx.map((i) => arr[i]);

/** Odds ratios with Wald 95% CIs for a fitted logistic model, per SD (continuous) or yes vs no (binary). */
export function oddsRatios(model: FittedModel): { column: OutputColumn; beta: number; se: number; or: number; lo: number; hi: number; perUnit?: number }[] {
  if (!(model.est instanceof LogisticRegression)) return [];
  const lr = model.est;
  return model.columns.map((column, j) => {
    const beta = lr.coef[j];
    const se = lr.se[j];
    const scale = model.prep.scales[column.source];
    const perUnit = column.kind === 'linear' && model.meta[column.source].type === 'continuous' ? beta / scale : undefined;
    return { column, beta, se, or: Math.exp(beta), lo: Math.exp(beta - 1.96 * se), hi: Math.exp(beta + 1.96 * se), perUnit };
  });
}
