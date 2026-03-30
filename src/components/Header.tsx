import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Gavel, Sparkles, ChevronDown, Calculator, FileText, Calendar, ExternalLink, User, LogOut, Star } from 'lucide-react';
import { ROUTES } from '../constants/routes';
import { useUser } from '../contexts/UserContext';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLogged, login, logout, isLoading, plan } = useUser();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

          {/* Auth Section */}
          <div className="flex items-center ml-2 border-l border-slate-200 pl-6 gap-3">
            {!isLoading && isLogged && plan === 'free' && (
              <Link 
                to="/pro"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 hover:border-brand-300 hover:bg-brand-50 transition-all group"
              >
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Plan FREE</span>
                <span className="text-[10px] font-bold text-brand-600 group-hover:text-brand-700">Mejorar a BASIC &rarr;</span>
              </Link>
            )}
            {!isLoading && (
              isLogged ? (
                <div className="relative flex items-center gap-3" ref={userMenuRef}>
                  {plan === 'basic' && (
                    <span className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-700 tracking-wide">
                      ✨ BASIC activo
                    </span>
                  )}
                  {plan === 'pro' && (
                    <span className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-[10px] font-bold text-brand-700 tracking-wide">
                      🚀 PRO activo
                    </span>
                  )}
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-brand-700 hover:bg-slate-200 transition-colors border border-slate-200"
                  >
                    <User size={20} />
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-xl rounded-xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-slate-100 mb-1">
                        <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>
                      
                      <div className="px-4 py-2 border-b border-slate-100 mb-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mi plan</p>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${plan === 'pro' ? 'text-brand-700' : plan === 'basic' ? 'text-amber-700' : 'text-slate-600'}`}>
                            {plan === 'pro' ? '🚀 PRO activo' : plan === 'basic' ? '✨ BASIC activo' : 'FREE'}
                          </span>
                          <Link 
                            to={ROUTES.MI_CUENTA}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="text-[10px] font-medium text-brand-600 hover:text-brand-700 hover:underline"
                          >
                            Mi cuenta
                          </Link>
                        </div>
                      </div>

                      <Link 
                        to="/mis-guardados"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-700 transition-colors text-left"
                      >
                        <Star size={16} />
                        <span>Mis Guardados</span>
                      </Link>
                      <button 
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-red-600 transition-colors text-left"
                      >
                        <LogOut size={16} />
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => login()}
                  className="text-sm lg:text-base font-medium text-slate-700 hover:text-brand-700 transition-colors"
                >
                  Acceder
                </button>
              )
            )}
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-3 md:hidden">
          {!isLoading && isLogged && plan === 'free' && (
            <Link 
              to="/pro"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 hover:border-brand-300 hover:bg-brand-50 transition-all"
            >
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">Plan FREE</span>
              <span className="text-[9px] font-bold text-brand-600">Mejorar a BASIC &rarr;</span>
            </Link>
          )}
          {!isLoading && !isLogged && (
            <button 
              onClick={() => login()}
              className="text-sm font-medium text-slate-700 hover:text-brand-700 transition-colors"
            >
              Acceder
            </button>
          )}
          {!isLoading && isLogged && (
             <div className="relative flex items-center gap-2" ref={userMenuRef}>
               {plan === 'basic' && (
                 <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[9px] font-bold text-amber-700 tracking-wide">
                   ✨ BASIC
                 </span>
               )}
               {plan === 'pro' && (
                 <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-[9px] font-bold text-brand-700 tracking-wide">
                   🚀 PRO
                 </span>
               )}
               <button 
                 onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                 className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-brand-700 hover:bg-slate-200 transition-colors border border-slate-200"
               >
                 <User size={16} />
               </button>
               
               {isUserMenuOpen && (
                 <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-xl rounded-xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2">
                   <div className="px-4 py-2 border-b border-slate-100 mb-1">
                     <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
                     <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                   </div>

                   <div className="px-4 py-2 border-b border-slate-100 mb-1">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mi plan</p>
                     <div className="flex items-center justify-between">
                       <span className={`text-xs font-bold ${plan === 'pro' ? 'text-brand-700' : plan === 'basic' ? 'text-amber-700' : 'text-slate-600'}`}>
                         {plan === 'pro' ? '🚀 PRO activo' : plan === 'basic' ? '✨ BASIC activo' : 'FREE'}
                       </span>
                       <Link 
                         to={ROUTES.MI_CUENTA}
                         onClick={() => setIsUserMenuOpen(false)}
                         className="text-[10px] font-medium text-brand-600 hover:text-brand-700 hover:underline"
                       >
                         Mi cuenta
                       </Link>
                     </div>
                   </div>

                   <Link 
                     to="/mis-guardados"
                     onClick={() => {
                       setIsUserMenuOpen(false);
                       setIsMobileMenuOpen(false);
                     }}
                     className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-700 transition-colors text-left"
                   >
                     <Star size={16} />
                     <span>Mis Guardados</span>
                   </Link>
                   <button 
                     onClick={() => {
                       logout();
                       setIsUserMenuOpen(false);
                     }}
                     className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-red-600 transition-colors text-left"
                   >
                     <LogOut size={16} />
                     <span>Cerrar sesión</span>
                   </button>
                 </div>
               )}
             </div>
          )}
          <button 
            className="text-slate-700 p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
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
