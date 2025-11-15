import { giniImpurity } from '../utils/math';
import type { SyntheticDataPoint, FeatureImportance, Prediction } from '@/types';

interface TreeNode {
  isLeaf: boolean;
  prediction?: number;
  feature?: string;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
  samples?: number;
  gini?: number;
}

export class DecisionTree {
  private root: TreeNode | null = null;
  private featureNames: string[] = [];
  private maxDepth: number;
  private minSamplesSplit: number;
  private featureImportanceMap: Map<string, number> = new Map();

  constructor(maxDepth: number = 5, minSamplesSplit: number = 2) {
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
  }

  private prepareFeatures(dataPoint: SyntheticDataPoint, featureNames: string[]): number[] {
    return featureNames.map(name => {
      const value = dataPoint.features[name];
      return typeof value === 'number' ? value : 0;
    });
  }

  private findBestSplit(
    X: number[][],
    y: number[],
    featureIndices: number[]
  ): { feature: number; threshold: number; gain: number } | null {
    let bestGain = 0;
    let bestFeature = -1;
    let bestThreshold = 0;

    const parentGini = giniImpurity(y);

    for (const featureIdx of featureIndices) {
      const values = X.map(row => row[featureIdx]);
      const uniqueValues = [...new Set(values)].sort((a, b) => a - b);

      for (let i = 0; i < uniqueValues.length - 1; i++) {
        const threshold = (uniqueValues[i] + uniqueValues[i + 1]) / 2;

        const leftIndices: number[] = [];
        const rightIndices: number[] = [];

        X.forEach((row, idx) => {
          if (row[featureIdx] <= threshold) {
            leftIndices.push(idx);
          } else {
            rightIndices.push(idx);
          }
        });

        if (leftIndices.length === 0 || rightIndices.length === 0) continue;

        const leftY = leftIndices.map(idx => y[idx]);
        const rightY = rightIndices.map(idx => y[idx]);

        const leftGini = giniImpurity(leftY);
        const rightGini = giniImpurity(rightY);

        const n = y.length;
        const weightedGini =
          (leftY.length / n) * leftGini + (rightY.length / n) * rightGini;

        const gain = parentGini - weightedGini;

        if (gain > bestGain) {
          bestGain = gain;
          bestFeature = featureIdx;
          bestThreshold = threshold;
        }
      }
    }

    if (bestFeature === -1) return null;

    // Update feature importance
    const featureName = this.featureNames[bestFeature];
    this.featureImportanceMap.set(
      featureName,
      (this.featureImportanceMap.get(featureName) || 0) + bestGain
    );

    return { feature: bestFeature, threshold: bestThreshold, gain: bestGain };
  }

  private buildTree(
    X: number[][],
    y: number[],
    depth: number = 0
  ): TreeNode {
    const samples = y.length;
    const gini = giniImpurity(y);

    // Check stopping criteria
    if (
      depth >= this.maxDepth ||
      samples < this.minSamplesSplit ||
      gini === 0
    ) {
      const prediction = y.filter(label => label === 1).length / samples;
      return {
        isLeaf: true,
        prediction,
        samples,
        gini,
      };
    }

    const featureIndices = Array.from({ length: this.featureNames.length }, (_, i) => i);
    const split = this.findBestSplit(X, y, featureIndices);

    if (!split || split.gain === 0) {
      const prediction = y.filter(label => label === 1).length / samples;
      return {
        isLeaf: true,
        prediction,
        samples,
        gini,
      };
    }

    // Split data
    const leftIndices: number[] = [];
    const rightIndices: number[] = [];

    X.forEach((row, idx) => {
      if (row[split.feature] <= split.threshold) {
        leftIndices.push(idx);
      } else {
        rightIndices.push(idx);
      }
    });

    const leftX = leftIndices.map(idx => X[idx]);
    const leftY = leftIndices.map(idx => y[idx]);
    const rightX = rightIndices.map(idx => X[idx]);
    const rightY = rightIndices.map(idx => y[idx]);

    return {
      isLeaf: false,
      feature: this.featureNames[split.feature],
      threshold: split.threshold,
      left: this.buildTree(leftX, leftY, depth + 1),
      right: this.buildTree(rightX, rightY, depth + 1),
      samples,
      gini,
    };
  }

  fit(data: SyntheticDataPoint[], featureNames: string[]): void {
    this.featureNames = featureNames;
    this.featureImportanceMap.clear();

    const X = data.map(point => this.prepareFeatures(point, featureNames));
    const y = data.map(point => point.outcome);

    this.root = this.buildTree(X, y);
  }

  private predictNode(node: TreeNode, features: number[]): number {
    if (node.isLeaf) {
      return node.prediction || 0;
    }

    const featureIdx = this.featureNames.indexOf(node.feature!);
    if (features[featureIdx] <= node.threshold!) {
      return this.predictNode(node.left!, features);
    } else {
      return this.predictNode(node.right!, features);
    }
  }

  predict(dataPoint: SyntheticDataPoint): Prediction {
    if (!this.root) {
      throw new Error('Model not trained');
    }

    const features = this.prepareFeatures(dataPoint, this.featureNames);
    const probability = this.predictNode(this.root, features);

    return {
      probability,
      class: probability >= 0.5 ? 1 : 0,
      confidence: Math.abs(probability - 0.5) * 2,
    };
  }

  predictBatch(data: SyntheticDataPoint[]): number[] {
    return data.map(point => this.predict(point).probability);
  }

  getFeatureImportance(): FeatureImportance[] {
    const totalImportance = Array.from(this.featureImportanceMap.values()).reduce(
      (sum, val) => sum + val,
      0
    );

    return Array.from(this.featureImportanceMap.entries())
      .map(([feature, importance]) => ({
        feature,
        importance: totalImportance > 0 ? importance / totalImportance : 0,
        rank: 0,
      }))
      .sort((a, b) => b.importance - a.importance)
      .map((item, i) => ({ ...item, rank: i + 1 }));
  }

  getTree(): TreeNode | null {
    return this.root;
  }
}
