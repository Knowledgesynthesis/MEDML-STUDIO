import { useState } from 'react';
import { Slider, Segmented, Stat, Loading, Legend, Toggle, Callout } from '@/components/ui';
import { Chart, Line, Dots, VLine, Diagonal, Bars, histogram } from '@/components/chart/Chart';
import { WidgetFrame } from './Frame';
import { fx, pct, cn } from '@/lib/utils';
import { getCohort, getPreds, useComputed, STANDARD_SPECS } from '@/lib/lab';
import { fitModel, MODEL_INFO, type ModelKind, type ModelSpec } from '@/lib/ml/pipeline';
import { auroc, calibrationCurve, calibrationStats, classificationStats, decisionCurve, prCurve, recalibrator, rocCurve, brier } from '@/lib/ml/metrics';
import { Rng, mean } from '@/lib/ml/stats';
import { KIND_COLOR } from './ModelWidgets';

/* ───────────── Threshold explorer ───────────── */

export function ThresholdWidget() {
  const [t, setT] = useState(0.2);
  const r = useComputed(() => {
    const c = getCohort('sepsis');
    const p = getPreds('sepsis', STANDARD_SPECS.logistic_quadratic, 'test');
    return { p, y: c.yte, roc: rocCurve(p, c.yte), pr: prCurve(p, c.yte), auc: auroc(p, c.yte) };
  }, ['thr']);
  if (!r) return <Loading />;
  const st = classificationStats(r.p, r.y, t);
  const prev = mean(r.y);
  const ev = histogram(r.p.filter((_, i) => r.y[i] === 1), 0, 1, 40);
  const ne = histogram(r.p.filter((_, i) => r.y[i] === 0), 0, 1, 40);
  const maxC = Math.max(...ev.map((b) => b.v), ...ne.map((b) => b.v));
  const per1000 = (v: number) => Math.round((v / r.p.length) * 1000);
  return (
    <WidgetFrame title="One model, many classifiers: choosing a threshold" tryThis="lower the threshold until sensitivity reaches 90%. Count the false alarms per 1,000 ED patients, then check how many alerts you need per true case.">
      <Slider label="Alert when predicted risk ≥" value={t} min={0.02} max={0.8} step={0.01} onChange={setT} format={(v) => pct(v)} />
      <Chart x={[0, 1]} y={[-maxC, maxC]} xLabel="Predicted risk of sepsis" yLabel="Patients" yFormat={(v) => String(Math.abs(Math.round(v)))} xFormat={(v) => pct(v)} ariaLabel="Mirrored histogram of predicted risks: events above, non-events below" maxHeight={260}>
        {(s) => (
          <>
            <Bars s={s} bins={ev} color="var(--c2)" opacity={0.8} />
            <Bars s={s} bins={ne} color="var(--c1)" opacity={0.6} down />
            <VLine s={s} x={t} label="threshold" />
          </>
        )}
      </Chart>
      <Legend
        items={[
          { color: 'var(--c2)', label: 'Developed sepsis (above axis)' },
          { color: 'var(--c1)', label: 'Did not (below axis)' },
        ]}
      />
      <div className="grid gap-4 md:grid-cols-[auto_1fr]">
        <div>
          <div className="mb-1 text-xs font-medium text-muted-fg">Per 1,000 ED patients (prevalence {pct(prev)})</div>
          <div className="grid grid-cols-[auto_1fr_1fr] gap-1 text-center text-sm">
            <div />
            <div className="text-xs text-muted-fg">Sepsis</div>
            <div className="text-xs text-muted-fg">No sepsis</div>
            <div className="self-center pr-1 text-right text-xs text-muted-fg">Alert</div>
            <div className="num rounded bg-c2/20 p-2 font-mono">{per1000(st.tp)}</div>
            <div className="num rounded bg-c1/15 p-2 font-mono">{per1000(st.fp)}</div>
            <div className="self-center pr-1 text-right text-xs text-muted-fg">No alert</div>
            <div className="num rounded bg-bad/15 p-2 font-mono">{per1000(st.fn)}</div>
            <div className="num rounded bg-muted p-2 font-mono">{per1000(st.tn)}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Stat label="Sensitivity" value={pct(st.sensitivity)} />
          <Stat label="Specificity" value={pct(st.specificity)} />
          <Stat label="PPV" value={pct(st.ppv)} />
          <Stat label="NPV" value={pct(st.npv, 1)} />
          <Stat label="Alerts per true case" value={fx(st.nnAlert, 1)} tone={st.nnAlert > 5 ? 'warn' : undefined} />
          <Stat label="Patients flagged" value={pct(st.flaggedRate)} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="mb-1 text-sm font-medium">ROC curve (AUROC {fx(r.auc, 3)})</div>
          <Chart x={[0, 1]} y={[0, 1]} square maxHeight={280} xLabel="1 − specificity" yLabel="Sensitivity" xFormat={(v) => fx(v, 1)} yFormat={(v) => fx(v, 1)} ariaLabel="ROC curve with operating point">
            {(s) => (
              <>
                <Diagonal s={s} />
                <Line s={s} pts={r.roc.map((q) => [q.fpr, q.tpr])} color="var(--c1)" />
                <Dots s={s} pts={[[1 - st.specificity, st.sensitivity]]} color="var(--c2)" r={6} />
              </>
            )}
          </Chart>
        </div>
        <div>
          <div className="mb-1 text-sm font-medium">Precision–recall (AP {fx(r.pr.averagePrecision, 3)})</div>
          <Chart x={[0, 1]} y={[0, 1]} square maxHeight={280} xLabel="Recall (sensitivity)" yLabel="Precision (PPV)" xFormat={(v) => fx(v, 1)} yFormat={(v) => fx(v, 1)} ariaLabel="Precision-recall curve with operating point">
            {(s) => (
              <>
                <line x1={s.x(0)} x2={s.x(1)} y1={s.y(prev)} y2={s.y(prev)} stroke="var(--muted-fg)" strokeDasharray="4 4" />
                <Line s={s} pts={r.pr.points.map((q) => [q.recall, q.precision])} color="var(--c3)" />
                <Dots s={s} pts={[[st.sensitivity, st.ppv]]} color="var(--c2)" r={6} />
              </>
            )}
          </Chart>
        </div>
      </div>
      <p className="text-xs text-muted-fg">
        Accuracy at this threshold is {pct(st.accuracy)} and F1 is {fx(st.f1, 2)}. Both reward getting the majority class right and ignore how much a missed case costs compared with a false alarm. Van Calster et al. (2025) classify them as
        improper for clinical thresholds.
      </p>
    </WidgetFrame>
  );
}

