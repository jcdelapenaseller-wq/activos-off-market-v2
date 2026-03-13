import React, { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';
import { Calendar, ChevronRight, MapPin } from 'lucide-react';
import { generateDiscoverTitle } from '../utils/discoverTitles';
import { ROUTES } from '../routes';

const DiscoverCityArticles: React.FC = () => {
  const { city } = useParams<{ city: string }>();
  
  const cityName = useMemo(() => {
    if (!city) return '';
    return city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
  }, [city]);

  useEffect(() => {
    if (cityName) {
      document.title = `Subastas inmobiliarias detectadas recientemente en ${cityName} | Activos Off-Market`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', `Listado de las últimas subastas judiciales y administrativas detectadas en ${cityName}. Análisis de oportunidades de inversión inmobiliaria.`);
      }
    }
    window.scrollTo(0, 0);
  }, [cityName]);

  const articles = useMemo(() => {
    if (!city) return [];
    
    const normalizedCity = city.toLowerCase();
    
    return Object.entries(AUCTIONS)
      .filter(([_, auction]) => auction.city?.toLowerCase() === normalizedCity)
      .map(([slug, auction], index) => {
        // Generate a deterministic date based on index so they can be sorted
        const date = new Date();
        date.setDate(date.getDate() - index * 2);
        
        const discount = auction.appraisalValue && auction.claimedDebt 
          ? Math.round((1 - auction.claimedDebt / auction.appraisalValue) * 100)
          : null;

        const altText = `Subasta de ${auction.propertyType?.toLowerCase()} en ${auction.zone} ${auction.city}${discount ? ` con descuento del ${discount}% sobre tasación` : ''}`;
        
        return {
          slug,
          auction,
          date,
          title: generateDiscoverTitle(slug, auction),
          imageUrl: `https://picsum.photos/seed/real-estate-building-facade-auction-${slug}/800/450`,
          altText
        };
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [city]);

  if (!city) return null;

  return (
    <div className="bg-slate-50 min-h-screen pb-20 px-6 pt-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <nav className="flex items-center justify-center text-sm text-slate-500 mb-8 font-medium" aria-label="Breadcrumb">
            <Link to={ROUTES.HOME} className="hover:text-brand-600 transition-colors">Inicio</Link>
            <ChevronRight size={14} className="mx-2" />
            <Link to={ROUTES.NOTICIAS_SUBASTAS_INDEX} className="hover:text-brand-600 transition-colors">Noticias</Link>
            <ChevronRight size={14} className="mx-2" />
            <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md" aria-current="page">{cityName}</span>
          </nav>

          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">
            Subastas inmobiliarias detectadas recientemente en {cityName}
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed text-left">
            El mercado inmobiliario de {cityName} es uno de los más dinámicos de España, y las subastas judiciales representan una vía excepcional para adquirir activos con descuentos significativos. En esta sección, recopilamos y analizamos las últimas oportunidades detectadas en el portal del BOE dentro de la ciudad de {cityName} y su área metropolitana. 
          </p>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed text-left mt-4">
            Desde pisos en barrios consolidados hasta locales comerciales con alto potencial de rentabilidad, cada activo listado aquí ha sido identificado recientemente por nuestro sistema de rastreo. Es fundamental recordar que el éxito en una subasta en {cityName} depende de un análisis riguroso de las cargas registrales y una valoración precisa del mercado local. Te invitamos a explorar cada noticia para entender los detalles técnicos de cada expediente y utilizar nuestras herramientas de cálculo para asegurar tu margen de beneficio antes de realizar cualquier puja oficial.
          </p>
        </header>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 gap-8">
            {articles.map((article) => (
              <article key={article.slug} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all flex flex-col md:flex-row">
                <Link to={`/noticias-subastas/${article.slug}`} className="md:w-2/5 shrink-0 block relative group">
                  <img 
                    src={article.imageUrl} 
                    alt={article.altText}
                    className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-brand-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                    Oportunidad
                  </div>
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-slate-900 p-2 rounded-lg shadow-lg">
                    <MapPin size={16} className="text-brand-600" />
                  </div>
                  {article.auction.appraisalValue && article.auction.claimedDebt && (
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm text-brand-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                      -{Math.round((1 - article.auction.claimedDebt / article.auction.appraisalValue) * 100)}% Dto.
                    </div>
                  )}
                </Link>
                <div className="p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                    <Calendar size={16} />
                    <time dateTime={article.date.toISOString()}>
                      {article.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </time>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 hover:text-brand-600 transition-colors">
                    <Link to={`/noticias-subastas/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h2>
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-4">
                    <MapPin size={14} className="text-brand-500" />
                    <span>{article.auction.zone}, {article.auction.city}</span>
                  </div>
                  <p className="text-slate-600 mb-6 line-clamp-2">
                    Una nueva oportunidad acaba de aparecer en el portal de subastas: un {article.auction.propertyType?.toLowerCase()} ubicado en {article.auction.zone}, {article.auction.city}.
                  </p>
                  <Link 
                    to={`/noticias-subastas/${article.slug}`}
                    className="inline-flex items-center gap-2 text-brand-600 font-bold hover:text-brand-800 transition-colors mt-auto"
                  >
                    Leer noticia completa <ChevronRight size={18} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
            <p className="text-slate-600 text-lg">No se han detectado subastas recientes en {cityName} en este momento.</p>
            <Link to={ROUTES.NOTICIAS_SUBASTAS_INDEX} className="inline-block mt-6 text-brand-600 font-bold hover:underline">
              Ver todas las noticias de España
            </Link>
          </div>
        )}

        <div className="mt-16 bg-slate-900 rounded-3xl p-10 text-white text-center">
          <h2 className="text-2xl font-serif font-bold mb-4">¿Buscas subastas en otras ciudades?</h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto">
            También analizamos oportunidades en los principales núcleos urbanos de España.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/noticias-subastas/madrid" className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full transition-colors">Madrid</Link>
            <Link to="/noticias-subastas/barcelona" className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full transition-colors">Barcelona</Link>
            <Link to="/noticias-subastas/valencia" className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full transition-colors">Valencia</Link>
            <Link to="/noticias-subastas/sevilla" className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full transition-colors">Sevilla</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoverCityArticles;
