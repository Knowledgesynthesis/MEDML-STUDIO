// Core data types for MedML Studio

export type FeatureType = 'continuous' | 'categorical' | 'binary';

export interface Feature {
  name: string;
  type: FeatureType;
  description: string;
  unit?: string;
  normalRange?: { min: number; max: number };
  categories?: string[];
}

export interface SyntheticDataPoint {
  id: string;
  features: Record<string, number | string>;
  outcome: number; // 0 or 1 for binary classification
  metadata?: {
    age?: number;
    sex?: string;
    [key: string]: any;
  };
}

export interface SyntheticDataset {
  id: string;
  name: string;
  description: string;
  clinicalContext: string;
  features: Feature[];
  data: SyntheticDataPoint[];
  outcomeLabel: string;
  size: number;
  prevalence: number; // outcome prevalence
  createdAt: string;
}

export type ModelType =
  | 'logistic_regression'
  | 'decision_tree'
  | 'random_forest'
  | 'gradient_boosting'
  | 'neural_network';

export interface ModelConfig {
  type: ModelType;
  hyperparameters: Record<string, any>;
}

export interface TrainedModel {
  id: string;
  name: string;
  type: ModelType;
  config: ModelConfig;
  datasetId: string;
  trainedAt: string;
  metrics: PerformanceMetrics;
  featureImportance: FeatureImportance[];
  calibrationData?: CalibrationData;
}

export interface PerformanceMetrics {
  accuracy: number;
  sensitivity: number;
  specificity: number;
  ppv: number;
  npv: number;
  auc: number;
  brier: number;
  f1Score: number;
  confusionMatrix: {
    tp: number;
    tn: number;
    fp: number;
    fn: number;
  };
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  rank: number;
}

export interface CalibrationData {
  bins: CalibrationBin[];
  calibrationSlope: number;
  calibrationIntercept: number;
}

export interface CalibrationBin {
  predictedProbability: number;
  observedProbability: number;
  count: number;
}

export interface SHAPValue {
  feature: string;
  value: number;
  baseValue: number;
  featureValue: number | string;
}

export interface LIMEExplanation {
  feature: string;
  weight: number;
  featureValue: number | string;
}

export interface Prediction {
  probability: number;
  class: number;
  confidence: number;
  shapValues?: SHAPValue[];
  limeExplanation?: LIMEExplanation[];
}

export interface DecisionBoundaryPoint {
  x: number;
  y: number;
  prediction: number;
}

export interface PartialDependencePlot {
  feature: string;
  values: number[];
  partialDependence: number[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  prerequisites: string[];
  bloomLevel: BloomLevel;
  topics: Topic[];
  learningObjectives: string[];
  estimatedTime: number; // minutes
  completed?: boolean;
}

export type BloomLevel =
  | 'remember'
  | 'understand'
  | 'apply'
  | 'analyze'
  | 'evaluate'
  | 'create';

export interface Topic {
  id: string;
  title: string;
  content: string;
  type: 'concept' | 'interactive' | 'example' | 'case_study';
  interactiveId?: string;
}

export interface Assessment {
  id: string;
  moduleId: string;
  questions: Question[];
  passingScore: number;
}

export interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'scenario' | 'interpretation';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  bloomLevel: BloomLevel;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface UserProgress {
  userId: string;
  completedModules: string[];
  assessmentScores: Record<string, number>;
  timeSpent: Record<string, number>; // moduleId -> minutes
  lastActive: string;
  currentModule?: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  category: 'ml' | 'statistics' | 'clinical' | 'ethics' | 'explainability';
  relatedTerms: string[];
  example?: string;
}

export interface ClinicalCase {
  id: string;
  title: string;
  description: string;
  patientData: SyntheticDataPoint;
  modelPredictions: Record<string, Prediction>; // modelId -> prediction
  clinicalContext: string;
  ethicalConsiderations: string[];
  learningObjectives: string[];
  questions: Question[];
}

export interface BiasMetrics {
  demographicParity: number;
  equalizedOdds: {
    tprDifference: number;
    fprDifference: number;
  };
  predictiveParity: number;
  calibrationByGroup: Record<string, CalibrationData>;
}

export interface FairnessAnalysis {
  modelId: string;
  protectedAttribute: string;
  groups: string[];
  biasMetrics: BiasMetrics;
  recommendations: string[];
}
