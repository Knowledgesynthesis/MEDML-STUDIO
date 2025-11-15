import { sigmoid } from '../utils/math';
import type { SyntheticDataPoint, FeatureImportance, Prediction } from '@/types';

export class LogisticRegression {
  private weights: number[] = [];
  private bias: number = 0;
  private featureNames: string[] = [];
  private learningRate: number;
  private iterations: number;

  constructor(learningRate: number = 0.01, iterations: number = 1000) {
    this.learningRate = learningRate;
    this.iterations = iterations;
  }

  private prepareFeatures(dataPoint: SyntheticDataPoint, featureNames: string[]): number[] {
    return featureNames.map(name => {
      const value = dataPoint.features[name];
      return typeof value === 'number' ? value : 0;
    });
  }

  fit(data: SyntheticDataPoint[], featureNames: string[]): void {
    this.featureNames = featureNames;
    const n = data.length;
    const m = featureNames.length;

    // Initialize weights
    this.weights = new Array(m).fill(0);
    this.bias = 0;

    // Prepare feature matrix
    const X = data.map(point => this.prepareFeatures(point, featureNames));
    const y = data.map(point => point.outcome);

    // Gradient descent
    for (let iter = 0; iter < this.iterations; iter++) {
      const predictions = X.map(features => {
        const z = features.reduce((sum, x, i) => sum + x * this.weights[i], this.bias);
        return sigmoid(z);
      });

      // Calculate gradients
      const dw = new Array(m).fill(0);
      let db = 0;

      for (let i = 0; i < n; i++) {
        const error = predictions[i] - y[i];
        db += error;
        for (let j = 0; j < m; j++) {
          dw[j] += error * X[i][j];
        }
      }

      // Update weights
      for (let j = 0; j < m; j++) {
        this.weights[j] -= (this.learningRate * dw[j]) / n;
      }
      this.bias -= (this.learningRate * db) / n;
    }
  }

  predict(dataPoint: SyntheticDataPoint): Prediction {
    const features = this.prepareFeatures(dataPoint, this.featureNames);
    const z = features.reduce((sum, x, i) => sum + x * this.weights[i], this.bias);
    const probability = sigmoid(z);

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
    // For logistic regression, use absolute weights as importance
    return this.featureNames
      .map((name, i) => ({
        feature: name,
        importance: Math.abs(this.weights[i]),
        rank: 0,
      }))
      .sort((a, b) => b.importance - a.importance)
      .map((item, i) => ({ ...item, rank: i + 1 }));
  }

  getWeights(): Record<string, number> {
    const weights: Record<string, number> = {};
    this.featureNames.forEach((name, i) => {
      weights[name] = this.weights[i];
    });
    return weights;
  }

  getBias(): number {
    return this.bias;
  }
}
