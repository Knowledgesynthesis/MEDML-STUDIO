// From-scratch, dependency-free implementations of the model families taught in the course.
// They are small but faithful: the same algorithms as scikit-learn / XGBoost at reduced scale.

import { Rng, invert, sigmoid, solve, logit as safeLogit } from './stats';

export interface Estimator {
  fit(X: number[][], y: number[]): void;
  predict(X: number[][]): number[];
  /** Model-specific global importance aligned with design-matrix columns (if defined). */
  importance?(): number[];
}

/* ───────────────────────── Logistic regression (penalised maximum likelihood) ───────────────────────── */

export interface LogisticParams {
  /** L2 (ridge) penalty on non-intercept coefficients; 0 = ordinary maximum likelihood. */
  l2: number;
}

/**
 * Fitted by Newton–Raphson / IRLS, which converges in a handful of iterations and yields the
 * observed information matrix, from which Wald standard errors are obtained.
 */
export class LogisticRegression implements Estimator {
  intercept = 0;
  coef: number[] = [];
  se: number[] = [];
  interceptSe = 0;
  iterations = 0;
  converged = false;
  constructor(public params: LogisticParams = { l2: 1 }) {}

  fit(X: number[][], y: number[]): void {
    const n = X.length;
    const p = X[0].length;
    const k = p + 1;
    const beta = new Array<number>(k).fill(0);
    const prev = y.reduce((s, v) => s + v, 0) / n;
    beta[0] = safeLogit(prev);
    let H: number[][] = [];
    for (let it = 0; it < 100; it++) {
      const g = new Array<number>(k).fill(0);
      H = Array.from({ length: k }, () => new Array<number>(k).fill(0));
      for (let i = 0; i < n; i++) {
        const xi = X[i];
        let eta = beta[0];
        for (let j = 0; j < p; j++) eta += beta[j + 1] * xi[j];
        const mu = sigmoid(eta);
        const w = Math.max(mu * (1 - mu), 1e-10);
        const r = y[i] - mu;
        g[0] += r;
        H[0][0] += w;
        for (let a = 0; a < p; a++) {
          const xa = xi[a];
          g[a + 1] += r * xa;
          H[0][a + 1] += w * xa;
          for (let b = a; b < p; b++) H[a + 1][b + 1] += w * xa * xi[b];
        }
      }
      for (let a = 0; a < k; a++) for (let b = 0; b < a; b++) H[a][b] = H[b][a];
      for (let j = 1; j < k; j++) {
        g[j] -= this.params.l2 * beta[j];
        H[j][j] += this.params.l2;
      }
      const step = solve(H, g);
      let maxStep = 0;
      for (let j = 0; j < k; j++) {
        beta[j] += step[j];
        maxStep = Math.max(maxStep, Math.abs(step[j]));
      }
      this.iterations = it + 1;
      if (maxStep < 1e-8) {
        this.converged = true;
        break;
      }
    }
    const cov = invert(H);
    this.intercept = beta[0];
    this.coef = beta.slice(1);
    this.interceptSe = Math.sqrt(Math.max(cov[0][0], 0));
    this.se = this.coef.map((_, j) => Math.sqrt(Math.max(cov[j + 1][j + 1], 0)));
  }

  linearPredictor(x: number[]): number {
    let eta = this.intercept;
    for (let j = 0; j < x.length; j++) eta += this.coef[j] * x[j];
    return eta;
  }

  predict(X: number[][]): number[] {
    return X.map((x) => sigmoid(this.linearPredictor(x)));
  }

  importance(): number[] {
    return this.coef.map(Math.abs);
  }
}

/* ───────────────────────── Decision trees (CART) ───────────────────────── */

export type TreeNode =
  | { leaf: true; value: number; n: number; pos: number; depth: number }
  | {
      leaf: false;
      feature: number;
      threshold: number;
      left: TreeNode;
      right: TreeNode;
      n: number;
      pos: number;
      value: number;
      gain: number;
      depth: number;
    };

