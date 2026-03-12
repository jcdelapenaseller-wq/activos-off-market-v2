import React, { useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';
import { ROUTES } from '../routes';
import ConversionBlock from './ConversionBlock';
import RelatedAuctions from './RelatedAuctions';
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

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 prose prose-slate">
      <h1>{getTitle()}</h1>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mt-6">
        <h2 className="text-xl font-bold text-slate-900 mb-2">¿Cuánto deberías pujar realmente por esta subasta?</h2>
        <p className="text-slate-700 mb-4">Muchos inversores pierden dinero porque calculan mal la puja máxima teniendo en cuenta cargas, costes y margen de seguridad.</p>
        <Link to={`/calcular-puja-subasta/${slug}`} className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
          Calcular puja máxima
        </Link>
      </div>
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

      {slug && <RelatedAuctions currentAuctionSlug={slug} currentAuctionData={auction} />}
    </div>
  );
};

export default AuctionDynamicPage;
