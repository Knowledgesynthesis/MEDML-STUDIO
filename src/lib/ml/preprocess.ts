// Preprocessing that is *fit on training data only* and then applied unchanged to new data.
// Fitting imputation or scaling on the full dataset before splitting is a form of leakage.

import { mean, median, sd } from './stats';

export interface FeatureMeta {
  key: string;
  label: string;
  unit?: string;
  type: 'continuous' | 'binary';
  description: string;
  decimals?: number;
}

export interface PreprocessOptions {
  /** z-score continuous features (needed for penalised regression, neural nets, and comparable coefficients). */
  standardize: boolean;
  /** add centred squared terms for continuous features (simple non-linearity for regression). */
  quadratic?: boolean;
}

export interface OutputColumn {
  name: string;
  label: string;
  source: number;
  kind: 'linear' | 'squared' | 'missing';
}

export class Preprocessor {
  medians: number[] = [];
  centers: number[] = [];
  scales: number[] = [];
  hasMissing: boolean[] = [];
  columns: OutputColumn[] = [];
  constructor(
    public meta: FeatureMeta[],
    public opts: PreprocessOptions,
  ) {}

  fit(X: number[][]): this {
    const p = this.meta.length;
    this.columns = [];
    for (let j = 0; j < p; j++) {
      const col = X.map((r) => r[j]);
      const observed = col.filter((v) => !Number.isNaN(v));
      this.hasMissing[j] = observed.length < col.length;
      this.medians[j] = observed.length ? median(observed) : 0;
      const imputed = col.map((v) => (Number.isNaN(v) ? this.medians[j] : v));
      const isCont = this.meta[j].type === 'continuous';
      this.centers[j] = this.opts.standardize && isCont ? mean(imputed) : 0;
      const s = sd(imputed);
      this.scales[j] = this.opts.standardize && isCont && s > 0 ? s : 1;
    }
    for (let j = 0; j < p; j++) {
      this.columns.push({ name: this.meta[j].key, label: this.meta[j].label, source: j, kind: 'linear' });
    }
    if (this.opts.quadratic) {
      for (let j = 0; j < p; j++) {
        if (this.meta[j].type === 'continuous')
          this.columns.push({ name: `${this.meta[j].key}²`, label: `${this.meta[j].label}²`, source: j, kind: 'squared' });
      }
    }
    for (let j = 0; j < p; j++) {
      if (this.hasMissing[j])
        this.columns.push({ name: `${this.meta[j].key}_missing`, label: `${this.meta[j].label} not measured`, source: j, kind: 'missing' });
    }
    return this;
  }

  transformRow(row: number[]): number[] {
    const out: number[] = new Array(this.columns.length);
    for (let c = 0; c < this.columns.length; c++) {
      const col = this.columns[c];
      const v = row[col.source];
      const miss = Number.isNaN(v);
      const z = ((miss ? this.medians[col.source] : v) - this.centers[col.source]) / this.scales[col.source];
      out[c] = col.kind === 'linear' ? z : col.kind === 'squared' ? z * z : miss ? 1 : 0;
    }
    return out;
  }

  transform(X: number[][]): number[][] {
    return X.map((r) => this.transformRow(r));
  }
}
