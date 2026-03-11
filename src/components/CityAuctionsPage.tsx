import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';
import { ROUTES } from '../routes';
import { MapPin, DollarSign, ChevronRight } from 'lucide-react';

const CityAuctionsPage: React.FC = () => {
  const { city } = useParams();
  const cityName = city ? city.charAt(0).toUpperCase() + city.slice(1) : '';

  const cityAuctions = Object.entries(AUCTIONS).filter(
    ([_, data]) => data.city?.toLowerCase() === city?.toLowerCase()
  );

  useEffect(() => {
    document.title = `Subastas inmobiliarias en ${cityName} | Activos Off-Market`;
    window.scrollTo(0, 0);
  }, [cityName]);

  return (
    <div className="bg-slate-50 min-h-screen pb-20 px-6 pt-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">
            Subastas inmobiliarias en {cityName}
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Descubre las oportunidades de inversión en subastas judiciales y administrativas en {cityName}. 
            Analizamos el mercado local para ayudarte a encontrar las mejores opciones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {cityAuctions.map(([slug, data]) => (
            <div key={slug} className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden hover:shadow-xl transition-all group">
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">
                  {data.propertyType} en {data.zone}
                </h3>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <MapPin size={16} className="text-brand-500" />
                    <span>{data.zone}</span>
                  </div>
                  {data.appraisalValue && (
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <DollarSign size={16} className="text-brand-500" />
                      <span>Tasación: <span className="font-bold text-slate-900">{data.appraisalValue.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span></span>
                    </div>
                  )}
                </div>
                <Link 
                  to={`/ejemplo-subasta/${slug}`}
                  className="inline-flex items-center justify-center gap-2 w-full bg-slate-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-brand-600 transition-all"
                >
                  Ver subasta <ChevronRight size={18} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mb-12">
          <Link to={ROUTES.CALCULATOR} className="inline-block bg-brand-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-brand-700 transition-all">
            Ir a la calculadora de subastas
          </Link>
        </div>

        <div className="flex justify-center gap-4">
          <Link to={`/analizar-subasta/${city}`} className="text-brand-700 font-bold hover:underline">Cómo analizar subastas en {cityName}</Link>
          <Link to={`/calcular-puja-subasta/${city}`} className="text-brand-700 font-bold hover:underline">Calcular puja en {cityName}</Link>
        </div>
      </div>
    </div>
  );
};

export default CityAuctionsPage;
