import { useState } from 'react';
import { Slider, Stat, Loading, Callout } from '@/components/ui';
import { HBars } from '@/components/chart/HBars';
import { WidgetFrame } from './Frame';
import { fx, pct } from '@/lib/utils';
import { getCohort, getModel, useComputed, STANDARD_SPECS } from '@/lib/lab';
import { fitModel, oddsRatios } from '@/lib/ml/pipeline';
import { auroc, calibrationStats } from '@/lib/ml/metrics';
import { rileySampleSize } from '@/lib/ml/samplesize';
import type { FeatureMeta } from '@/lib/ml/preprocess';

/** Target leakage: a predictor recorded after the prediction time looks brilliant retrospectively and adds nothing prospectively. */
export function LeakageWidget() {
  const r = useComputed(() => {
    const c = getCohort('sepsis');
    const abx = c.ds.extra.abxAny;
    const abxT0 = c.ds.extra.abxAtT0;
    const meta: FeatureMeta[] = [...c.ds.features, { key: 'abx', label: 'IV antibiotics ordered', type: 'binary', description: 'Any time during the encounter' }];
    const rows = (idx: number[], col: number[]) => idx.map((i) => [...c.ds.X[i], col[i]]);
    const clean = getModel('sepsis', STANDARD_SPECS.logistic_quadratic);
    const leaky = fitModel(STANDARD_SPECS.logistic_quadratic, meta, rows(c.train, abx), c.ytr);
    // the decision that matters: patients clinicians have not yet recognised at triage
    const unrec = c.test.filter((i) => abxT0[i] === 0);
    const yU = unrec.map((i) => c.ds.y[i]);
    const pClean = clean.predict(unrec.map((i) => c.ds.X[i]));
    const pLeak = leaky.predict(rows(unrec, abxT0));
    const orAbx = oddsRatios(leaky).find((o) => o.column.name === 'abx');
    return {
      retro: auroc(leaky.predict(rows(c.test, abx)), c.yte),
      cleanU: auroc(pClean, yU),
      leakU: auroc(pLeak, yU),
      leakCal: calibrationStats(pLeak, yU),
      meanLeak: pLeak.reduce((s, v) => s + v, 0) / pLeak.length,
      prevU: yU.reduce((s, v) => s + v, 0) / yU.length,
      nU: unrec.length,
      or: orAbx?.or ?? NaN,
    };
  }, ['leak']);
  return (
    <WidgetFrame title="Target leakage: the antibiotic-order shortcut">
      <p className="text-sm">
        Suppose the training extract includes “IV antibiotics ordered during the encounter”. Antibiotics are usually ordered <em>after</em> clinicians already suspect sepsis,
        so this feature partly encodes the answer. The model is meant to help at triage, for patients whom clinicians have <em>not yet</em> recognised.
      </p>
      {!r ? (
        <Loading />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Stat label="Leaky model, retrospective validation" value={fx(r.retro, 3)} sub={`AUROC on all test patients (antibiotic OR ≈ ${fx(r.or, 0)})`} tone="good" />
            <Stat label="Leaky model at triage, not-yet-recognised patients" value={fx(r.leakU, 3)} sub={`AUROC, n = ${r.nU}`} tone="bad" />
            <Stat label="Clean model, same patients" value={fx(r.cleanU, 3)} sub="no leaked feature" />
          </div>
          <p className="text-sm">
            All of the apparent gain came from leakage: where the model is actually needed, it is no better than the clean model. It is also badly miscalibrated there. Mean
            predicted risk is <strong>{pct(r.meanLeak, 1)}</strong> against an observed <strong>{pct(r.prevU, 1)}</strong> (calibration intercept {fx(r.leakCal.intercept, 2)}),
            because it learned that “no antibiotics” means “low risk”.
          </p>
          <Callout kind="evidence">
            Kamran et al. (NEJM AI 2024) found the same pattern for a widely deployed sepsis model. AUROC was ≈ 0.87 over the whole stay, ≈ 0.62 when restricted to predictions
            made before sepsis criteria were met, and ≈ 0.47 before the first treatment indicator.
          </Callout>
        </>
      )}
    </WidgetFrame>
  );
}

