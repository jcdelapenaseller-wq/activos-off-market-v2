import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Gavel, Send, BookOpen } from 'lucide-react';
import { ROUTES } from '../constants/routes';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/' + hash);
    } else {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        const y = element.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-400 py-16 md:py-24 mb-16 md:mb-0 border-t border-slate-900 font-sans">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 mb-16">
          
          {/* Col 1: Brand & SEO Authority Block (Span 4) */}
          <div className="md:col-span-4 space-y-6">
            <Link to="/" className="flex items-center gap-3 text-white hover:opacity-80 transition-opacity">
              <Gavel size={28} className="text-brand-500" />
              <span className="font-serif font-bold text-2xl">Activos Off-Market</span>
            </Link>
            
            <div className="prose prose-invert prose-sm max-w-none">
                <h3 className="text-white font-bold text-lg mb-3">Especialistas en Subastas Judiciales del BOE</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                    En Activos Off-Market somos expertos en <strong>inversión en subastas públicas</strong>. Realizamos un <strong>análisis de subastas</strong> exhaustivo, verificando expedientes tanto en juzgados como en la AEAT. 
                </p>
                <p className="text-slate-400 leading-relaxed text-sm">
                    Nuestra metodología prioriza el <strong>estudio de cargas y riesgos</strong> para garantizar la seguridad jurídica. Transformamos la complejidad de las <strong>subastas judiciales en España</strong> en información clara y accionable para inversores prudentes.
                </p>
            </div>

            <div className="flex gap-4 pt-2">
                 <a href="https://t.me/activosoffmarket" target="_blank" rel="noopener noreferrer" className="bg-slate-900 p-3 rounded-full hover:bg-brand-900 text-slate-400 hover:text-brand-400 transition-all border border-slate-800">
                    <Send size={20} />
                 </a>
            </div>
          </div>

          {/* Col 2: Guía Subastas (Thematic Cluster) (Span 3) */}
          <div className="md:col-span-3">
            <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2 border-b border-slate-900 pb-2 w-fit">
                <BookOpen size={18} className="text-brand-500"/> Guía Subastas
            </h4>
            <ul className="space-y-3 text-sm">
              <li><Link to={ROUTES.NOTICIAS_SUBASTAS_INDEX} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200 font-bold text-brand-400">Noticias de subastas</Link></li>
              <li><Link to={ROUTES.GLOSSARY} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200 font-bold text-brand-400">Glosario de términos</Link></li>
              <li><Link to={ROUTES.GUIDE_PILLAR} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">Subastas judiciales en España</Link></li>
              <li><Link to={ROUTES.RULE_70} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">Regla del 70%</Link></li>
              <li><Link to={ROUTES.DEPOSIT} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">Depósito del 5%</Link></li>
              <li><Link to={ROUTES.ANALYSIS} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">Cómo analizar una subasta</Link></li>
              <li><Link to={ROUTES.EXAMPLES_INDEX} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200 font-bold text-emerald-400">Ejemplos de análisis</Link></li>
              <li><Link to={ROUTES.PROFITABILITY_CALC_GUIDE} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">Calculadora de Rentabilidad</Link></li>
              <li><Link to="/subastas/madrid" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">Subastas en Madrid</Link></li>
              <li><Link to="/subastas/barcelona" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">Subastas en Barcelona</Link></li>
              <li><Link to="/subastas/valencia" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">Subastas en Valencia</Link></li>
              <li><Link to="/subastas/sevilla" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">Subastas en Sevilla</Link></li>
              <li><Link to={ROUTES.CHARGES} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">Cargas en subasta judicial</Link></li>
              <li><Link to={ROUTES.OCCUPIED} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">Vivienda ocupada en subasta</Link></li>
            </ul>
          </div>

          {/* Col 3: Navegación General (Span 2) */}
          <div className="md:col-span-2">
            <h4 className="text-white font-bold text-lg mb-6 border-b border-slate-900 pb-2 w-fit">Navegación</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to={ROUTES.RECENT_AUCTIONS} className="hover:text-white transition-colors">Subastas Recientes</Link></li>
              <li><Link to={ROUTES.NOTICIAS_SUBASTAS_INDEX} className="hover:text-white transition-colors">Noticias de subastas</Link></li>
              <li><Link to={ROUTES.HISTORICAL_AUCTIONS} className="hover:text-white transition-colors">Histórico de Subastas</Link></li>
              <li><Link to={ROUTES.ABOUT} className="hover:text-white transition-colors">Sobre mí</Link></li>
              <li><a href="#como-te-ayudo" onClick={(e) => handleNavClick(e, '#como-te-ayudo')} className="hover:text-white transition-colors">Servicios</a></li>
              <li><a href="#metodo" onClick={(e) => handleNavClick(e, '#metodo')} className="hover:text-white transition-colors">Método</a></li>
              <li><a href="#precios" onClick={(e) => handleNavClick(e, '#precios')} className="hover:text-white transition-colors">Precios</a></li>
              <li><a href="https://sublaunch.com/activosoffmarket" target="_blank" rel="noopener noreferrer" className="text-brand-400 font-bold hover:text-brand-300">Canal Premium</a></li>
            </ul>
          </div>

          {/* Col 4: Legal (Span 3) */}
          <div className="md:col-span-3">
            <h4 className="text-white font-bold text-lg mb-6 border-b border-slate-900 pb-2 w-fit">Legal</h4>
            <ul className="space-y-3 text-sm mb-8">
              <li><Link to={ROUTES.LEGAL} className="hover:text-white transition-colors">Aviso Legal</Link></li>
              <li><Link to={ROUTES.PRIVACY} className="hover:text-white transition-colors">Política de Privacidad</Link></li>
              <li><Link to={ROUTES.COOKIES} className="hover:text-white transition-colors">Política de Cookies</Link></li>
              <li><Link to={ROUTES.TERMS} className="hover:text-white transition-colors">Términos y Condiciones</Link></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-900 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-slate-600">
          <p>© {new Date().getFullYear()} Activos Off-Market. Todos los derechos reservados.</p>
          <div className="flex gap-8">
            <a href="https://t.me/activosoffmarket" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors flex items-center gap-2"><Send size={12} /> Contacto Telegram</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;