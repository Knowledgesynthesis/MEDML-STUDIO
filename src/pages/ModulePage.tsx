import { useEffect } from 'react';
import { ArrowLeft, ArrowRight, Clock, Target } from 'lucide-react';
import { Link } from '@/components/Link';
import { Card, CardBody, Badge } from '@/components/ui';
import { Quiz } from '@/components/learn/Quiz';
import { RefList } from '@/components/learn/Cite';
import { MODULES, MODULE_MAP } from '@/content/modules';
import { useProgress } from '@/store';
import { NotFound } from './NotFound';

export function ModulePage({ id }: { id: string }) {
  const m = MODULE_MAP[id];
  const visit = useProgress((s) => s.visit);
  useEffect(() => {
    if (m) visit(m.id);
  }, [m, visit]);
  if (!m) return <NotFound />;
  const idx = MODULES.indexOf(m);
  const prev = MODULES[idx - 1];
  const next = MODULES[idx + 1];
  return (
    <article className="mx-auto max-w-4xl space-y-8">
      <header className="space-y-3">
        <Link to="/learn" className="inline-flex items-center gap-1 text-sm text-muted-fg hover:text-fg">
          <ArrowLeft className="h-4 w-4" /> Course
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="primary">Module {m.number} of {MODULES.length}</Badge>
          <Badge>
            <Clock className="h-3 w-3" /> {m.minutes} min
          </Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{m.title}</h1>
        <p className="text-lg text-muted-fg">{m.summary}</p>
      </header>

      <Card className="border-primary/30 bg-primary/5">
        <CardBody>
          <h2 className="mb-2 flex items-center gap-2 font-semibold">
            <Target className="h-4 w-4 text-primary" /> After this module you can
          </h2>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {m.objectives.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <nav aria-label="On this page" className="rounded-lg border p-3 text-sm">
        <div className="mb-1 font-medium">On this page</div>
        <ol className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
          {m.sections.map((s, i) => (
            <li key={s.id}>
              <a href={`#/learn/${m.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' }); }} className="text-muted-fg hover:text-primary">
                {i + 1}. {s.title}
              </a>
            </li>
          ))}
          <li>
            <a href={`#/learn/${m.id}`} onClick={(e) => { e.preventDefault(); document.getElementById('quiz')?.scrollIntoView({ behavior: 'smooth' }); }} className="font-medium text-primary">
              Knowledge check
            </a>
          </li>
        </ol>
      </nav>

      {m.sections.map((s, i) => (
        <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="space-y-2">
          <h2 id={`${s.id}-h`} className="text-2xl font-semibold tracking-tight">
            <span className="text-muted-fg">{m.number}.{i + 1}</span> {s.title}
          </h2>
          <div className="prose-med leading-relaxed">{s.body}</div>
        </section>
      ))}

      <div id="quiz">
        <Quiz id={m.id} questions={m.quiz} />
      </div>

      <section aria-labelledby="refs-h" className="space-y-3">
        <h2 id="refs-h" className="text-lg font-semibold">
          References for this module
        </h2>
        <RefList ids={m.refs} />
      </section>

      <nav className="flex flex-wrap justify-between gap-3 border-t pt-6" aria-label="Module navigation">
        {prev ? (
          <Link to={`/learn/${prev.id}`} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-muted">
            <ArrowLeft className="h-4 w-4" /> {prev.number}. {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/learn/${next.id}`} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:opacity-90">
            {next.number}. {next.title} <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <Link to="/exam" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:opacity-90">
            Take the mastery exam <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </nav>
    </article>
  );
}
