import type { SyntheticDataset, SyntheticDataPoint, Feature } from '@/types';

// Seeded random number generator for reproducibility
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextGaussian(mean: number = 0, std: number = 1): number {
    // Box-Muller transform
    const u1 = this.next();
    const u2 = this.next();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * std + mean;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  choice<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }
}

export function generateSepsisRiskDataset(size: number = 500): SyntheticDataset {
  const rng = new SeededRandom(42);

  const features: Feature[] = [
    {
      name: 'age',
      type: 'continuous',
      description: 'Patient age in years',
      unit: 'years',
      normalRange: { min: 18, max: 90 },
    },
    {
      name: 'temperature',
      type: 'continuous',
      description: 'Body temperature',
      unit: '°C',
      normalRange: { min: 36.5, max: 37.5 },
    },
    {
      name: 'heart_rate',
      type: 'continuous',
      description: 'Heart rate',
      unit: 'bpm',
      normalRange: { min: 60, max: 100 },
    },
    {
      name: 'respiratory_rate',
      type: 'continuous',
      description: 'Respiratory rate',
      unit: 'breaths/min',
      normalRange: { min: 12, max: 20 },
    },
    {
      name: 'wbc_count',
      type: 'continuous',
      description: 'White blood cell count',
      unit: '×10⁹/L',
      normalRange: { min: 4, max: 11 },
    },
    {
      name: 'lactate',
      type: 'continuous',
      description: 'Serum lactate',
      unit: 'mmol/L',
      normalRange: { min: 0.5, max: 2.0 },
    },
    {
      name: 'systolic_bp',
      type: 'continuous',
      description: 'Systolic blood pressure',
      unit: 'mmHg',
      normalRange: { min: 90, max: 140 },
    },
  ];

  const data: SyntheticDataPoint[] = [];

  for (let i = 0; i < size; i++) {
    // Generate outcome first (30% prevalence)
    const outcome = rng.next() < 0.3 ? 1 : 0;

    // Generate features based on outcome
    const age = outcome
      ? rng.nextGaussian(65, 15)
      : rng.nextGaussian(50, 20);

    const temperature = outcome
      ? rng.nextGaussian(38.5, 1.0)
      : rng.nextGaussian(37.0, 0.5);

    const heart_rate = outcome
      ? rng.nextGaussian(110, 20)
      : rng.nextGaussian(75, 15);

    const respiratory_rate = outcome
      ? rng.nextGaussian(24, 6)
      : rng.nextGaussian(16, 3);

    const wbc_count = outcome
      ? rng.nextGaussian(15, 5)
      : rng.nextGaussian(7.5, 2);

    const lactate = outcome
      ? rng.nextGaussian(3.5, 1.5)
      : rng.nextGaussian(1.2, 0.5);

    const systolic_bp = outcome
      ? rng.nextGaussian(95, 15)
      : rng.nextGaussian(120, 15);

    data.push({
      id: `patient_${i}`,
      features: {
        age: Math.max(18, Math.min(90, age)),
        temperature: Math.max(35, Math.min(42, temperature)),
        heart_rate: Math.max(40, Math.min(180, heart_rate)),
        respiratory_rate: Math.max(8, Math.min(40, respiratory_rate)),
        wbc_count: Math.max(0, Math.min(30, wbc_count)),
        lactate: Math.max(0, Math.min(10, lactate)),
        systolic_bp: Math.max(60, Math.min(200, systolic_bp)),
      },
      outcome,
      metadata: {
        age: Math.round(age),
        sex: rng.choice(['M', 'F']),
      },
    });
  }

  return {
    id: 'sepsis_risk_v1',
    name: 'Sepsis Risk Prediction',
    description: 'Synthetic dataset for predicting sepsis risk based on vital signs and lab values',
    clinicalContext:
      'This dataset simulates ED patients being evaluated for potential sepsis. Features include vital signs and basic lab values commonly used in sepsis screening.',
    features,
    data,
    outcomeLabel: 'Sepsis within 48 hours',
    size,
    prevalence: 0.3,
    createdAt: new Date().toISOString(),
  };
}

export function generateDiabetesRiskDataset(size: number = 500): SyntheticDataset {
  const rng = new SeededRandom(123);

  const features: Feature[] = [
    {
      name: 'age',
      type: 'continuous',
      description: 'Patient age in years',
      unit: 'years',
      normalRange: { min: 18, max: 80 },
    },
    {
      name: 'bmi',
      type: 'continuous',
      description: 'Body Mass Index',
      unit: 'kg/m²',
      normalRange: { min: 18.5, max: 24.9 },
    },
    {
      name: 'fasting_glucose',
      type: 'continuous',
      description: 'Fasting blood glucose',
      unit: 'mg/dL',
      normalRange: { min: 70, max: 100 },
    },
    {
      name: 'hba1c',
      type: 'continuous',
      description: 'Hemoglobin A1c',
      unit: '%',
      normalRange: { min: 4, max: 5.6 },
    },
    {
      name: 'family_history',
      type: 'binary',
      description: 'Family history of diabetes',
      categories: ['No', 'Yes'],
    },
    {
      name: 'physical_activity',
      type: 'continuous',
      description: 'Physical activity level (hours per week)',
      unit: 'hours/week',
      normalRange: { min: 2.5, max: 7 },
    },
  ];

  const data: SyntheticDataPoint[] = [];

  for (let i = 0; i < size; i++) {
    const outcome = rng.next() < 0.25 ? 1 : 0;

    const age = outcome
      ? rng.nextGaussian(55, 12)
      : rng.nextGaussian(40, 15);

    const bmi = outcome
      ? rng.nextGaussian(32, 6)
      : rng.nextGaussian(25, 4);

    const fasting_glucose = outcome
      ? rng.nextGaussian(115, 20)
      : rng.nextGaussian(90, 10);

    const hba1c = outcome
      ? rng.nextGaussian(6.2, 0.8)
      : rng.nextGaussian(5.2, 0.4);

    const family_history = outcome
      ? (rng.next() < 0.7 ? 1 : 0)
      : (rng.next() < 0.3 ? 1 : 0);

    const physical_activity = outcome
      ? rng.nextGaussian(2, 1.5)
      : rng.nextGaussian(4, 2);

    data.push({
      id: `patient_${i}`,
      features: {
        age: Math.max(18, Math.min(80, age)),
        bmi: Math.max(15, Math.min(50, bmi)),
        fasting_glucose: Math.max(60, Math.min(200, fasting_glucose)),
        hba1c: Math.max(4, Math.min(12, hba1c)),
        family_history,
        physical_activity: Math.max(0, Math.min(20, physical_activity)),
      },
      outcome,
      metadata: {
        age: Math.round(age),
        sex: rng.choice(['M', 'F']),
      },
    });
  }

  return {
    id: 'diabetes_risk_v1',
    name: 'Type 2 Diabetes Risk',
    description: 'Synthetic dataset for predicting type 2 diabetes risk',
    clinicalContext:
      'This dataset simulates primary care patients being screened for diabetes risk. Features include demographic data, BMI, glucose levels, and lifestyle factors.',
    features,
    data,
    outcomeLabel: 'Type 2 Diabetes Diagnosis',
    size,
    prevalence: 0.25,
    createdAt: new Date().toISOString(),
  };
}

export function getAllDatasets(): SyntheticDataset[] {
  return [
    generateSepsisRiskDataset(500),
    generateDiabetesRiskDataset(500),
  ];
}