/* ───────────── Calibration lab ───────────── */

const CAL_MODELS: { id: string; label: string; spec: ModelSpec }[] = [
  { id: 'lr2', label: 'LR + squared terms', spec: STANDARD_SPECS.logistic_quadratic },
  { id: 'tree', label: 'Deep tree (depth 10)', spec: { kind: 'tree', depth: 10, minLeaf: 2 } },
  { id: 'forest', label: 'Random forest', spec: STANDARD_SPECS.forest },
  { id: 'boost', label: 'Boosting, 400 rounds', spec: { kind: 'boosting', nTrees: 400, depth: 4, minLeaf: 5 } },
  { id: 'mlp', label: 'Neural net', spec: STANDARD_SPECS.mlp },
];

export function CalibrationWidget() {
  const [id, setId] = useState('lr2');
  const [recal, setRecal] = useState(false);
  const r = useComputed(() => {
    const c = getCohort('sepsis');
    const m = CAL_MODELS.find((x) => x.id === id)!;
    const p = getPreds('sepsis', m.spec, 'test');
    // recalibration: fit on even-indexed test patients, evaluate on odd-indexed ones
    const fitIdx = p.map((_, i) => i).filter((i) => i % 2 === 0);
    const evalIdx = p.map((_, i) => i).filter((i) => i % 2 === 1);
    const f = recalibrator(fitIdx.map((i) => p[i]), fitIdx.map((i) => c.yte[i]));
    const pe = evalIdx.map((i) => p[i]);
    const ye = evalIdx.map((i) => c.yte[i]);
    const pr = pe.map(f);
    const out = (pp: number[]) => ({ curve: calibrationCurve(pp, ye, 8), stats: calibrationStats(pp, ye), auc: auroc(pp, ye), brier: brier(pp, ye), p: pp });
    return { raw: out(pe), recal: out(pr) };
  }, [id]);
  const cur = r ? (recal ? r.recal : r.raw) : null;
  return (
    <WidgetFrame title="Calibration: do 20% predictions come true 20% of the time?" tryThis="compare logistic regression with the deep tree and the 400-round boosting model, then turn on recalibration. Notice that AUROC does not change.">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented label="Model" value={id} onChange={setId} options={CAL_MODELS.map((m) => ({ value: m.id, label: m.label }))} />
      </div>
      <Toggle checked={recal} onChange={setRecal} label="Apply logistic recalibration (estimated on half of the test set, shown on the other half)" />
      {!cur ? (
        <Loading />
      ) : (
        <>
          <Chart x={[0, 1]} y={[0, 1]} square maxHeight={360} xLabel="Predicted risk" yLabel="Observed proportion (95% CI)" xFormat={(v) => pct(v)} yFormat={(v) => pct(v)} ariaLabel="Calibration plot">
            {(s) => (
              <>
                <Diagonal s={s} />
                <Bars s={s} bins={histogram(cur.p, 0, 1, 50).map((b) => ({ ...b, v: (b.v / cur.p.length) * 2.5 }))} color="var(--c5)" opacity={0.35} />
                {cur.curve.map((b, i) => (
                  <line key={i} x1={s.x(b.predicted)} x2={s.x(b.predicted)} y1={s.y(b.lo)} y2={s.y(b.hi)} stroke="var(--c1)" strokeWidth={1.5} />
                ))}
                <Line s={s} pts={cur.curve.map((b) => [b.predicted, b.observed])} color="var(--c1)" width={2.5} />
                <Dots s={s} pts={cur.curve.map((b) => [b.predicted, b.observed])} color="var(--c1)" r={4} />
              </>
            )}
          </Chart>
          <p className="text-xs text-muted-fg">Grey bars at the bottom show how often each predicted risk occurs. Points are octiles of predicted risk.</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Stat label="Calibration slope" value={fx(cur.stats.slope, 2)} sub={cur.stats.slope < 0.8 ? 'too extreme' : cur.stats.slope > 1.2 ? 'too modest' : 'ideal ≈ 1'} tone={Math.abs(cur.stats.slope - 1) > 0.2 ? 'warn' : 'good'} />
            <Stat label="Calibration-in-the-large" value={fx(cur.stats.intercept, 2)} sub="ideal 0" tone={Math.abs(cur.stats.intercept) > 0.2 ? 'warn' : 'good'} />
            <Stat label="Observed / expected" value={fx(cur.stats.oe, 2)} sub="ideal 1" />
            <Stat label="AUROC" value={fx(cur.auc, 3)} sub="unchanged by monotone recalibration" />
            <Stat label="Brier" value={fx(cur.brier, 4)} />
          </div>
        </>
      )}
    </WidgetFrame>
  );
}

