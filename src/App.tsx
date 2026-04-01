import React, { Suspense, useEffect } from 'react';
import { useRoutes, BrowserRouter, useLocation } from 'react-router-dom';
import { routes } from './routes';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { UserProvider } from './contexts/UserContext';
import { Toaster } from 'sonner';

function AppContent() {
  const element = useRoutes(routes);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isFocusPremiumMode = location.pathname.startsWith("/subasta/") && searchParams.get("analysis") === "unlocked";

  useEffect(() => {
    // Dispatch custom event for prerenderer after a short delay to ensure 
    // lazy components are loaded and rendered, avoiding "loading" states.
    const timer = setTimeout(() => {
      document.dispatchEvent(new Event('custom-render-trigger'));
    }, 1500);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-brand-100 selection:text-brand-900">
      <ScrollToTop />
      {!isFocusPremiumMode && <Header />}
      <main className={isFocusPremiumMode ? "" : "pt-24"}>
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div></div>}>
          {element}
        </Suspense>
      </main>
      {!isFocusPremiumMode && <Footer />}
      <Toaster position="bottom-center" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
