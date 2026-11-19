import { ArrowRight, BookOpen, FlaskConical, FileSearch, GraduationCap, Wrench, CheckCircle2 } from 'lucide-react';
import { Link } from '@/components/Link';
import { Card, CardBody, Badge } from '@/components/ui';
import { MODULE_META as MODULES, PARTS, META_MAP as MODULE_MAP } from '@/content/meta';
import { PASS_MARK, useProgress } from '@/store';
import { BayesWidget } from '@/components/widgets/Foundations';

export function Home() {
  const quizzes = useProgress((s) => s.quizzes);
  const mastered = MODULES.filter((m) => (quizzes[m.id]?.best ?? 0) >= PASS_MARK).length;
  const next = MODULES.find((m) => (quizzes[m.id]?.best ?? 0) < PASS_MARK) ?? MODULES[0];
  const totalMin = MODULES.reduce((s, m) => s + m.minutes, 0);
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <section className="space-y-4 pt-2">
        <Badge tone="primary">Updated November 2026 · 10 modules · ~{Math.round(totalMin / 60)} hours</Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Learn to build, judge and safely use clinical prediction models.</h1>
        <p className="max-w-3xl text-lg text-muted-fg">
          An interactive course for clinicians, trainees and informaticians. The models are real: logistic regression, trees, random forests, gradient boosting and neural nets
          train in your browser on synthetic patients whose true risk is known. Every claim is linked to its primary source.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link to={`/learn/${next.id}`} className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 font-medium text-primary-fg hover:opacity-90">
            {mastered === 0 ? 'Start Module 1' : mastered === MODULES.length ? 'Review the course' : `Continue: Module ${next.number}`}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/exam" className="inline-flex h-11 items-center gap-2 rounded-lg border bg-card px-5 font-medium hover:bg-muted">
            Test yourself first
          </Link>
        </div>
        <div className="max-w-md">
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-muted-fg">Modules mastered (≥ 80% on the module quiz)</span>
            <span className="num font-medium">
              {mastered}/{MODULES.length}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-good transition-all" style={{ width: `${(mastered / MODULES.length) * 100}%` }} />
          </div>
        </div>
      </section>

      <section aria-labelledby="try" className="space-y-2">
        <h2 id="try" className="text-xl font-semibold">
          Thirty seconds to see why this matters
        </h2>
        <BayesWidget />
      </section>

      <section aria-labelledby="path" className="space-y-4">
        <h2 id="path" className="text-xl font-semibold">
          The path
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {PARTS.map((part) => (
            <Card key={part.title}>
              <CardBody className="space-y-3">
                <h3 className="font-semibold">{part.title}</h3>
                <ol className="space-y-2">
                  {part.modules.map((id) => {
                    const m = MODULE_MAP[id];
                    const done = (quizzes[id]?.best ?? 0) >= PASS_MARK;
                    return (
                      <li key={id}>
                        <Link to={`/learn/${id}`} className="group flex items-start gap-3 rounded-lg p-2 hover:bg-muted">
                          <span className={`num mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${done ? 'bg-good text-white' : 'bg-primary/10 text-primary'}`}>
                            {done ? <CheckCircle2 className="h-4 w-4" /> : m.number}
                          </span>
                          <span>
                            <span className="block text-sm font-medium group-hover:text-primary">{m.title}</span>
                            <span className="block text-xs text-muted-fg">{m.minutes} min</span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { to: '/lab', icon: FlaskConical, title: 'Labs', text: 'Train and compare six model families, explain them with exact SHAP, audit fairness, and deploy them to a shifted hospital.' },
          { to: '/cases', icon: FileSearch, title: 'Case files', text: 'Ten documented real-world deployments, from the sepsis model that missed 67% of cases to autonomous retinopathy screening.' },
          { to: '/toolkit', icon: Wrench, title: 'Appraisal toolkit', text: 'A 10-question appraisal checklist, a sample-size calculator and threshold tools you can use on the next paper or vendor pitch.' },
          { to: '/exam', icon: GraduationCap, title: 'Mastery exam', text: '15 integrative case questions. Deferred feedback, with full rationales after you submit.' },
        ].map(({ to, icon: Icon, title, text }) => (
          <Link key={to} to={to} className="group rounded-xl border bg-card p-4 shadow-sm transition-colors hover:border-primary">
            <Icon className="mb-2 h-5 w-5 text-primary" aria-hidden />
            <div className="font-semibold group-hover:text-primary">{title}</div>
            <p className="mt-1 text-sm text-muted-fg">{text}</p>
          </Link>
        ))}
      </section>

      <section className="rounded-xl border bg-muted/40 p-5 text-sm">
        <h2 className="mb-2 flex items-center gap-2 font-semibold">
          <BookOpen className="h-4 w-4" /> How the course works
        </h2>
        <ul className="grid gap-2 sm:grid-cols-3">
          <li>
            <strong>Concept, then experiment.</strong> Each idea comes with a live model you can manipulate.
          </li>
          <li>
            <strong>Retrieval practice.</strong> Every module ends with case-based questions and explanations. You need 80% to master it.
          </li>
          <li>
            <strong>Evidence first.</strong> Claims cite primary studies, guidelines and regulations current to November 2026.
          </li>
        </ul>
      </section>
    </div>
  );
}
