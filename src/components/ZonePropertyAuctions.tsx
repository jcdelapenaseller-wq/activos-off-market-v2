import React, { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';
import { ChevronRight, MapPin, DollarSign, TrendingUp, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../routes';
import { CITY_MAP, PROPERTY_TYPE_MAP } from '../constants';

const ZonePropertyAuctions: React.FC = () => {
  const { city: cityParam, propertyType: propertyTypeParam, zone: zoneParam } = useParams<{ city: string; propertyType: string; zone: string }>();

  const city = useMemo(() => cityParam ? CITY_MAP[cityParam.toLowerCase()] || cityParam.charAt(0).toUpperCase() + cityParam.slice(1) : '', [cityParam]);
  const propertyType = useMemo(() => propertyTypeParam ? PROPERTY_TYPE_MAP[propertyTypeParam.toLowerCase()] || propertyTypeParam.charAt(0).toUpperCase() + propertyTypeParam.slice(1) : '', [propertyTypeParam]);
  const zone = useMemo(() => zoneParam ? zoneParam.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : '', [zoneParam]);

  const filteredAuctions = useMemo(() => {
    return Object.entries(AUCTIONS).filter(([_, data]) => {
      const cityMatch = data.city?.toLowerCase() === city.toLowerCase();
      const typeMatch = data.propertyType?.toLowerCase() === propertyType.toLowerCase();
      const zoneMatch = data.zone?.toLowerCase() === zone.toLowerCase();
      return cityMatch && typeMatch && zoneMatch;
    });
  }, [city, propertyType, zone]);

  useEffect(() => {
    if (city && propertyType && zone) {
      document.title = `Subastas de ${propertyType} en ${zone}, ${city} | Activos Off-Market`;
    }
    window.scrollTo(0, 0);
  }, [city, propertyType, zone]);

  return (
    <div className="bg-slate-50 min-h-screen pb-20 px-6 pt-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link to={ROUTES.EXAMPLES_INDEX} className="inline-flex items-center gap-2 text-brand-600 font-bold hover:text-brand-700 transition-colors">
            <ArrowLeft size={20} /> Ver todos los ejemplos
          </Link>
        </div>

        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">
            Subastas de {propertyType} en {zone}, {city}
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl">
            Descubre las oportunidades de inversión en subastas de {propertyType.toLowerCase()} en la zona de {zone}, {city}. 
            Analizamos el mercado local para ayudarte a encontrar las mejores opciones.
          </p>
        </div>

        {filteredAuctions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAuctions.map(([slug, data]) => (
              <div key={slug} className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden hover:shadow-xl transition-all group">
                <div className="p-6">
                  <div className="flex items-center gap-2 text-brand-600 font-bold text-sm uppercase tracking-wider mb-3">
                    <TrendingUp size={16} /> Análisis de oportunidad
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">
                    {data.propertyType} en subasta en {data.zone}
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <MapPin size={16} className="text-brand-500" />
                      <span>{data.zone}</span>
                    </div>
                    {data.appraisalValue && (
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <DollarSign size={16} className="text-brand-500" />
                        <span>Valor tasación: <span className="font-bold text-slate-900">{data.appraisalValue.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span></span>
                      </div>
                    )}
                  </div>

                  <Link 
                    to={`/ejemplo-subasta/${slug}`}
                    className="inline-flex items-center justify-center gap-2 w-full bg-slate-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-brand-600 transition-all group-hover:translate-y-[-2px]"
                  >
                    Ver análisis completo <ChevronRight size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No hay subastas disponibles</h2>
            <p className="text-slate-600 mb-8">
              Actualmente no hay ejemplos analizados de {propertyType} en {zone}, {city}.
            </p>
          </div>
        )}

        <div className="mt-16 bg-brand-900 rounded-3xl p-10 text-center text-white">
          <h2 className="text-3xl font-serif font-bold mb-4">¿Quieres aprender a analizar estas subastas?</h2>
          <Link 
            to={ROUTES.CALCULATOR}
            className="inline-flex items-center gap-2 bg-white text-brand-900 font-bold py-4 px-8 rounded-xl hover:bg-brand-50 transition-all"
          >
            Ir a la calculadora de subastas <ChevronRight size={20} />
          </Link>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Link to={`/subastas-${propertyTypeParam}-${cityParam}`} className="text-brand-700 font-bold hover:underline">Ver todas las subastas de {propertyType} en {city}</Link>
          <Link to={`/subastas-en-${cityParam}`} className="text-brand-700 font-bold hover:underline">Ver todas las subastas en {city}</Link>
          <Link to={ROUTES.CALCULATOR} className="text-brand-700 font-bold hover:underline">Calculadora de subastas</Link>
        </div>
      </div>
    </div>
  );
};

export default ZonePropertyAuctions;
