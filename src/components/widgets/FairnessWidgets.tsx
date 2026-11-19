import { useState } from 'react';
import { Segmented, Slider, Stat, Loading, Legend, Toggle, Callout } from '@/components/ui';
import { Chart, Line, Dots, Diagonal } from '@/components/chart/Chart';
import { HBars } from '@/components/chart/HBars';
import { WidgetFrame } from './Frame';
import { fx, pct, cn } from '@/lib/utils';
import { useComputed } from '@/lib/lab';
import { makeCareCohort, makeDiabetes } from '@/lib/data/datasets';
import { fitModel, pick, stratifiedSplit } from '@/lib/ml/pipeline';
import { calibrationCurve } from '@/lib/ml/metrics';
import { groupReports } from '@/lib/ml/fairness';
import type { FeatureMeta } from '@/lib/ml/preprocess';
import { mean } from '@/lib/ml/stats';

const diabetesCache = new Map<string, { p: number[]; y: number[]; g: number[] }>();

function diabetesScores(bias: number, withGroup: boolean) {
  const k = `${bias}|${withGroup}`;
  let v = diabetesCache.get(k);
  if (!v) {
    const ds = makeDiabetes(2400, 123, { a1cBiasB: bias });
    const s = stratifiedSplit(ds.y, 0.3, 2024);
    const meta: FeatureMeta[] = withGroup ? [...ds.features, { key: 'groupB', label: 'Group B', type: 'binary', description: 'Population group indicator' }] : ds.features;
    const X = withGroup ? ds.X.map((r, i) => [...r, ds.group[i]]) : ds.X;
    const m = fitModel({ kind: 'logistic', l2: 1 }, meta, pick(X, s.train), pick(ds.y, s.train));
    v = { p: m.predict(pick(X, s.test)), y: pick(ds.y, s.test), g: pick(ds.group, s.test) };
    diabetesCache.set(k, v);
  }
  return v;
}

