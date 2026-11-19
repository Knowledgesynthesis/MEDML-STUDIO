import { lazy, Suspense } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Loading } from '@/components/ui';
import { useRoute } from '@/lib/router';
import { Home } from '@/pages/Home';

// Heavier pages are split into separate chunks so the home page loads fast on phones.
const Learn = lazy(() => import('@/pages/Learn').then((m) => ({ default: m.Learn })));
const ModulePage = lazy(() => import('@/pages/ModulePage').then((m) => ({ default: m.ModulePage })));
const Labs = lazy(() => import('@/pages/Labs').then((m) => ({ default: m.Labs })));
const Cases = lazy(() => import('@/pages/Cases').then((m) => ({ default: m.Cases })));
const Toolkit = lazy(() => import('@/pages/Toolkit').then((m) => ({ default: m.Toolkit })));
const Exam = lazy(() => import('@/pages/Misc').then((m) => ({ default: m.Exam })));
const Glossary = lazy(() => import('@/pages/Misc').then((m) => ({ default: m.Glossary })));
const References = lazy(() => import('@/pages/Misc').then((m) => ({ default: m.References })));
const NotFoundPage = lazy(() => import('@/pages/Misc').then((m) => ({ default: m.NotFoundPage })));

function Page({ seg }: { seg: string[] }) {
  const [a, b] = seg;
  switch (a) {
    case undefined:
      return <Home />;
    case 'learn':
      return b ? <ModulePage key={b} id={b} /> : <Learn />;
    case 'lab':
      return <Labs tab={b ?? ''} />;
    case 'cases':
      return <Cases />;
    case 'toolkit':
      return <Toolkit />;
    case 'exam':
      return <Exam />;
    case 'glossary':
      return <Glossary />;
    case 'references':
      return <References />;
    default:
      return <NotFoundPage />;
  }
}

export default function App() {
  const seg = useRoute();
  const path = `/${seg.join('/')}`;
  return (
    <Layout path={path}>
      <Suspense fallback={<Loading label="Loading…" />}>
        <Page key={path} seg={seg} />
      </Suspense>
    </Layout>
  );
}
