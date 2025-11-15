// Mathematical utility functions for ML operations

export function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

export function std(values: number[]): number {
  if (values.length === 0) return 0;
  const mu = mean(values);
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mu, 2), 0) / values.length;
  return Math.sqrt(variance);
}

export function normalize(values: number[]): number[] {
  const mu = mean(values);
  const sigma = std(values);
  if (sigma === 0) return values.map(() => 0);
  return values.map(val => (val - mu) / sigma);
}

export function minMaxScale(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => 0.5);
  return values.map(val => (val - min) / (max - min));
}

export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error('Vectors must have same length');
  return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
}

export function dotProduct(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error('Vectors must have same length');
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

export function giniImpurity(labels: number[]): number {
  if (labels.length === 0) return 0;
  const counts = labels.reduce((acc, label) => {
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const total = labels.length;
  let gini = 1;
  for (const count of Object.values(counts)) {
    const p = count / total;
    gini -= p * p;
  }
  return gini;
}

export function entropy(labels: number[]): number {
  if (labels.length === 0) return 0;
  const counts = labels.reduce((acc, label) => {
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const total = labels.length;
  let ent = 0;
  for (const count of Object.values(counts)) {
    if (count === 0) continue;
    const p = count / total;
    ent -= p * Math.log2(p);
  }
  return ent;
}

export function confusionMatrix(predicted: number[], actual: number[]): {
  tp: number;
  tn: number;
  fp: number;
  fn: number;
} {
  let tp = 0, tn = 0, fp = 0, fn = 0;

  for (let i = 0; i < predicted.length; i++) {
    if (predicted[i] === 1 && actual[i] === 1) tp++;
    else if (predicted[i] === 0 && actual[i] === 0) tn++;
    else if (predicted[i] === 1 && actual[i] === 0) fp++;
    else if (predicted[i] === 0 && actual[i] === 0) fn++;
  }

  return { tp, tn, fp, fn };
}

export function calculateAUC(scores: number[], labels: number[]): number {
  // Simple AUC calculation using trapezoidal rule
  const sorted = scores
    .map((score, i) => ({ score, label: labels[i] }))
    .sort((a, b) => b.score - a.score);

  let tpr = 0, fpr = 0;
  const positives = labels.filter(l => l === 1).length;
  const negatives = labels.length - positives;

  if (positives === 0 || negatives === 0) return 0.5;

  let auc = 0;
  let prevFpr = 0;

  for (const item of sorted) {
    if (item.label === 1) {
      tpr += 1 / positives;
    } else {
      fpr += 1 / negatives;
      auc += tpr * (fpr - prevFpr);
      prevFpr = fpr;
    }
  }

  return auc;
}

export function brierScore(probabilities: number[], labels: number[]): number {
  if (probabilities.length !== labels.length) {
    throw new Error('Arrays must have same length');
  }

  const sum = probabilities.reduce((acc, prob, i) => {
    return acc + Math.pow(prob - labels[i], 2);
  }, 0);

  return sum / probabilities.length;
}
