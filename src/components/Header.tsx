import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Gavel, Sparkles } from 'lucide-react';
import { ROUTES } from '../constants/routes';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    
    if (location.pathname !== '/') {
      navigate('/' + hash);
      return;
    }

    const id = hash.replace('#', '');
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-3' : 'bg-white/80 backdrop-blur-sm py-4 md:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to={ROUTES.HOME} className="flex items-center gap-2 text-brand-900 group" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <div className="bg-brand-700 text-white p-2 rounded-lg group-hover:bg-brand-800 transition-colors shadow-sm">
            <Gavel size={22} />
          </div>
          <span className="font-serif font-bold text-xl md:text-2xl tracking-tight">Activos Off-Market</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-8">
          <Link 
            to={ROUTES.GUIDE_PILLAR} 
            className={`text-sm lg:text-base font-medium transition-colors ${location.pathname === ROUTES.GUIDE_PILLAR ? 'text-brand-700 font-bold' : 'text-slate-600 hover:text-brand-700'}`}
          >
            Guía
          </Link>
          <Link 
            to={ROUTES.RECENT_AUCTIONS} 
            className={`text-sm lg:text-base font-medium transition-colors ${location.pathname === ROUTES.RECENT_AUCTIONS ? 'text-brand-700 font-bold' : 'text-slate-600 hover:text-brand-700'}`}
          >
            Subastas Recientes
          </Link>
          <a href="#precios" onClick={(e) => handleNavClick(e, '#precios')} className="text-sm lg:text-base font-medium text-slate-600 hover:text-brand-700 transition-colors">Precios</a>
          <Link 
            to={ROUTES.ABOUT} 
            className={`text-sm lg:text-base font-medium transition-colors ${location.pathname === ROUTES.ABOUT ? 'text-brand-700 font-bold' : 'text-slate-600 hover:text-brand-700'}`}
            onClick={() => window.scrollTo(0, 0)}
          >
            Equipo
          </Link>
          <Link 
            to={ROUTES.CALCULATOR} 
            className={`text-sm lg:text-base font-medium transition-colors ${location.pathname === ROUTES.CALCULATOR ? 'text-brand-700 font-bold' : 'text-slate-600 hover:text-brand-700'}`}
          >
            Calculadora
          </Link>
          
          <div className="flex items-center gap-3 ml-2 lg:ml-4">
            <div className="relative group">
              <div className="absolute -top-3 -right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm z-10 uppercase tracking-wide flex items-center gap-1 animate-pulse">
                  <Sparkles size={8} /> Oferta
              </div>
              <a 
                  href="https://sublaunch.com/activosoffmarket" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-brand-700 hover:bg-brand-800 text-white text-sm lg:text-base font-bold px-5 lg:px-6 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 block"
              >
                  Canal Premium
              </a>
            </div>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-slate-700 p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-slate-100 shadow-xl p-4 flex flex-col gap-4 animate-in slide-in-from-top-5 h-screen overflow-y-auto pb-20">
           <Link 
            to={ROUTES.GUIDE_PILLAR} 
            className="text-lg font-bold text-brand-700 py-3 border-b border-slate-100 bg-brand-50/50 px-2 rounded"
            onClick={() => {
              setIsMobileMenuOpen(false);
              window.scrollTo(0, 0);
            }}
          >
            📚 Guía
          </Link>
          <Link 
            to={ROUTES.RECENT_AUCTIONS} 
            className="text-lg font-bold text-brand-700 py-3 border-b border-slate-100 bg-brand-50/50 px-2 rounded"
            onClick={() => {
              setIsMobileMenuOpen(false);
              window.scrollTo(0, 0);
            }}
          >
            🔍 Subastas Recientes
          </Link>
          <a 
            href="#precios" 
            className="text-lg font-medium text-slate-800 py-3 border-b border-slate-100 px-2"
            onClick={(e) => handleNavClick(e, '#precios')}
          >
            Precios
          </a>
           <Link 
            to={ROUTES.ABOUT} 
            className="text-lg font-medium text-slate-800 py-3 border-b border-slate-100 px-2"
            onClick={() => {
              setIsMobileMenuOpen(false);
              window.scrollTo(0, 0);
            }}
          >
            Equipo
          </Link>
          <Link 
            to={ROUTES.CALCULATOR} 
            className="text-lg font-bold text-brand-700 py-3 border-b border-slate-100 bg-brand-50/50 px-2 rounded"
            onClick={() => {
              setIsMobileMenuOpen(false);
              window.scrollTo(0, 0);
            }}
          >
            🧮 Calculadora
          </Link>
          
          <div className="flex flex-col gap-3 mt-4">
            <a 
              href="https://sublaunch.com/activosoffmarket"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="bg-brand-700 text-white text-center font-bold text-lg px-4 py-4 rounded-xl shadow-md relative"
            >
               Canal Premium
               <span className="absolute top-2 right-4 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
