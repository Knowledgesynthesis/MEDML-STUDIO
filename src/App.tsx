import { useEffect, useState } from 'react';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Datasets } from './pages/Datasets';
import { ModelLab } from './pages/ModelLab';
import { Explainability } from './pages/Explainability';
import { useStore } from './store';

type Page = 'home' | 'datasets' | 'model-lab' | 'explainability';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const initialize = useStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Simple routing handler
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === 'datasets') setCurrentPage('datasets');
      else if (hash === 'model-lab') setCurrentPage('model-lab');
      else if (hash === 'explainability') setCurrentPage('explainability');
      else setCurrentPage('home');
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'datasets':
        return <Datasets />;
      case 'model-lab':
        return <ModelLab />;
      case 'explainability':
        return <Explainability />;
      default:
        return <Home />;
    }
  };

  return (
    <Layout>
      {renderPage()}
    </Layout>
  );
}

export default App;
