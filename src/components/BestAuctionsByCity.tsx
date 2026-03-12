import React, { useMemo, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';
import { ROUTES } from '../routes';
import { generateDiscoverTitle } from '../utils/discoverTitles';

const BestAuctionsByCity: React.FC = () => {
  const { city } = useParams<{ city: string }>();

  const normalizedCity = city?.toLowerCase();

  const bestAuctions = useMemo(() => {
    if (!normalizedCity) return [];

    const cityAuctions = Object.entries(AUCTIONS)
      .filter(([_, auction]) => auction.city?.toLowerCase() === normalizedCity)
      .map(([slug, auction]) => {
        const appraisal = auction.appraisalValue || 0;
        const debt = auction.claimedDebt || 0;
        const margin = appraisal > 0 ? (appraisal - debt) / appraisal : 0;
        return {
          slug,
          auction,
          margin
        };
      })
      .sort((a, b) => b.margin - a.margin)
      .slice(0, 10);

    return cityAuctions;
  }, [normalizedCity]);

  const displayCity = bestAuctions.length > 0 ? bestAuctions[0].auction.city : city ? city.charAt(0).toUpperCase() + city.slice(1) : '';

  useEffect(() => {
    if (displayCity) {
      document.title = `Las mejores subastas inmobiliarias en ${displayCity} | Activos Off-Market`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', `Descubre las subastas inmobiliarias más interesantes detectadas en ${displayCity}. Analizamos la diferencia entre tasación y deuda para encontrar las mejores oportunidades.`);
      }

      const schemaData = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": `Mejores subastas inmobiliarias en ${displayCity}`,
        "itemListElement": bestAuctions.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "url": `https://activosoffmarket.es/noticias-subastas/${item.slug}`
        }))
      };

      const scriptSchema = document.createElement('script');
      scriptSchema.setAttribute('type', 'application/ld+json');
      scriptSchema.textContent = JSON.stringify(schemaData);
      document.head.appendChild(scriptSchema);

      return () => {
        document.head.removeChild(scriptSchema);
      };
    }
  }, [displayCity, bestAuctions]);

  if (!normalizedCity || bestAuctions.length === 0) {
    return <Navigate to="/404" />;
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20 px-6 pt-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">
            Las subastas inmobiliarias más interesantes detectadas en {displayCity}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Descubre las oportunidades de inversión más recientes procedentes del Boletín Oficial del Estado (BOE) en {displayCity}. 
            Analizamos la diferencia entre el valor de tasación y la deuda reclamada para identificar aquellas subastas con mayor potencial de rentabilidad. 
            Es fundamental realizar un análisis exhaustivo antes de participar.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8">
          {bestAuctions.map(({ slug, auction }) => (
            <article key={slug} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all flex flex-col md:flex-row">
              <div className="md:w-2/5 shrink-0">
                <img 
                  src={`https://picsum.photos/seed/real-estate-auction-${slug}/800/450`} 
                  alt={`Subasta en ${auction.zone}, ${displayCity}`} 
                  className="w-full h-full object-cover aspect-video md:aspect-auto"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-6 md:p-8 flex flex-col justify-center w-full">
                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4 line-clamp-2">
                  {`${auction.propertyType || 'Inmueble'} en subasta en ${displayCity} con tasación de ${auction.appraisalValue?.toLocaleString('es-ES')}€ y deuda de ${auction.claimedDebt?.toLocaleString('es-ES')}€`}
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Zona</p>
                    <p className="font-semibold text-slate-900 truncate" title={auction.zone}>{auction.zone}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Tipo</p>
                    <p className="font-semibold text-slate-900">{auction.propertyType}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Tasación</p>
                    <p className="font-semibold text-slate-900">{auction.appraisalValue?.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Deuda</p>
                    <p className="font-semibold text-red-600">{auction.claimedDebt?.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Descuento potencial</p>
                    <p className={`font-semibold ${auction.appraisalValue && auction.claimedDebt && ((auction.appraisalValue - auction.claimedDebt) / auction.appraisalValue * 100) > 40 ? 'text-green-600' : 'text-slate-900'}`}>
                      {auction.appraisalValue && auction.claimedDebt ? `-${Math.round((auction.appraisalValue - auction.claimedDebt) / auction.appraisalValue * 100)} %` : 'N/D'}
                    </p>
                  </div>
                </div>
                
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
                  <Link 
                    to={`/noticias-subastas/${slug}`} 
                    className="inline-flex items-center justify-center bg-slate-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-brand-600 transition-all w-full text-center"
                  >
                    Ver análisis completo
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link 
            to={`/subastas-${normalizedCity}`} 
            className="inline-flex items-center justify-center text-brand-700 font-bold hover:text-brand-800 transition-colors text-lg"
          >
            Ver todas las subastas activas en {displayCity}
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </Link>
        </div>

        <div className="mt-16 bg-brand-50 rounded-3xl p-8 md:p-12 text-center border border-brand-100">
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">
            ¿Quieres participar en alguna de estas subastas?
          </h2>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            El mayor riesgo en una subasta es pujar por encima del límite de rentabilidad. Utiliza nuestra calculadora gratuita para estimar tu puja máxima con seguridad.
          </p>
          <Link 
            to={ROUTES.CALCULATOR} 
            className="inline-block bg-brand-600 text-white font-bold text-lg py-4 px-10 rounded-xl hover:bg-brand-700 transition-all shadow-lg hover:shadow-xl"
          >
            Calcular puja máxima para estas subastas
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BestAuctionsByCity;