export interface TreeParams {
  maxDepth: number;
  minSamplesLeaf: number;
  /** features considered per split; undefined = all (CART), √p for random forests */
  maxFeatures?: number;
}

interface SplitResult {
  feature: number;
  threshold: number;
  gain: number;
  left: number[];
  right: number[];
}

/** Best split by Gini impurity decrease (classification). */
function bestGiniSplit(X: number[][], y: number[], idx: number[], features: number[], minLeaf: number): SplitResult | null {
  const n = idx.length;
  let pos = 0;
  for (const i of idx) pos += y[i];
  const parent = 1 - (pos / n) ** 2 - (1 - pos / n) ** 2;
  let best: { feature: number; threshold: number; gain: number } | null = null;
  for (const f of features) {
    const sorted = idx.slice().sort((a, b) => X[a][f] - X[b][f]);
    let lPos = 0;
    for (let k = 0; k < n - 1; k++) {
      lPos += y[sorted[k]];
      const v = X[sorted[k]][f];
      const vNext = X[sorted[k + 1]][f];
      if (v === vNext) continue;
      const nl = k + 1;
      const nr = n - nl;
      if (nl < minLeaf || nr < minLeaf) continue;
      const pl = lPos / nl;
      const pr = (pos - lPos) / nr;
      const gl = 2 * pl * (1 - pl);
      const gr = 2 * pr * (1 - pr);
      const gain = parent - (nl * gl + nr * gr) / n;
      if (gain > 1e-12 && (!best || gain > best.gain)) best = { feature: f, threshold: (v + vNext) / 2, gain };
    }
  }
  if (!best) return null;
  const left: number[] = [];
  const right: number[] = [];
  for (const i of idx) (X[i][best.feature] <= best.threshold ? left : right).push(i);
  return { ...best, left, right };
}

function pickFeatures(p: number, maxFeatures: number | undefined, rng: Rng): number[] {
  const all = Array.from({ length: p }, (_, i) => i);
  if (!maxFeatures || maxFeatures >= p) return all;
  return rng.shuffle(all).slice(0, maxFeatures);
}

export class DecisionTree implements Estimator {
  root: TreeNode | null = null;
  private imp: number[] = [];
  private nTrain = 0;
  constructor(
    public params: TreeParams = { maxDepth: 4, minSamplesLeaf: 20 },
    private rng = new Rng(11),
  ) {}

  fit(X: number[][], y: number[], sampleIdx?: number[]): void {
    const idx = sampleIdx ?? X.map((_, i) => i);
    const p = X[0].length;
    this.imp = new Array(p).fill(0);
    this.nTrain = idx.length;
    this.root = this.grow(X, y, idx, 0);
  }

  private grow(X: number[][], y: number[], idx: number[], depth: number): TreeNode {
    let pos = 0;
    for (const i of idx) pos += y[i];
    const n = idx.length;
    const value = pos / n;
    if (depth >= this.params.maxDepth || n < 2 * this.params.minSamplesLeaf || pos === 0 || pos === n) {
      return { leaf: true, value, n, pos, depth };
    }
    const feats = pickFeatures(X[0].length, this.params.maxFeatures, this.rng);
    const split = bestGiniSplit(X, y, idx, feats, this.params.minSamplesLeaf);
    if (!split) return { leaf: true, value, n, pos, depth };
    this.imp[split.feature] += (n / this.nTrain) * split.gain; // mean decrease in impurity
    return {
      leaf: false,
      feature: split.feature,
      threshold: split.threshold,
      gain: split.gain,
      n,
      pos,
      value,
      depth,
      left: this.grow(X, y, split.left, depth + 1),
      right: this.grow(X, y, split.right, depth + 1),
    };
  }

