import React, { useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';
import { ROUTES } from '../routes';
import ConversionBlock from './ConversionBlock';
import { Calculator, Gavel, TrendingUp, Search, ChevronRight, MapPin, Home, DollarSign } from 'lucide-react';

const AuctionDynamicPage: React.FC = () => {
  const { slug } = useParams();
  const location = useLocation();
  const auction = slug ? AUCTIONS[slug] : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!auction) return <div className="max-w-4xl mx-auto px-6 py-16">Subasta no encontrada</div>;

  const isRentabilidad = location.pathname.includes('/rentabilidad-subasta/');
  const isCalcularPuja = location.pathname.includes('/calcular-puja-subasta/');
  const isAnalizar = location.pathname.includes('/analizar-subasta/');

  const cityName = auction.city || 'la ciudad';
  const propertyType = auction.propertyType || 'inmueble';
  const zone = auction.zone || 'la zona';

  const getTitle = () => {
    if (isRentabilidad) return `Rentabilidad estimada de esta subasta en ${cityName}`;
    if (isCalcularPuja) return `Calcular puja máxima para esta subasta en ${cityName}`;
    return `Análisis detallado de esta subasta en ${cityName}`;
  };

  const similarAuctions = Object.entries(AUCTIONS)
    .filter(([s, data]) => data.city === auction.city && s !== slug)
    .slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 prose prose-slate">
      <h1>{getTitle()}</h1>
      <p className="lead">
        Analizamos los datos de este {propertyType.toLowerCase()} en {zone}, {cityName}, para ayudarte a tomar una decisión informada.
      </p>

      <div className="grid md:grid-cols-3 gap-6 my-8">
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <Gavel className="text-brand-600 mb-2" />
          <h3>Tasación</h3>
          <p>{auction.appraisalValue?.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
        </div>
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <Search className="text-brand-600 mb-2" />
          <h3>Estimación mercado</h3>
          <p>{auction.marketPriceM2Min ? `${auction.marketPriceM2Min}€/m² - ${auction.marketPriceM2Max}€/m²` : 'Consultar'}</p>
        </div>
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <TrendingUp className="text-brand-600 mb-2" />
          <h3>Rentabilidad</h3>
          <p>Análisis basado en mercado local</p>
        </div>
      </div>

      <p>
        Este {propertyType.toLowerCase()} ubicado en {zone} presenta características particulares que deben ser analizadas frente a los precios de la zona en {cityName}.
      </p>

      <ConversionBlock />

      <h2>Enlaces de interés</h2>
      <ul className="list-none p-0">
        <li><Link to={`/ejemplo-subasta/${slug}`} className="text-brand-700 hover:underline">Ver detalles del ejemplo de subasta</Link></li>
        <li><Link to={`/subastas-${auction.city?.toLowerCase()}`} className="text-brand-700 hover:underline">Ver más subastas en {cityName}</Link></li>
        <li><Link to={ROUTES.CALCULATOR} className="text-brand-700 hover:underline">Ir a la calculadora de subastas</Link></li>
      </ul>

      {similarAuctions.length > 0 && (
        <section className="mt-16">
          <h2 className="text-3xl font-bold mb-8">Subastas similares en {cityName}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarAuctions.map(([s, data]) => (
              <div key={s} className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden hover:shadow-xl transition-all group">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">
                    {data.propertyType} en {data.zone}
                  </h3>
                  <div className="text-sm text-slate-500 mb-4">
                    Tasación: <span className="font-bold text-slate-900">{data.appraisalValue?.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span>
                  </div>
                  <Link 
                    to={`/ejemplo-subasta/${s}`}
                    className="inline-flex items-center justify-center gap-2 w-full bg-slate-900 text-white font-bold py-2 px-4 rounded-xl hover:bg-brand-600 transition-all"
                  >
                    Ver análisis <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default AuctionDynamicPage;
