import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Gavel, Sparkles, ChevronDown, Calculator, FileText, Calendar, ExternalLink } from 'lucide-react';
import { ROUTES } from '../constants/routes';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
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
        isScrolled ? 'bg-white/95 shadow-md py-3' : 'bg-white/80 py-4 md:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link 
          to={ROUTES.HOME} 
          className="flex items-center gap-2 text-brand-900 group" 
          onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
        >
          <div className="bg-brand-700 text-white p-2 rounded-lg group-hover:bg-brand-800 transition-colors shadow-sm">
            <Gavel size={22} />
          </div>
          <span className="font-serif font-bold text-xl md:text-2xl tracking-tight">Activos Off-Market</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          <Link 
            to={ROUTES.GUIDE_PILLAR} 
            className={`text-sm lg:text-base font-medium transition-colors ${location.pathname === ROUTES.GUIDE_PILLAR ? 'text-brand-700 font-bold' : 'text-slate-600 hover:text-brand-700'}`}
          >
            Guía Subastas BOE
          </Link>
          <Link 
            to={ROUTES.RECENT_AUCTIONS} 
            className={`text-sm lg:text-base font-medium transition-colors ${location.pathname === ROUTES.RECENT_AUCTIONS ? 'text-brand-700 font-bold' : 'text-slate-600 hover:text-brand-700'}`}
          >
            Subastas Recientes
          </Link>

          {/* Tools Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-sm lg:text-base font-medium text-slate-600 hover:text-brand-700 transition-colors py-2">
              Herramientas <ChevronDown size={16} className="group-hover:rotate-180 transition-transform" />
            </button>
            <div className="absolute top-full left-0 w-64 bg-white shadow-xl rounded-xl border border-slate-100 py-3 hidden group-hover:block animate-in fade-in slide-in-from-top-2">
              <Link 
                to={ROUTES.CALCULATOR}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-700 transition-colors"
              >
                <Calculator size={18} className="text-brand-600" />
                <span>Calcular Puja Máxima</span>
              </Link>
              <Link 
                to="/subasta/subasta-sub-at-2026-25r2886001818"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-700 transition-colors"
              >
                <FileText size={18} className="text-brand-600" />
                <span>Análisis de Cargas</span>
              </Link>
              <a 
                href="https://calendly.com/activosoffmarket"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-700 transition-colors"
              >
                <Calendar size={18} className="text-brand-600" />
                <span>Consultoría</span>
              </a>
            </div>
          </div>
          
          <a 
            href="https://t.me/activosOffmarket" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 text-brand-700 hover:bg-brand-100 text-sm lg:text-base font-bold transition-all border border-brand-100"
          >
            Canal Gratuito <ExternalLink size={14} />
          </a>
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
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-slate-100 shadow-xl p-4 flex flex-col gap-2 animate-in slide-in-from-top-5 h-screen overflow-y-auto pb-20">
           <Link 
            to={ROUTES.GUIDE_PILLAR} 
            className="text-lg font-bold text-slate-900 py-3 border-b border-slate-100 px-2"
            onClick={() => {
              setIsMobileMenuOpen(false);
              window.scrollTo(0, 0);
            }}
          >
            Guía Subastas BOE
          </Link>
          <Link 
            to={ROUTES.RECENT_AUCTIONS} 
            className="text-lg font-bold text-slate-900 py-3 border-b border-slate-100 px-2"
            onClick={() => {
              setIsMobileMenuOpen(false);
              window.scrollTo(0, 0);
            }}
          >
            Subastas Recientes
          </Link>

          <div className="border-b border-slate-100">
            <button 
              onClick={() => setIsToolsOpen(!isToolsOpen)}
              className="w-full flex justify-between items-center text-lg font-bold text-slate-900 py-3 px-2"
            >
              Herramientas
              <ChevronDown size={20} className={`transition-transform ${isToolsOpen ? 'rotate-180' : ''}`} />
            </button>
            {isToolsOpen && (
              <div className="bg-slate-50 rounded-xl mb-3 overflow-hidden">
                <Link 
                  to={ROUTES.CALCULATOR}
                  className="flex items-center gap-3 px-4 py-3 text-slate-700 border-b border-slate-200/50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Calculator size={18} className="text-brand-600" />
                  <span>Calcular Puja Máxima</span>
                </Link>
                <Link 
                  to="/subasta/subasta-sub-at-2026-25r2886001818"
                  className="flex items-center gap-3 px-4 py-3 text-slate-700 border-b border-slate-200/50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FileText size={18} className="text-brand-600" />
                  <span>Análisis de Cargas</span>
                </Link>
                <a 
                  href="https://calendly.com/activosoffmarket"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 text-slate-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Calendar size={18} className="text-brand-600" />
                  <span>Consultoría</span>
                </a>
              </div>
            )}
          </div>
          
          <a 
            href="https://t.me/activosOffmarket"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsMobileMenuOpen(false)}
            className="mt-2 text-lg font-bold text-brand-700 py-4 px-4 bg-brand-50 rounded-xl flex items-center justify-between border border-brand-100"
          >
            Canal Gratuito
            <ExternalLink size={20} />
          </a>
        </div>
      )}
    </header>
  );
};

export default Header;
