import React, { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';
import { getFilteredAuctions } from '../utils/auctionHelpers';
import { ChevronRight, MapPin, DollarSign, TrendingUp, ArrowLeft, Percent } from 'lucide-react';
import { ROUTES } from '../constants/routes';
import { isAuctionActive, isAuctionFinished, sortActiveFirst } from '../utils/auctionHelpers';
import { normalizePropertyType, normalizeProvince, normalizeLocationLabel } from '../utils/auctionNormalizer';

const OpportunityAuctions: React.FC = () => {
  const { province } = useParams<{ province: string }>();

  const normalize = (str: string) => str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '-');

  const displayProvince = useMemo(() => {
    if (!province) return '';
    return province.charAt(0).toUpperCase() + province.slice(1);
  }, [province]);

  const opportunities = useMemo(() => {
    if (!province) return [];
    
    const normalizedProvince = normalize(province);

    const filtered = Object.entries(AUCTIONS)
      .filter(([_, data]) => {
        if (!isAuctionActive(data)) return false;
        const p = normalizeProvince(data.province || data.city);
        if (normalize(p) !== normalizedProvince && !normalize(p).includes(normalizedProvince) && !normalizedProvince.includes(normalize(p))) return false;
        if (!data.appraisalValue || data.claimedDebt === undefined || data.claimedDebt === null) return false;
        if (data.claimedDebt === 0) return false;
        
        const discount = (data.appraisalValue - data.claimedDebt) / data.appraisalValue;
        return discount >= 0.4 && discount <= 0.85;
      })
      .map(([slug, data]) => {
        const discount = (data.appraisalValue! - data.claimedDebt!) / data.appraisalValue!;
        return { slug, data, discount };
      })
      .sort((a, b) => b.discount - a.discount);
      
    return sortActiveFirst(filtered, (item) => item.data.auctionDate);
  }, [province]);

  const activeCount = useMemo(() => {
    return opportunities.filter(item => !isAuctionFinished(item.data.auctionDate)).length;
  }, [opportunities]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (displayProvince) {
      document.title = `Subastas con mayor descuento en la provincia de ${displayProvince} | Oportunidades Inmobiliarias`;
    }
  }, [displayProvince]);

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="bg-white border-b border-slate-200 pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex items-center text-sm text-slate-500 mb-8 font-medium flex-wrap gap-2">
            <Link to={ROUTES.HOME} className="hover:text-brand-600 transition-colors">Inicio</Link>
            <ChevronRight size={14} />
            <Link to={`/subastas/${province}`} className="hover:text-brand-600 transition-colors">Subastas en {displayProvince}</Link>
            <ChevronRight size={14} />
            <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md">Oportunidades</span>
          </nav>

          <h1 className="font-serif text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
            Subastas inmobiliarias con mayor descuento en {displayProvince}
          </h1>

          {activeCount > 0 && (
            <div className="mb-6 inline-flex items-center gap-2 bg-brand-50 border border-brand-100 text-brand-700 font-bold px-4 py-2 rounded-lg shadow-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
              </span>
              {activeCount} subastas activas ahora mismo
            </div>
          )}

          <div className="max-w-3xl">
            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              Identificar las mejores oportunidades de inversión en la provincia de <strong>{displayProvince}</strong> requiere un análisis exhaustivo de la relación entre el valor de tasación oficial y la deuda reclamada en el procedimiento. En esta página hemos seleccionado exclusivamente aquellas subastas judiciales y administrativas que presentan un <strong>descuento potencial superior al 40%</strong>, lo que representa un margen de seguridad excepcional para el inversor profesional. Estas operaciones permiten adquirir activos significativamente por debajo de su valor de mercado, maximizando la rentabilidad final tras considerar los costes de adjudicación y saneamiento. Explorar estas oportunidades hiperlocales en {displayProvince} es el primer paso para construir una cartera inmobiliaria sólida mediante licitaciones públicas, aprovechando las ineficiencias del mercado de ejecuciones hipotecarias y apremios administrativos.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link to={`/subastas/${province}`} className="inline-flex items-center gap-2 text-brand-600 font-bold hover:text-brand-700 transition-colors">
            <ArrowLeft size={20} /> Ver todas las subastas en {displayProvince}
          </Link>
        </div>

        {opportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {opportunities.map(({ slug, data, discount }) => {
              const isFinished = isAuctionFinished(data.auctionDate);
              return (
              <div key={slug} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col relative">
                {isFinished && (
                  <div className="absolute top-4 right-4 z-10 bg-slate-900/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/20 shadow-sm">
                    Adjudicada
                  </div>
                )}
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Oportunidad {Math.round(discount * 100)}%
                    </span>
                    <span className="text-slate-400 text-xs font-mono">
                      {data.boeId}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 mb-4 leading-snug">
                    {normalizePropertyType(data.propertyType)} en {data.address?.split(',')[0] || 'ubicación'}
                  </h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <MapPin size={16} className="text-brand-500" />
                      <span>{normalizeLocationLabel(data)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <DollarSign size={16} className="text-brand-500" />
                      <span>Valor tasación: <span className="font-bold text-slate-900">{data.appraisalValue?.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <DollarSign size={16} className="text-red-500" />
                      <span>Deuda: <span className="font-bold text-red-600">{data.claimedDebt?.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Percent size={16} className="text-green-500" />
                      <span className="text-slate-500">Descuento potencial: <span className="font-bold text-green-600">-{Math.round(discount * 100)} %</span></span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Link 
                      to={`/subasta/${slug}`}
                      className={`w-full inline-flex items-center justify-center font-bold py-3 px-6 rounded-xl transition-colors group ${isFinished ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' : 'bg-slate-900 text-white hover:bg-brand-600'}`}
                    >
                      Ver detalles
                      <ChevronRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link 
                      to={ROUTES.CALCULATOR}
                      className="w-full inline-flex items-center justify-center bg-brand-50 text-brand-700 font-bold py-3 px-6 rounded-xl hover:bg-brand-100 transition-colors"
                    >
                      Calcular puja máxima
                    </Link>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp size={40} className="text-slate-300" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">No hay oportunidades de alto descuento</h2>
            <p className="text-slate-600 mb-8">
              Actualmente no hemos detectado subastas en {displayProvince} con un descuento potencial superior al 40%. 
              Te recomendamos explorar el listado completo de subastas o volver a consultar próximamente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={`/subastas/${province}`} className="bg-brand-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-brand-700 transition-colors">
                Ver todas en {displayProvince}
              </Link>
              <Link to={ROUTES.HOME} className="bg-slate-100 text-slate-900 font-bold py-3 px-8 rounded-xl hover:bg-slate-200 transition-colors">
                Volver al inicio
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpportunityAuctions;