  predictRow(x: number[]): number {
    let node = this.root!;
    while (!node.leaf) node = x[node.feature] <= node.threshold ? node.left : node.right;
    return node.value;
  }

  predict(X: number[][]): number[] {
    return X.map((x) => this.predictRow(x));
  }

  importance(): number[] {
    return this.imp.slice();
  }

  stats(): { leaves: number; depth: number; nodes: number } {
    let leaves = 0;
    let depth = 0;
    let nodes = 0;
    const walk = (t: TreeNode) => {
      nodes++;
      depth = Math.max(depth, t.depth);
      if (t.leaf) leaves++;
      else {
        walk(t.left);
        walk(t.right);
      }
    };
    if (this.root) walk(this.root);
    return { leaves, depth, nodes };
  }
}

/* ───────────────────────── Random forest (bagged CART with feature subsampling) ───────────────────────── */

export interface ForestParams {
  nTrees: number;
  maxDepth: number;
  minSamplesLeaf: number;
  seed: number;
}

export class RandomForest implements Estimator {
  trees: DecisionTree[] = [];
  constructor(public params: ForestParams = { nTrees: 100, maxDepth: 8, minSamplesLeaf: 5, seed: 3 }) {}

  fit(X: number[][], y: number[]): void {
    const rng = new Rng(this.params.seed);
    const n = X.length;
    const p = X[0].length;
    const mtry = Math.max(1, Math.round(Math.sqrt(p)));
    this.trees = [];
    for (let t = 0; t < this.params.nTrees; t++) {
      const boot = Array.from({ length: n }, () => rng.int(n));
      const tree = new DecisionTree(
        { maxDepth: this.params.maxDepth, minSamplesLeaf: this.params.minSamplesLeaf, maxFeatures: mtry },
        new Rng(rng.int(2 ** 31)),
      );
      tree.fit(X, y, boot);
      this.trees.push(tree);
    }
  }

  predict(X: number[][]): number[] {
    return X.map((x) => {
      let s = 0;
      for (const t of this.trees) s += t.predictRow(x);
      return s / this.trees.length;
    });
  }

  importance(): number[] {
    const p = this.trees[0].importance().length;
    const out = new Array(p).fill(0);
    for (const t of this.trees) t.importance().forEach((v, j) => (out[j] += v / this.trees.length));
    return out;
  }
}

/* ───────────────────────── Gradient boosting (log-loss, second-order / Newton leaves) ───────────────────────── */

type RegNode = { leaf: true; value: number } | { leaf: false; feature: number; threshold: number; left: RegNode; right: RegNode };

export interface BoostingParams {
  nEstimators: number;
  learningRate: number;
  maxDepth: number;
  minSamplesLeaf: number;
  subsample: number;
  /** L2 regularisation on leaf weights (as in XGBoost). */
  lambda: number;
  seed: number;
}

export class GradientBoosting implements Estimator {
  base = 0;
  trees: RegNode[] = [];
  private imp: number[] = [];
  /** training log-loss after each boosting round (for teaching convergence/overfitting). */
  trainLoss: number[] = [];
  constructor(
    public params: BoostingParams = { nEstimators: 150, learningRate: 0.1, maxDepth: 3, minSamplesLeaf: 10, subsample: 0.8, lambda: 1, seed: 5 },
  ) {}

  fit(X: number[][], y: number[]): void {
    const rng = new Rng(this.params.seed);
    const n = X.length;
    const p = X[0].length;
    this.imp = new Array(p).fill(0);
    const prev = y.reduce((s, v) => s + v, 0) / n;
    this.base = safeLogit(prev);
    const F = new Array<number>(n).fill(this.base);
    const g = new Array<number>(n);
    const h = new Array<number>(n);
    this.trees = [];
    this.trainLoss = [];
    for (let m = 0; m < this.params.nEstimators; m++) {
      for (let i = 0; i < n; i++) {
        const q = sigmoid(F[i]);
        g[i] = q - y[i];
        h[i] = Math.max(q * (1 - q), 1e-6);
      }
      const idx: number[] = [];
      for (let i = 0; i < n; i++) if (rng.next() < this.params.subsample) idx.push(i);
      const tree = this.grow(X, g, h, idx, 0);
      this.trees.push(tree);
      let loss = 0;
      for (let i = 0; i < n; i++) {
        F[i] += this.params.learningRate * this.evalTree(tree, X[i]);
        const q = Math.min(1 - 1e-12, Math.max(1e-12, sigmoid(F[i])));
        loss += y[i] ? -Math.log(q) : -Math.log(1 - q);
      }
      this.trainLoss.push(loss / n);
    }
  }