/* ───────────── Class-imbalance "corrections" ───────────── */

function rebalance(X: number[][], y: number[], how: 'none' | 'under' | 'over', seed = 4): { X: number[][]; y: number[] } {
  if (how === 'none') return { X, y };
  const rng = new Rng(seed);
  const pos = y.map((v, i) => (v ? i : -1)).filter((i) => i >= 0);
  const neg = y.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
  let idx: number[];
  if (how === 'under') idx = [...pos, ...rng.shuffle(neg).slice(0, pos.length)];
  else idx = [...neg, ...pos, ...Array.from({ length: neg.length - pos.length }, () => pos[rng.int(pos.length)])];
  return { X: idx.map((i) => X[i]), y: idx.map((i) => y[i]) };
}

export function ImbalanceWidget() {
  const r = useComputed(() => {
    const c = getCohort('sepsis');
    const variants = (['none', 'under', 'over'] as const).map((how) => {
      const d = rebalance(c.Xtr, c.ytr, how);
      const m = fitModel(STANDARD_SPECS.logistic_quadratic, c.ds.features, d.X, d.y);
      const p = m.predict(c.Xte);
      return { how, p, auc: auroc(p, c.yte), cal: calibrationStats(p, c.yte), curve: calibrationCurve(p, c.yte, 8), at50: classificationStats(p, c.yte, 0.5), meanP: mean(p) };
    });
    // threshold on the original model that gives the same sensitivity as the undersampled model at 0.5
    const base = variants[0];
    const targetSens = variants[1].at50.sensitivity;
    let match = 0.5;
    for (let t = 0.5; t > 0.01; t -= 0.005) {
      if (classificationStats(base.p, c.yte, t).sensitivity >= targetSens) {
        match = t;
        break;
      }
    }
    return { variants, prev: mean(c.yte), match, matchStats: classificationStats(base.p, c.yte, match) };
  }, ['imbalance']);
  const names = { none: 'No correction', under: 'Random undersampling (1:1)', over: 'Random oversampling (1:1)' };
  const colors = { none: 'var(--c1)', under: 'var(--c2)', over: 'var(--c4)' };
  return (
    <WidgetFrame title="Does “fixing” class imbalance help?">
      {!r ? (
        <Loading />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-fg">
                  <th className="py-1.5">Training data</th>
                  <th className="py-1.5 text-right">AUROC</th>
                  <th className="py-1.5 text-right">Mean predicted risk</th>
                  <th className="py-1.5 text-right">Cal. intercept</th>
                  <th className="py-1.5 text-right">Sens / spec at 0.5</th>
                </tr>
              </thead>
              <tbody>
                {r.variants.map((v) => (
                  <tr key={v.how} className="border-b">
                    <td className="py-1.5">
                      <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ background: colors[v.how] }} />
                      {names[v.how]}
                    </td>
                    <td className="num py-1.5 text-right font-mono">{fx(v.auc, 3)}</td>
                    <td className={cn('num py-1.5 text-right font-mono', v.how !== 'none' && 'text-bad')}>{pct(v.meanP, 1)}</td>
                    <td className={cn('num py-1.5 text-right font-mono', v.how !== 'none' && 'text-bad')}>{fx(v.cal.intercept, 2)}</td>
                    <td className="num py-1.5 text-right font-mono">
                      {pct(v.at50.sensitivity)} / {pct(v.at50.specificity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm">
            Observed prevalence in the test set: <strong>{pct(r.prev, 1)}</strong>. Rebalancing leaves discrimination unchanged and inflates every risk estimate. The apparent gain in
            sensitivity at 0.5 is the same as lowering the threshold on the uncorrected model to <strong>{pct(r.match)}</strong>, which gives sensitivity{' '}
            {pct(r.matchStats.sensitivity)} and specificity {pct(r.matchStats.specificity)} with calibrated risks.
          </p>
          <Chart x={[0, 1]} y={[0, 1]} square maxHeight={300} xLabel="Predicted risk" yLabel="Observed proportion" xFormat={(v) => pct(v)} yFormat={(v) => pct(v)} ariaLabel="Calibration curves with and without rebalancing">
            {(s) => (
              <>
                <Diagonal s={s} />
                {r.variants.map((v) => (
                  <g key={v.how}>
                    <Line s={s} pts={v.curve.map((b) => [b.predicted, b.observed])} color={colors[v.how]} width={2.5} />
                    <Dots s={s} pts={v.curve.map((b) => [b.predicted, b.observed])} color={colors[v.how]} r={3} />
                  </g>
                ))}
              </>
            )}
          </Chart>
          <Legend items={r.variants.map((v) => ({ color: colors[v.how], label: names[v.how] }))} />
          <Callout kind="evidence">
            van den Goorbergh et al. (JAMIA 2022) found the same in simulations and a real ovarian-cancer dataset. Undersampling, oversampling and SMOTE did not improve AUROC and
            produced strongly miscalibrated risks. If you need more sensitivity, change the threshold instead.
          </Callout>
        </>
      )}
    </WidgetFrame>
  );
}

/* ───────────── Decision curve analysis ───────────── */

export function DcaWidget() {
  const [pt, setPt] = useState(0.1);
  const kinds: ModelKind[] = ['logistic_quadratic', 'tree', 'boosting'];
  const r = useComputed(() => {
    const c = getCohort('sepsis');
    const grid = Array.from({ length: 50 }, (_, i) => 0.01 + i * 0.01);
    return {
      prev: mean(c.yte),
      curves: kinds.map((k) => ({ k, pts: decisionCurve(getPreds('sepsis', STANDARD_SPECS[k], 'test'), c.yte, grid) })),
      at: (ptv: number) =>
        kinds.map((k) => {
          const d = decisionCurve(getPreds('sepsis', STANDARD_SPECS[k], 'test'), c.yte, [ptv])[0];
          return { k, ...d };
        }),
    };
  }, ['dca']);
  if (!r) return <Loading />;
  const rows = r.at(pt);
  const odds = pt / (1 - pt);
  const yMax = r.prev * 1.05;
  return (
    <WidgetFrame title="Decision curve: is using the model better than treating all or none?" tryThis="slide the threshold. At 5% the model barely beats “treat all”, and above about 40% the model's benefit approaches zero. Decide which range matches your clinical action.">
      <Slider
        label="Threshold probability pₜ"
        value={pt}
        min={0.01}
        max={0.5}
        step={0.01}
        onChange={setPt}
        format={(v) => pct(v)}
        hint={`Choosing ${pct(pt)} means you accept ${fx(1 / odds, 1)} unnecessary work-ups to find one true case (harm:benefit = 1:${fx(1 / odds, 1)}).`}
      />
      <Chart x={[0, 0.5]} y={[-0.05, yMax]} xLabel="Threshold probability" yLabel="Net benefit" xFormat={(v) => pct(v)} yFormat={(v) => fx(v, 2)} ariaLabel="Decision curves">
        {(s) => (
          <>
            <line x1={s.x(0)} x2={s.x(0.5)} y1={s.y(0)} y2={s.y(0)} stroke="var(--fg)" strokeWidth={1.5} />
            <Line s={s} pts={r.curves[0].pts.map((d) => [d.pt, d.all])} color="var(--c5)" width={2} dashed />
            {r.curves.map((c) => (
              <Line key={c.k} s={s} pts={c.pts.map((d) => [d.pt, d.model])} color={KIND_COLOR[c.k]} width={2.5} />
            ))}
            <VLine s={s} x={pt} />
          </>
        )}
      </Chart>
      <Legend
        items={[
          ...kinds.map((k) => ({ color: KIND_COLOR[k], label: MODEL_INFO[k].name })),
          { color: 'var(--c5)', label: 'Treat all', dashed: true },
          { color: 'var(--fg)', label: 'Treat none' },
        ]}
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-fg">
              <th className="py-1.5">At pₜ = {pct(pt)}</th>
              <th className="py-1.5 text-right">Net benefit</th>
              <th className="py-1.5 text-right">vs treat all</th>
              <th className="py-1.5 text-right">Unnecessary work-ups avoided / 100</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.k} className="border-b">
                <td className="py-1.5">{MODEL_INFO[d.k].name}</td>
                <td className="num py-1.5 text-right font-mono">{fx(d.model, 3)}</td>
                <td className={cn('num py-1.5 text-right font-mono', d.model - Math.max(d.all, 0) <= 0 ? 'text-bad' : 'text-good')}>{fx(d.model - Math.max(d.all, 0), 3)}</td>
                <td className="num py-1.5 text-right font-mono">{fx(((d.model - d.all) / odds) * 100, 1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-fg">
        Net benefit is in units of true positives per patient: 0.05 means 5 true cases found per 100 patients with no false positives, after the false positives are paid for at the
        chosen exchange rate. Treat-all net benefit equals prevalence ({pct(r.prev, 1)}) at pₜ → 0.
      </p>
    </WidgetFrame>
  );
}
