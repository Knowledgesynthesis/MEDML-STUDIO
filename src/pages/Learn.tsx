import { Clock, CheckCircle2 } from 'lucide-react';
import { Link } from '@/components/Link';
import { Card, CardBody, Badge, Button } from '@/components/ui';
import { MODULE_MAP, PARTS, MODULES } from '@/content/modules';
import { PASS_MARK, useProgress } from '@/store';

export function Learn() {
  const quizzes = useProgress((s) => s.quizzes);
  const reset = useProgress((s) => s.reset);
  const mastered = MODULES.filter((m) => (quizzes[m.id]?.best ?? 0) >= PASS_MARK).length;
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Course</h1>
        <p className="text-muted-fg">
          Ten modules in four parts. Work through them in order: each builds on the previous one. {mastered}/{MODULES.length} mastered.
        </p>
      </header>
      {PARTS.map((part, pi) => (
        <section key={part.title} className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-fg">
            Part {pi + 1} · {part.title}
          </h2>
          {part.modules.map((id) => {
            const m = MODULE_MAP[id];
            const rec = quizzes[id];
            const done = (rec?.best ?? 0) >= PASS_MARK;
            return (
              <Card key={id} className={done ? 'border-good/40' : undefined}>
                <CardBody className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="text-xs text-muted-fg">Module {m.number}</div>
                      <h3 className="text-lg font-semibold">
                        <Link to={`/learn/${id}`} className="hover:text-primary">
                          {m.title}
                        </Link>
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>
                        <Clock className="h-3 w-3" /> {m.minutes} min
                      </Badge>
                      {done ? (
                        <Badge tone="good">
                          <CheckCircle2 className="h-3 w-3" /> Mastered {Math.round((rec?.best ?? 0) * 100)}%
                        </Badge>
                      ) : rec ? (
                        <Badge tone="warn">Best {Math.round(rec.best * 100)}%</Badge>
                      ) : null}
                    </div>
                  </div>
                  <p className="text-sm text-muted-fg">{m.summary}</p>
                  <details className="text-sm">
                    <summary className="cursor-pointer font-medium">Learning objectives</summary>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-fg">
                      {m.objectives.map((o) => (
                        <li key={o}>{o}</li>
                      ))}
                    </ul>
                  </details>
                </CardBody>
              </Card>
            );
          })}
        </section>
      ))}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (window.confirm('Clear all quiz scores on this device?')) reset();
          }}
        >
          Reset my progress
        </Button>
      </div>
    </div>
  );
}