export function FairnessWidget() {
  const [bias, setBias] = useState(0);
  const [withGroup, setWithGroup] = useState(false);
  const [linked, setLinked] = useState(true);
  const [tA, setTA] = useState(0.2);
  const [tB, setTB] = useState(0.2);
  const r = useComputed(() => diabetesScores(bias, withGroup), [bias, withGroup]);
  const thB = linked ? tA : tB;
  const rep = r ? groupReports(r.p, r.y, r.g, ['Group A', 'Group B'], [tA, thB]) : null;
  const curves = r
    ? [0, 1].map((g) => {
        const idx = r.g.map((v, i) => (v === g ? i : -1)).filter((i) => i >= 0);
        return calibrationCurve(idx.map((i) => r.p[i]), idx.map((i) => r.y[i]), 6);
      })
    : [];
  const rows: { label: string; key: keyof NonNullable<typeof rep>[number]; f: (v: number) => string; note?: string }[] = [
    { label: 'Patients (test set)', key: 'n', f: (v) => String(v) },
    { label: '5-year incidence (observed)', key: 'prevalence', f: (v) => pct(v, 1) },
    { label: 'Mean predicted risk', key: 'meanPredicted', f: (v) => pct(v, 1), note: 'calibration-in-the-large' },
    { label: 'Observed / expected', key: 'oe', f: (v) => fx(v, 2), note: '>1 = under-prediction' },
    { label: 'AUROC (within group)', key: 'auroc', f: (v) => fx(v, 3) },
    { label: 'Flagged for prevention programme', key: 'selectionRate', f: (v) => pct(v), note: 'demographic parity' },
    { label: 'Sensitivity (TPR)', key: 'tpr', f: (v) => pct(v), note: 'equal opportunity' },
    { label: 'False-positive rate', key: 'fpr', f: (v) => pct(v), note: 'equalized odds = TPR and FPR' },
    { label: 'PPV', key: 'ppv', f: (v) => pct(v), note: 'predictive parity' },
  ];
  return (
    <WidgetFrame
      title="Fairness audit: one diabetes-prevention model, two groups"
      tryThis="1) With no bias and one shared threshold, compare the O/E ratios. 2) Unlink the thresholds and equalise sensitivity: PPV then diverges. 3) Add HbA1c measurement bias and watch Group B lose sensitivity."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider
          label="HbA1c under-reads in Group B by"
          value={bias}
          min={0}
          max={0.4}
          step={0.2}
          onChange={setBias}
          format={(v) => `${v.toFixed(1)} %-points`}
          hint="Measurement bias: same physiology, lower recorded value (compare pulse oximetry, Sjoding 2020)."
        />
        <div className="space-y-2">
          <Toggle checked={withGroup} onChange={setWithGroup} label="Include group membership as a predictor" />
          <Toggle checked={linked} onChange={setLinked} label="Use one threshold for both groups" />
        </div>
        <Slider label={linked ? 'Threshold (both groups)' : 'Threshold, Group A'} value={tA} min={0.05} max={0.5} step={0.01} onChange={setTA} format={(v) => pct(v)} />
        {!linked && <Slider label="Threshold, Group B" value={tB} min={0.05} max={0.5} step={0.01} onChange={setTB} format={(v) => pct(v)} />}
      </div>
      {!rep ? (
        <Loading />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-fg">
                  <th className="py-1.5">Metric</th>
                  <th className="py-1.5 text-right">Group A</th>
                  <th className="py-1.5 text-right">Group B</th>
                  <th className="py-1.5 pl-3">Fairness criterion</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const a = rep[0][row.key] as number;
                  const b = rep[1][row.key] as number;
                  const gap = row.key !== 'n' && Math.abs(a - b) > (row.key === 'oe' ? 0.15 : row.key === 'auroc' ? 0.05 : 0.05);
                  return (
                    <tr key={row.label} className="border-b">
                      <td className="py-1.5">{row.label}</td>
                      <td className="num py-1.5 text-right font-mono">{row.f(a)}</td>
                      <td className={cn('num py-1.5 text-right font-mono', gap && 'font-semibold text-warn')}>{row.f(b)}</td>
                      <td className="py-1.5 pl-3 text-xs text-muted-fg">{row.note}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Chart x={[0, 0.6]} y={[0, 0.6]} square maxHeight={300} xLabel="Predicted 5-year risk" yLabel="Observed incidence" xFormat={(v) => pct(v)} yFormat={(v) => pct(v)} ariaLabel="Calibration by group">
            {(s) => (
              <>
                <Diagonal s={s} to={0.6} />
                {curves.map((cv, g) => (
                  <g key={g}>
                    <Line s={s} pts={cv.map((b) => [b.predicted, b.observed])} color={g ? 'var(--c2)' : 'var(--c1)'} width={2.5} />
                    <Dots s={s} pts={cv.map((b) => [b.predicted, b.observed])} color={g ? 'var(--c2)' : 'var(--c1)'} r={3.5} />
                  </g>
                ))}
              </>
            )}
          </Chart>
          <Legend
            items={[
              { color: 'var(--c1)', label: 'Group A' },
              { color: 'var(--c2)', label: 'Group B' },
            ]}
          />
          <Callout kind="rule" title="The impossibility result">
            When base rates differ and prediction is imperfect, a risk score cannot simultaneously be calibrated within groups and have equal false-positive <em>and</em> false-negative
            rates across groups (Kleinberg 2017; Chouldechova 2017). Choosing which criterion matters is a clinical and ethical decision about the harms of the specific action, not
            a statistical one.
          </Callout>
        </>
      )}
    </WidgetFrame>
  );
}

/* ───────────── Label-choice bias (Obermeyer 2019 mechanism) ───────────── */

export function LabelBiasWidget() {
  const [label, setLabel] = useState<'cost' | 'need'>('cost');
  const [k, setK] = useState(0.03);
  const r = useComputed(() => {
    const c = makeCareCohort(4000, 77);
    const split = stratifiedSplit(c.labelCost, 0.4, 7);
    const run = (lab: number[]) => {
      const m = fitModel({ kind: 'logistic', l2: 1 }, c.features, pick(c.X, split.train), pick(lab, split.train));
      return m.predict(pick(c.X, split.test));
    };
    return {
      scores: { cost: run(c.labelCost), need: run(c.labelNeed) },
      g: pick(c.group, split.test),
      need: pick(c.needNext, split.test),
    };
  }, ['care']);
  if (!r) return <Loading />;
  const sc = r.scores[label];
  const nSel = Math.max(1, Math.round(sc.length * k));
  const sel = sc
    .map((v, i) => [v, i] as const)
    .sort((a, b) => b[0] - a[0])
    .slice(0, nSel)
    .map(([, i]) => i);
  const shareB = sel.filter((i) => r.g[i] === 1).length / sel.length;
  const popB = mean(r.g);
  const needSel = (g: number) => {
    const ids = sel.filter((i) => r.g[i] === g);
    return ids.length ? mean(ids.map((i) => r.need[i])) : NaN;
  };
  // the best possible selection: the truly neediest patients
  const oracle = r.need
    .map((v, i) => [v, i] as const)
    .sort((a, b) => b[0] - a[0])
    .slice(0, nSel)
    .map(([, i]) => i);
  const shareOracle = oracle.filter((i) => r.g[i] === 1).length / oracle.length;
  return (
    <WidgetFrame title="Same features, different label: who gets into the care-management programme?" tryThis="keep the top 3% (auto-enrolment) and switch the training label from future cost to future health need.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Segmented
          label="Training label"
          value={label}
          onChange={setLabel}
          options={[
            { value: 'cost', label: 'Predict future cost' },
            { value: 'need', label: 'Predict future health need' },
          ]}
        />
        <Slider label="Programme capacity (top x% of scores)" value={k} min={0.01} max={0.2} step={0.01} onChange={setK} format={(v) => pct(v)} />
      </div>
      <HBars
        rows={[
          { label: 'Group B share of population', value: popB, color: 'var(--c5)' },
          { label: 'Group B share of selected', value: shareB, color: label === 'cost' ? 'var(--bad)' : 'var(--good)' },
          { label: 'If we selected by true need', value: shareOracle, color: 'var(--c3)' },
        ]}
        format={(v) => pct(v)}
        domain={[0, Math.max(popB, shareB, shareOracle) * 1.2]}
      />
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Next-year conditions, selected Group A" value={fx(needSel(0), 1)} />
        <Stat label="Next-year conditions, selected Group B" value={fx(needSel(1), 1)} tone={needSel(1) - needSel(0) > 0.3 ? 'bad' : undefined} sub="higher = sicker at the same cut-off" />
      </div>
      <p className="text-xs text-muted-fg">
        In this synthetic cohort, Group B generates 35% less cost for the same illness because of access barriers. The cost model predicts cost accurately and is still biased, because
        cost was the wrong target for “who needs help”. Group membership is not a model input in either case.
      </p>
    </WidgetFrame>
  );
}
