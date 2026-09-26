import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { MarketDiscovery } from './pages/MarketDiscovery';
import { MarketDetail } from './pages/MarketDetail';
import { CategoryPage } from './pages/CategoryPage';
import { CreateMarket } from './pages/CreateMarket';
import { Portfolio } from './pages/Portfolio';
import { Ranking } from './pages/Ranking';
import { UserProfile } from './pages/UserProfile';
import { MyMarkets } from './pages/MyMarkets';
import { AdminDemo } from './pages/AdminDemo';
import { DocsViewer } from './pages/DocsViewer';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Roteador simples e leve baseado em URL
  const renderRoute = () => {
    const path = currentPath.split('?')[0];

    // Detalhe de mercado: /mercados/:slug
    if (path.startsWith('/mercados/') && path !== '/mercados') {
      const slug = path.replace('/mercados/', '');
      return <MarketDetail slug={slug} onNavigate={navigate} />;
    }

    // Categoria: /categorias/:slug
    if (path.startsWith('/categorias/')) {
      const catSlug = path.replace('/categorias/', '');
      return <CategoryPage categorySlug={catSlug} onNavigate={navigate} />;
    }

    // Perfil: /perfil/:username
    if (path.startsWith('/perfil/')) {
      const username = path.replace('/perfil/', '');
      return <UserProfile username={username} onNavigate={navigate} />;
    }

    if (path === '/mercados') {
      return <MarketDiscovery onNavigate={navigate} />;
    }

    if (path === '/criar') {
      return <CreateMarket onNavigate={navigate} />;
    }

    if (path === '/portfolio') {
      return <Portfolio onNavigate={navigate} />;
    }

    if (path === '/ranking') {
      return <Ranking onNavigate={navigate} />;
    }

    if (path === '/meus-mercados') {
      return <MyMarkets onNavigate={navigate} />;
    }

    if (path === '/admin') {
      return <AdminDemo onNavigate={navigate} />;
    }

    if (path === '/docs') {
      const urlParams = new URLSearchParams(window.location.search);
      const initialDoc = urlParams.get('doc') || 'PRODUCT.md';
      return <DocsViewer initialDoc={initialDoc} onNavigate={navigate} />;
    }

    // Default Home
    return <Home onNavigate={navigate} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
      <Navbar currentPath={currentPath} onNavigate={navigate} />
      <main className="flex-1">
        {renderRoute()}
      </main>
      <Footer onNavigate={navigate} />
    </div>
  );
}