  private grow(X: number[][], g: number[], h: number[], idx: number[], depth: number): RegNode {
    let G = 0;
    let H = 0;
    for (const i of idx) {
      G += g[i];
      H += h[i];
    }
    const lam = this.params.lambda;
    const leafValue = -G / (H + lam);
    if (depth >= this.params.maxDepth || idx.length < 2 * this.params.minSamplesLeaf) return { leaf: true, value: leafValue };
    const parentScore = (G * G) / (H + lam);
    let best: { f: number; t: number; gain: number } | null = null;
    const p = X[0].length;
    for (let f = 0; f < p; f++) {
      const sorted = idx.slice().sort((a, b) => X[a][f] - X[b][f]);
      let GL = 0;
      let HL = 0;
      for (let k = 0; k < sorted.length - 1; k++) {
        GL += g[sorted[k]];
        HL += h[sorted[k]];
        const v = X[sorted[k]][f];
        const vn = X[sorted[k + 1]][f];
        if (v === vn) continue;
        const nl = k + 1;
        if (nl < this.params.minSamplesLeaf || sorted.length - nl < this.params.minSamplesLeaf) continue;
        const GR = G - GL;
        const HR = H - HL;
        const gain = (GL * GL) / (HL + lam) + (GR * GR) / (HR + lam) - parentScore;
        if (gain > 1e-9 && (!best || gain > best.gain)) best = { f, t: (v + vn) / 2, gain };
      }
    }
    if (!best) return { leaf: true, value: leafValue };
    this.imp[best.f] += best.gain;
    const left: number[] = [];
    const right: number[] = [];
    for (const i of idx) (X[i][best.f] <= best.t ? left : right).push(i);
    return {
      leaf: false,
      feature: best.f,
      threshold: best.t,
      left: this.grow(X, g, h, left, depth + 1),
      right: this.grow(X, g, h, right, depth + 1),
    };
  }

  private evalTree(t: RegNode, x: number[]): number {
    let node = t;
    while (!node.leaf) node = x[node.feature] <= node.threshold ? node.left : node.right;
    return node.value;
  }

  rawScore(x: number[]): number {
    let F = this.base;
    for (const t of this.trees) F += this.params.learningRate * this.evalTree(t, x);
    return F;
  }

  predict(X: number[][]): number[] {
    return X.map((x) => sigmoid(this.rawScore(x)));
  }

  importance(): number[] {
    const tot = this.imp.reduce((s, v) => s + v, 0) || 1;
    return this.imp.map((v) => v / tot);
  }
}

/* ───────────────────────── Neural network (one hidden layer, Adam) ───────────────────────── */

export interface MlpParams {
  hidden: number;
  epochs: number;
  learningRate: number;
  l2: number;
  seed: number;
}

export class Mlp implements Estimator {
  W1: number[][] = [];
  b1: number[] = [];
  W2: number[] = [];
  b2 = 0;
  constructor(public params: MlpParams = { hidden: 16, epochs: 150, learningRate: 0.01, l2: 1e-3, seed: 9 }) {}

