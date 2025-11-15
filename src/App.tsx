import { useEffect, useState } from 'react';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Datasets } from './pages/Datasets';
import { ModelLab } from './pages/ModelLab';
import { Explainability } from './pages/Explainability';
import { Learning } from './pages/Learning';
import { Ethics } from './pages/Ethics';
import { Glossary } from './pages/Glossary';
import { CaseStudies } from './pages/CaseStudies';
import { Module1, Module2, Module3, Module4, Module5, Module6, Module7, Module8, Module9, Module10 } from './pages/modules';
import { useStore } from './store';

type Page = 'home' | 'datasets' | 'model-lab' | 'explainability' | 'learning' | 'ethics' | 'glossary' | 'case-studies' |
  'module-1' | 'module-2' | 'module-3' | 'module-4' | 'module-5' |
  'module-6' | 'module-7' | 'module-8' | 'module-9' | 'module-10';

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
      else if (hash === 'learning') setCurrentPage('learning');
      else if (hash === 'ethics') setCurrentPage('ethics');
      else if (hash === 'glossary') setCurrentPage('glossary');
      else if (hash === 'case-studies') setCurrentPage('case-studies');
      else if (hash === 'module-1') setCurrentPage('module-1');
      else if (hash === 'module-2') setCurrentPage('module-2');
      else if (hash === 'module-3') setCurrentPage('module-3');
      else if (hash === 'module-4') setCurrentPage('module-4');
      else if (hash === 'module-5') setCurrentPage('module-5');
      else if (hash === 'module-6') setCurrentPage('module-6');
      else if (hash === 'module-7') setCurrentPage('module-7');
      else if (hash === 'module-8') setCurrentPage('module-8');
      else if (hash === 'module-9') setCurrentPage('module-9');
      else if (hash === 'module-10') setCurrentPage('module-10');
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
      case 'learning':
        return <Learning />;
      case 'ethics':
        return <Ethics />;
      case 'glossary':
        return <Glossary />;
      case 'case-studies':
        return <CaseStudies />;
      case 'module-1':
        return <Module1 />;
      case 'module-2':
        return <Module2 />;
      case 'module-3':
        return <Module3 />;
      case 'module-4':
        return <Module4 />;
      case 'module-5':
        return <Module5 />;
      case 'module-6':
        return <Module6 />;
      case 'module-7':
        return <Module7 />;
      case 'module-8':
        return <Module8 />;
      case 'module-9':
        return <Module9 />;
      case 'module-10':
        return <Module10 />;
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
