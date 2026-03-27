import React, { Suspense } from 'react';
import { useRoutes, BrowserRouter } from 'react-router-dom';
import { routes } from './routes';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

function AppRoutes() {
  const element = useRoutes(routes);
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div></div>}>
      {element}
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-brand-100 selection:text-brand-900">
        <ScrollToTop />
        <Header />
        <main className="pt-24">
          <AppRoutes />
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