/** Informative missingness: whether a test was ordered is itself a clinical signal. */
export function MissingnessWidget() {
  const r = useComputed(() => {
    const c = getCohort('sepsis');
    const lacIdx = 6;
    const measured = c.ds.X.map((row) => !Number.isNaN(row[lacIdx]));
    const rate = (flag: boolean) => {
      const ids = measured.map((m, i) => (m === flag ? i : -1)).filter((i) => i >= 0);
      return { n: ids.length, rate: ids.reduce((s, i) => s + c.ds.y[i], 0) / ids.length };
    };
    const m = getModel('sepsis', STANDARD_SPECS.logistic);
    const ors = oddsRatios(m);
    return { yes: rate(true), no: rate(false), missOr: ors.find((o) => o.column.kind === 'missing') };
  }, ['miss']);
  if (!r) return <Loading label="Summarising cohort…" />;
  return (
    <WidgetFrame title="Missing is not random: lactate in the ED cohort">
      <HBars
        rows={[
          { label: 'Lactate measured', sub: `n = ${r.yes.n}`, value: r.yes.rate, color: 'var(--c2)' },
          { label: 'Lactate not measured', sub: `n = ${r.no.n}`, value: r.no.rate, color: 'var(--c1)' },
        ]}
        format={(v) => pct(v, 1)}
        domain={[0, Math.max(r.yes.rate, r.no.rate) * 1.15]}
      />
      {r.missOr && (
        <p className="text-sm">
          In a logistic model with median imputation, the indicator “lactate not measured” has an adjusted odds ratio of <strong>{fx(r.missOr.or, 2)}</strong> (95% CI{' '}
          {fx(r.missOr.lo, 2)}–{fx(r.missOr.hi, 2)}). The model is learning <em>clinician behaviour</em>. That is useful only while ordering habits stay the same. Introduce a
          lactate-for-everyone protocol and the signal disappears. The Module 10 lab lets you test what that does to performance.
        </p>
      )}
    </WidgetFrame>
  );
}

/** Riley et al. (BMJ 2020) minimum sample size versus the obsolete 10-events-per-variable rule. */
export function SampleSizeWidget() {
  const [prev, setPrev] = useState(0.15);
  const [P, setP] = useState(20);
  const [c, setC] = useState(0.78);
  const r = rileySampleSize({ prevalence: prev, parameters: P, cStatistic: c });
  const epv10 = Math.ceil((10 * P) / prev);
  return (
    <WidgetFrame title="How many patients do you need to develop a model?" tryThis="set 30 candidate parameters, prevalence 5%, C = 0.75 and compare with the 10-EPV rule.">
      <div className="grid gap-4 sm:grid-cols-3">
        <Slider label="Outcome prevalence" value={prev} min={0.01} max={0.5} step={0.01} onChange={setPrev} format={(v) => pct(v)} />
        <Slider
          label="Candidate predictor parameters"
          value={P}
          min={1}
          max={60}
          step={1}
          onChange={setP}
          format={(v) => String(v)}
          hint="Count every coefficient: spline terms, categories, interactions."
        />
        <Slider label="Anticipated C-statistic" value={c} min={0.6} max={0.95} step={0.01} onChange={setC} format={(v) => fx(v, 2)} hint="From similar published models; be conservative." />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-1.5 pr-2">Criterion</th>
              <th className="py-1.5 pr-2">Purpose</th>
              <th className="num py-1.5 text-right">Min. n</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-1.5 pr-2">1. Shrinkage ≥ 0.90</td>
              <td className="py-1.5 pr-2 text-muted-fg">Limit overfitting of predictor effects</td>
              <td className="num py-1.5 text-right font-mono">{r.criterion1.toLocaleString()}</td>
            </tr>
            <tr className="border-b">
              <td className="py-1.5 pr-2">2. Optimism in R² ≤ 0.05</td>
              <td className="py-1.5 pr-2 text-muted-fg">Small gap between apparent and true fit</td>
              <td className="num py-1.5 text-right font-mono">{r.criterion2.toLocaleString()}</td>
            </tr>
            <tr className="border-b">
              <td className="py-1.5 pr-2">3. Overall risk ± 0.05</td>
              <td className="py-1.5 pr-2 text-muted-fg">Precise intercept / mean risk</td>
              <td className="num py-1.5 text-right font-mono">{r.criterion3.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Required sample size" value={r.n.toLocaleString()} tone="good" />
        <Stat label="Required events" value={Math.ceil(r.events).toLocaleString()} />
        <Stat label="Events per parameter" value={fx(r.epp, 1)} sub="an output, not a rule" />
        <Stat label="10-EPV rule would say" value={epv10.toLocaleString()} sub={epv10 < r.n ? 'too few' : 'not tailored'} tone={epv10 < r.n ? 'bad' : undefined} />
      </div>
      <p className="text-xs text-muted-fg">
        Anticipated Cox–Snell R² = {fx(r.r2cs, 3)} (max possible {fx(r.maxR2cs, 3)}), derived from the C-statistic assuming a normally distributed linear predictor (Riley, Van
        Calster &amp; Collins, Stat Med 2021). Equivalent to the R/Stata package <code>pmsampsize</code>.
      </p>
    </WidgetFrame>
  );
}
