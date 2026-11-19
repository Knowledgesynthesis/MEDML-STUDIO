import { useState } from 'react';
import { Segmented, Slider, Stat, Loading, Legend } from '@/components/ui';
import { Chart, Line, Dots, Diagonal } from '@/components/chart/Chart';
import { WidgetFrame } from './Frame';
import { fx, pct } from '@/lib/utils';
import { getCohort, getModel, getPreds, useComputed, STANDARD_SPECS } from '@/lib/lab';
import { HOME_SITE, makeSepsis, type SepsisSite } from '@/lib/data/datasets';
import { auroc, calibrationCurve, calibrationStats, recalibrator } from '@/lib/ml/metrics';
import { mean } from '@/lib/ml/stats';

type Update = 'none' | 'intercept' | 'logistic';

export function ShiftWidget() {
  const [age, setAge] = useState(HOME_SITE.ageMean);
  const [shift, setShift] = useState(0);
  const [protocol, setProtocol] = useState<'rare' | 'habit' | 'all'>('habit');
  const [thermo, setThermo] = useState(0);
  const [update, setUpdate] = useState<Update>('none');
  const r = useComputed(() => {
    const site: SepsisSite = { name: 'External', ageMean: age, outcomeShift: shift, lactateOrderShift: protocol === 'all' ? Infinity : protocol === 'rare' ? -2.5 : 0, tempOffset: thermo };
    const ext = makeSepsis(2400, 777, site);
    const m = getModel('sepsis', STANDARD_SPECS.logistic_quadratic);
    const p = m.predict(ext.X);
    const nUpd = Math.round(p.length * 0.3);
    const fitP = p.slice(0, nUpd);
    const fitY = ext.y.slice(0, nUpd);
    const evalP = p.slice(nUpd);
    const evalY = ext.y.slice(nUpd);
    const variants: Record<Update, number[]> = {
      none: evalP,
      intercept: evalP.map(recalibrator(fitP, fitY, true)),
      logistic: evalP.map(recalibrator(fitP, fitY, false)),
    };
    const home = getCohort('sepsis');
    const homeP = getPreds('sepsis', STANDARD_SPECS.logistic_quadratic, 'test');
    const res = Object.fromEntries(
      (Object.keys(variants) as Update[]).map((k) => [k, { auc: auroc(variants[k], evalY), cal: calibrationStats(variants[k], evalY), curve: calibrationCurve(variants[k], evalY, 8), meanP: mean(variants[k]) }]),
    ) as Record<Update, { auc: number; cal: ReturnType<typeof calibrationStats>; curve: ReturnType<typeof calibrationCurve>; meanP: number }>;
    return { res, prevExt: mean(evalY), homeAuc: auroc(homeP, home.yte), homeCurve: calibrationCurve(homeP, home.yte, 8), nUpd };
  }, [age, shift, protocol, thermo]);
  const cur = r?.res[update];
  return (
    <WidgetFrame
      title="Deploy the sepsis model at another hospital"
      tryThis="change one thing at a time. (1) Make the population older: with a well-specified model, case-mix shift alone does little. (2) Raise baseline risk by +0.7: calibration breaks while AUROC holds, and re-estimating the intercept repairs it. (3) Set the thermometer 0.8 °C low: discrimination falls too, and recalibration cannot recover it. (4) Change lactate ordering: re-validate rather than assume the direction of the effect."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label="Mean age at new site" value={age} min={40} max={78} step={2} onChange={setAge} format={(v) => `${v} y`} hint="Case-mix shift (covariate shift)" />
        <Slider label="Baseline risk shift (log-odds)" value={shift} min={-1} max={1} step={0.1} onChange={setShift} format={(v) => fx(v, 1)} hint="Different outcome definition, coding, or unmeasured case mix" />
        <Slider label="Thermometer offset" value={thermo} min={-1} max={1} step={0.1} onChange={setThermo} format={(v) => `${v > 0 ? '+' : ''}${v.toFixed(1)} °C`} hint="Measurement shift: a different device" />
        <div className="space-y-1">
          <div className="text-sm font-medium">Lactate ordering at new site</div>
          <Segmented
            label="Lactate ordering"
            value={protocol}
            onChange={setProtocol}
            options={[
              { value: 'rare', label: 'Rarely ordered' },
              { value: 'habit', label: 'Same habits' },
              { value: 'all', label: 'Protocol: everyone' },
            ]}
          />
          <p className="text-xs text-muted-fg">Practice-pattern shift: changes what “not measured” means</p>
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-sm font-medium">Model updating (estimated on the first {r ? r.nUpd : '…'} patients at the new site)</div>
        <Segmented
          label="Model update"
          value={update}
          onChange={setUpdate}
          options={[
            { value: 'none', label: 'Use as is' },
            { value: 'intercept', label: 'Re-estimate intercept' },
            { value: 'logistic', label: 'Logistic recalibration' },
          ]}
        />
      </div>
      {!r || !cur ? (
        <Loading label="Generating external cohort…" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="AUROC: development → new site" value={`${fx(r.homeAuc, 3)} → ${fx(cur.auc, 3)}`} tone={cur.auc < r.homeAuc - 0.03 ? 'warn' : undefined} />
            <Stat label="Observed vs mean predicted" value={`${pct(r.prevExt, 1)} vs ${pct(cur.meanP, 1)}`} tone={Math.abs(r.prevExt - cur.meanP) > 0.03 ? 'bad' : 'good'} />
            <Stat label="Calibration-in-the-large" value={fx(cur.cal.intercept, 2)} tone={Math.abs(cur.cal.intercept) > 0.2 ? 'bad' : 'good'} />
            <Stat label="Calibration slope" value={fx(cur.cal.slope, 2)} tone={Math.abs(cur.cal.slope - 1) > 0.2 ? 'warn' : 'good'} />
          </div>
          <Chart x={[0, 0.9]} y={[0, 0.9]} square maxHeight={320} xLabel="Predicted risk" yLabel="Observed proportion" xFormat={(v) => pct(v)} yFormat={(v) => pct(v)} ariaLabel="Calibration at development and new site">
            {(s) => (
              <>
                <Diagonal s={s} to={0.9} />
                <Line s={s} pts={r.homeCurve.map((b) => [b.predicted, b.observed])} color="var(--c5)" width={2} dashed />
                <Line s={s} pts={cur.curve.map((b) => [b.predicted, b.observed])} color="var(--c2)" width={2.5} />
                <Dots s={s} pts={cur.curve.map((b) => [b.predicted, b.observed])} color="var(--c2)" r={4} />
              </>
            )}
          </Chart>
          <Legend
            items={[
              { color: 'var(--c5)', label: 'Development site (held-out)', dashed: true },
              { color: 'var(--c2)', label: 'New site' },
            ]}
          />
          <p className="text-xs text-muted-fg">
            Recalibration fixes miscalibration but cannot restore discrimination lost to a changed predictor–outcome relationship. That requires re-estimating coefficients or
            refitting the model, then validating again (Janssen 2008; FDA PCCP guidance 2024).
          </p>
        </>
      )}
    </WidgetFrame>
  );
}
