import { useEffect, useState, type ReactNode } from 'react';
import { Menu, Moon, Sun, X, Home, BookOpen, FlaskConical, FileSearch, Wrench, GraduationCap, BookA, Library, CheckCircle2, Activity } from 'lucide-react';
import { Link } from '@/components/Link';
import { MODULE_META as MODULES } from '@/content/meta';
import { PASS_MARK, useProgress } from '@/store';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/learn', label: 'Course', icon: BookOpen },
  { to: '/lab', label: 'Labs', icon: FlaskConical },
  { to: '/cases', label: 'Case files', icon: FileSearch },
  { to: '/toolkit', label: 'Appraisal toolkit', icon: Wrench },
  { to: '/exam', label: 'Mastery exam', icon: GraduationCap },
  { to: '/glossary', label: 'Glossary', icon: BookA },
  { to: '/references', label: 'References', icon: Library },
];

function NavContent({ path, onNavigate }: { path: string; onNavigate?: () => void }) {
  const quizzes = useProgress((s) => s.quizzes);
  const isActive = (to: string) => (to === '/' ? path === '/' : path === to || path.startsWith(`${to}/`));
  return (
    <nav aria-label="Main" className="space-y-6 p-4">
      <ul className="space-y-0.5">
        {NAV.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              onClick={onNavigate}
              aria-current={isActive(to) ? 'page' : undefined}
              className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors', isActive(to) ? 'bg-primary/10 font-medium text-primary' : 'hover:bg-muted')}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <div>
        <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-fg">Modules</div>
        <ol className="space-y-0.5">
          {MODULES.map((m) => {
            const done = (quizzes[m.id]?.best ?? 0) >= PASS_MARK;
            const to = `/learn/${m.id}`;
            return (
              <li key={m.id}>
                <Link
                  to={to}
                  onClick={onNavigate}
                  aria-current={path === to ? 'page' : undefined}
                  className={cn('flex items-start gap-2 rounded-lg px-3 py-1.5 text-sm leading-snug transition-colors', path === to ? 'bg-primary/10 text-primary' : 'text-muted-fg hover:bg-muted hover:text-fg')}
                >
                  <span className="num mt-px w-5 shrink-0 text-xs">{m.number}.</span>
                  <span className="flex-1">{m.title}</span>
                  {done && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-good" aria-label="mastered" />}
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

export function Layout({ path, children }: { path: string; children: ReactNode }) {
  // the drawer belongs to the path it was opened on, so any navigation closes it
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === path;
  const setOpen = (v: boolean) => setOpenFor(v ? path : null);
  const dark = useProgress((s) => s.dark);
  const setDark = useProgress((s) => s.setDark);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenFor(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-card focus:px-3 focus:py-2">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b bg-bg/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4">
          <button className="rounded-lg p-2 hover:bg-muted lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation" aria-expanded={open}>
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Activity className="h-5 w-5 text-primary" aria-hidden />
            MedML Studio
          </Link>
          <span className="ml-2 hidden text-sm text-muted-fg md:inline">Clinical prediction models, done right</span>
          <button className="ml-auto rounded-lg p-2 hover:bg-muted" onClick={() => setDark(!dark)} aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}>
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-xs overflow-y-auto border-r bg-card shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <span className="font-semibold">Menu</span>
              <button className="rounded-lg p-2 hover:bg-muted" onClick={() => setOpen(false)} aria-label="Close navigation">
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavContent path={path} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-7xl flex-1">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-72 shrink-0 overflow-y-auto border-r lg:block">
          <NavContent path={path} />
        </aside>
        <main id="main" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          {children}
        </main>
      </div>

      <footer className="border-t px-4 py-5 text-center text-xs text-muted-fg">
        All patient data are synthetic. Educational use, not for clinical decisions. · Built by Bashar Hasan, MD ·{' '}
        <a href="https://github.com/Knowledgesynthesis/MEDML-STUDIO" className="underline hover:text-fg" target="_blank" rel="noreferrer">
          Source
        </a>
      </footer>
    </div>
  );
}