  fit(X: number[][], y: number[]): void {
    const { hidden: H, epochs, learningRate: lr, l2, seed } = this.params;
    const rng = new Rng(seed);
    const p = X[0].length;
    const lim1 = Math.sqrt(6 / (p + H));
    this.W1 = Array.from({ length: H }, () => Array.from({ length: p }, () => (rng.next() * 2 - 1) * lim1));
    this.b1 = new Array(H).fill(0);
    const lim2 = Math.sqrt(6 / (H + 1));
    this.W2 = Array.from({ length: H }, () => (rng.next() * 2 - 1) * lim2);
    this.b2 = safeLogit(y.reduce((s, v) => s + v, 0) / y.length);
    // Adam state
    const mW1 = this.W1.map((r) => r.map(() => 0));
    const vW1 = this.W1.map((r) => r.map(() => 0));
    const mb1 = new Array(H).fill(0);
    const vb1 = new Array(H).fill(0);
    const mW2 = new Array(H).fill(0);
    const vW2 = new Array(H).fill(0);
    let mb2 = 0;
    let vb2 = 0;
    const beta1 = 0.9;
    const beta2 = 0.999;
    const eps = 1e-8;
    let t = 0;
    const batch = 64;
    const order = X.map((_, i) => i);
    for (let ep = 0; ep < epochs; ep++) {
      const perm = rng.shuffle(order);
      for (let s = 0; s < perm.length; s += batch) {
        const ids = perm.slice(s, s + batch);
        const gW1 = this.W1.map((r) => r.map(() => 0));
        const gb1 = new Array(H).fill(0);
        const gW2 = new Array(H).fill(0);
        let gb2 = 0;
        for (const i of ids) {
          const x = X[i];
          const a = new Array(H);
          for (let k = 0; k < H; k++) {
            let z = this.b1[k];
            for (let j = 0; j < p; j++) z += this.W1[k][j] * x[j];
            a[k] = Math.tanh(z);
          }
          let o = this.b2;
          for (let k = 0; k < H; k++) o += this.W2[k] * a[k];
          const d = sigmoid(o) - y[i];
          gb2 += d;
          for (let k = 0; k < H; k++) {
            gW2[k] += d * a[k];
            const dh = d * this.W2[k] * (1 - a[k] * a[k]);
            gb1[k] += dh;
            for (let j = 0; j < p; j++) gW1[k][j] += dh * x[j];
          }
        }
        const m = ids.length;
        t++;
        const c1 = 1 - beta1 ** t;
        const c2 = 1 - beta2 ** t;
        const upd = (param: number, grad: number, mm: number, vv: number): [number, number, number] => {
          const nm = beta1 * mm + (1 - beta1) * grad;
          const nv = beta2 * vv + (1 - beta2) * grad * grad;
          return [param - (lr * (nm / c1)) / (Math.sqrt(nv / c2) + eps), nm, nv];
        };
        for (let k = 0; k < H; k++) {
          for (let j = 0; j < p; j++) {
            const gr = gW1[k][j] / m + l2 * this.W1[k][j];
            [this.W1[k][j], mW1[k][j], vW1[k][j]] = upd(this.W1[k][j], gr, mW1[k][j], vW1[k][j]);
          }
          [this.b1[k], mb1[k], vb1[k]] = upd(this.b1[k], gb1[k] / m, mb1[k], vb1[k]);
          [this.W2[k], mW2[k], vW2[k]] = upd(this.W2[k], gW2[k] / m + l2 * this.W2[k], mW2[k], vW2[k]);
        }
        [this.b2, mb2, vb2] = upd(this.b2, gb2 / m, mb2, vb2);
      }
    }
  }

  predict(X: number[][]): number[] {
    const H = this.W2.length;
    return X.map((x) => {
      let o = this.b2;
      for (let k = 0; k < H; k++) {
        let z = this.b1[k];
        for (let j = 0; j < x.length; j++) z += this.W1[k][j] * x[j];
        o += this.W2[k] * Math.tanh(z);
      }
      return sigmoid(o);
    });
  }
}
