import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, DollarSign, TrendingUp, ChevronRight, Calculator, Calendar, ArrowRight, Percent } from 'lucide-react';
import { AUCTIONS } from '../data/auctions';
import { ROUTES } from '../routes';

const RecentAuctions: React.FC = () => {
  // Get all auctions and reverse them to show most recent first (by insertion order)
  const allAuctions = Object.entries(AUCTIONS).reverse().slice(0, 20);

  const formatPublishedDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date('2026-03-12T16:58:36Z'); // Using current runtime date for consistency
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Publicado hoy";
    } else if (diffDays < 30) {
      return `Publicado hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    } else {
      return `Publicado el ${date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Últimas subastas inmobiliarias detectadas | Activos Off-Market";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', "Listado de las subastas judiciales y administrativas más recientes detectadas en España. Análisis técnico y oportunidades de inversión inmobiliaria.");
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-600">
      <header className="bg-white border-b border-slate-200 pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex items-center text-sm text-slate-500 mb-8 font-medium" aria-label="Breadcrumb">
            <Link to={ROUTES.HOME} className="hover:text-brand-600 transition-colors">Inicio</Link>
            <ChevronRight size={14} className="mx-2" />
            <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md" aria-current="page">Subastas Recientes</span>
          </nav>

          <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight">
            Últimas subastas inmobiliarias detectadas
          </h1>

          <div className="prose prose-lg prose-slate max-w-3xl">
            <p className="text-xl leading-relaxed text-slate-600">
              El mercado de subastas públicas en España es extremadamente dinámico, con cientos de nuevos activos publicados cada semana en el Portal del BOE. Mantenerse actualizado es la clave para detectar oportunidades antes que la competencia. En esta sección listamos los últimos análisis técnicos realizados sobre subastas judiciales y administrativas en las principales ciudades españolas.
            </p>
            <p className="text-slate-600">
              Cada una de estas subastas ha sido filtrada y analizada bajo criterios de rentabilidad y seguridad jurídica. Analizamos desde la certificación de cargas hasta el entorno inmobiliario local para ofrecerte una visión clara del potencial de cada activo. Recuerda que el tiempo es un factor crítico en las subastas, por lo que te recomendamos revisar esta sección frecuentemente para no perder ninguna oportunidad estratégica.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allAuctions.map(([slug, data]) => (
            <div key={slug} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all group flex flex-col h-full">
              <div className="p-8 flex-grow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-brand-600 font-bold text-xs uppercase tracking-widest">
                    <Calendar size={14} /> {formatPublishedDate(data.publishedAt) || 'Reciente'}
                  </div>
                  <div className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-tighter">
                    {data.procedureType || 'Subasta'}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-brand-600 transition-colors leading-snug">
                  {data.propertyType || 'Inmueble'} en {data.city || 'España'}
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-slate-500">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                      <MapPin size={16} className="text-brand-500" />
                    </div>
                    <span className="text-sm font-medium">{data.zone || data.city || 'Ubicación no disponible'}</span>
                  </div>
                  
                  {data.appraisalValue && (
                    <div className="flex items-center gap-3 text-slate-500">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                        <DollarSign size={16} className="text-brand-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Valor Tasación</span>
                        <span className="text-sm font-bold text-slate-900">
                          {data.appraisalValue.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-slate-500 text-sm line-clamp-3 mb-6 leading-relaxed">
                  {data.description || `Análisis técnico de ${(data.propertyType || 'inmueble').toLowerCase()} en subasta judicial en ${data.city || 'España'}. Revisión de cargas, estado de ocupación y potencial de rentabilidad.`}
                </p>
              </div>

              <div className="px-8 pb-8 mt-auto">
                <Link 
                  to={`/ejemplo-subasta/${slug}`}
                  className="inline-flex items-center justify-center gap-2 w-full bg-slate-900 text-white font-bold py-4 px-6 rounded-2xl hover:bg-brand-600 transition-all shadow-lg shadow-slate-200"
                >
                  Ver Análisis Completo <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-brand-900 rounded-[2.5rem] p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-800 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-700 rounded-full -ml-32 -mb-32 opacity-30 blur-3xl"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <TrendingUp className="text-brand-400 mx-auto mb-6" size={48} />
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-6">
              ¿Quieres saber cuánto pujar por estas subastas?
            </h2>
            <p className="text-brand-100 mb-10 text-lg leading-relaxed">
              No dejes tu inversión al azar. Utiliza nuestra calculadora profesional para determinar tu puja máxima rentable basándote en números reales.
            </p>
            <Link 
              to="/calculadora-subastas" 
              className="inline-flex items-center gap-3 bg-white text-brand-900 font-bold py-5 px-10 rounded-2xl hover:bg-brand-50 transition-all shadow-xl text-lg"
            >
              Ir a la Calculadora <Calculator size={22} />
            </Link>
          </div>
        </div>

        <div className="mt-12 bg-emerald-50 border border-emerald-100 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white shrink-0">
              <Percent size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">¿Buscas las mejores oportunidades?</h3>
              <p className="text-slate-600">Hemos seleccionado los activos con mayor margen de beneficio potencial.</p>
            </div>
          </div>
          <Link 
            to="/subastas-descuento-50" 
            className="bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-emerald-700 transition-all whitespace-nowrap"
          >
            Subastas con más del 50% de descuento
          </Link>
        </div>

        <div className="mt-20 pt-12 border-t border-slate-200">
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-8 text-center">
            Explorar subastas por ciudad
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/subastas-madrid" className="bg-white border border-slate-200 p-4 rounded-xl text-center hover:border-brand-500 hover:text-brand-700 transition-all font-bold shadow-sm">Madrid</Link>
            <Link to="/subastas-barcelona" className="bg-white border border-slate-200 p-4 rounded-xl text-center hover:border-brand-500 hover:text-brand-700 transition-all font-bold shadow-sm">Barcelona</Link>
            <Link to="/subastas-valencia" className="bg-white border border-slate-200 p-4 rounded-xl text-center hover:border-brand-500 hover:text-brand-700 transition-all font-bold shadow-sm">Valencia</Link>
            <Link to="/subastas-sevilla" className="bg-white border border-slate-200 p-4 rounded-xl text-center hover:border-brand-500 hover:text-brand-700 transition-all font-bold shadow-sm">Sevilla</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecentAuctions;
