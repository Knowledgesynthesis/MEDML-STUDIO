// Group-wise performance and the standard group-fairness criteria.
// Definitions: Hardt, Price & Srebro, NeurIPS 2016 (equalized odds / equal opportunity);
// Chouldechova, Big Data 2017 and Kleinberg, Mullainathan & Raghavan, ITCS 2017 (incompatibility results).

import { auroc, calibrationStats, classificationStats } from './metrics';

export interface GroupReport {
  group: number;
  label: string;
  n: number;
  prevalence: number;
  meanPredicted: number;
  oe: number;
  auroc: number;
  calIntercept: number;
  selectionRate: number;
  tpr: number;
  fpr: number;
  ppv: number;
  npv: number;
  threshold: number;
}

export function groupReports(p: number[], y: number[], group: number[], labels: [string, string], thresholds: [number, number]): GroupReport[] {
  return [0, 1].map((g) => {
    const idx = group.map((v, i) => (v === g ? i : -1)).filter((i) => i >= 0);
    const pg = idx.map((i) => p[i]);
    const yg = idx.map((i) => y[i]);
    const c = classificationStats(pg, yg, thresholds[g]);
    const cal = calibrationStats(pg, yg);
    return {
      group: g,
      label: labels[g],
      n: idx.length,
      prevalence: yg.reduce((s, v) => s + v, 0) / idx.length,
      meanPredicted: pg.reduce((s, v) => s + v, 0) / idx.length,
      oe: cal.oe,
      auroc: auroc(pg, yg),
      calIntercept: cal.intercept,
      selectionRate: c.flaggedRate,
      tpr: c.sensitivity,
      fpr: 1 - c.specificity,
      ppv: c.ppv,
      npv: c.npv,
      threshold: thresholds[g],
    };
  });
}
