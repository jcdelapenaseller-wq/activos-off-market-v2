import React, { useEffect, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ChevronRight, MapPin, TrendingUp, Filter, ShieldCheck, Clock } from 'lucide-react';
import { ROUTES } from '../constants/routes';
import { AUCTIONS } from '../data/auctions';
import { isAuctionFinished, sortActiveFirst } from '../utils/auctionHelpers';
import { normalizeCity, normalizePropertyType, normalizeLocationLabel } from '../utils/auctionNormalizer';
import { AuctionCard } from './AuctionCard';
import Header from './Header';
import Footer from './Footer';

// Import existing guides
import AuctionMadridGuide from './AuctionMadridGuide';
import AuctionBarcelonaGuide from './AuctionBarcelonaGuide';
import AuctionValenciaGuide from './AuctionValenciaGuide';
import AuctionSevillaGuide from './AuctionSevillaGuide';

const CITY_GUIDES: Record<string, React.FC> = {
  'madrid': AuctionMadridGuide,
  'barcelona': AuctionBarcelonaGuide,
  'valencia': AuctionValenciaGuide,
  'sevilla': AuctionSevillaGuide,
};

const CityHub: React.FC = () => {
  const { city } = useParams<{ city: string }>();
  const normalizedCityParam = city?.toLowerCase() || '';
  
  const GuideComponent = CITY_GUIDES[normalizedCityParam];

  const cityAuctions = useMemo(() => {
    if (!city) return [];
    const filtered = Object.entries(AUCTIONS).filter(([_, a]) => 
      normalizeCity(a).toLowerCase() === normalizedCityParam || 
      (a.city && a.city.toLowerCase() === normalizedCityParam)
    );
    return sortActiveFirst(filtered, (item) => item[1].auctionDate);
  }, [city, normalizedCityParam]);

  const activeAuctions = useMemo(() => {
    return cityAuctions.filter(([_, data]) => !isAuctionFinished(data.auctionDate));
  }, [cityAuctions]);

  const zones = useMemo(() => {
    const zoneSet = new Set<string>();
    cityAuctions.forEach(([_, data]) => {
      if (data.zone && !isAuctionFinished(data.auctionDate)) {
        zoneSet.add(data.zone);
      }
    });
    return Array.from(zoneSet).sort();
  }, [cityAuctions]);

  const propertyTypes = useMemo(() => {
    const typeSet = new Set<string>();
    cityAuctions.forEach(([_, data]) => {
      if (data.propertyType && !isAuctionFinished(data.auctionDate)) {
        typeSet.add(normalizePropertyType(data.propertyType));
      }
    });
    return Array.from(typeSet).sort();
  }, [cityAuctions]);

  const marketStats = useMemo(() => {
    if (activeAuctions.length === 0) return null;
    let validAuctionsCount = 0;
    const totalDiscount = activeAuctions.reduce((acc, [_, a]) => {
      if (a.appraisalValue && a.claimedDebt && a.appraisalValue > a.claimedDebt) {
        validAuctionsCount++;
        return acc + (1 - a.claimedDebt / a.appraisalValue);
      }
      return acc;
    }, 0);
    
    if (validAuctionsCount === 0) return null;
    
    const avgDiscount = (totalDiscount / validAuctionsCount) * 100;
    return {
      avgDiscount: Math.round(avgDiscount),
      totalActive: activeAuctions.length
    };
  }, [activeAuctions]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (city) {
      document.title = `Subastas judiciales en ${city.charAt(0).toUpperCase() + city.slice(1)} | Activos Off-Market`;
    }
  }, [city]);

  if (!city) return <Navigate to={ROUTES.HOME} replace />;

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-600">
      <Header />
      
      {/* SEO Guide Section (Top) */}
      {GuideComponent ? (
        <div className="city-guide-wrapper">
          <GuideComponent />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">
          <nav className="flex items-center text-sm text-slate-500 mb-8 font-medium" aria-label="Breadcrumb">
            <Link to={ROUTES.HOME} className="hover:text-brand-600 transition-colors">Inicio</Link>
            <ChevronRight size={14} className="mx-2" />
            <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md capitalize">Subastas en {city}</span>
          </nav>
          
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight capitalize">
            Subastas judiciales en {city}
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mb-12">
            Encuentra las mejores oportunidades de inversión en subastas judiciales y administrativas en {city}. Analizamos cada activo para detectar rentabilidades reales.
          </p>
        </div>
      )}

      {/* Dynamic Auctions Section (Bottom) */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-slate-200">
        {marketStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="bg-brand-50 p-3 rounded-xl text-brand-600">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Descuento medio</p>
                <p className="text-2xl font-bold text-slate-900">-{marketStats.avgDiscount}%</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Activos analizados</p>
                <p className="text-2xl font-bold text-slate-900">{marketStats.totalActive} subastas</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="bg-amber-50 p-3 rounded-xl text-amber-600">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Actualización</p>
                <p className="text-2xl font-bold text-slate-900">Diaria</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">
              Subastas activas en {city}
            </h2>
            <p className="text-slate-500">
              {activeAuctions.length} oportunidades detectadas actualmente.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Link 
              to={`/subastas/${normalizedCityParam}/oportunidades`}
              className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 font-bold px-4 py-2 rounded-xl border border-brand-100 hover:bg-brand-100 transition-colors"
            >
              <TrendingUp size={18} /> Ver Oportunidades
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          {zones.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <MapPin size={14} /> Por zona
              </h3>
              <div className="flex flex-wrap gap-2">
                {zones.map(zone => (
                  <Link 
                    key={zone}
                    to={`/subastas/${normalizedCityParam}/${zone.toLowerCase().replace(/\s+/g, '-')}`}
                    className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:border-brand-500 hover:text-brand-700 transition-all shadow-sm"
                  >
                    {zone}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {propertyTypes.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Filter size={14} /> Por tipo
              </h3>
              <div className="flex flex-wrap gap-2">
                {propertyTypes.map(type => (
                  <span 
                    key={type}
                    className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 capitalize shadow-sm"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {cityAuctions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cityAuctions.map(([slug, data]) => (
              <AuctionCard key={slug} slug={slug} data={data} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Filter className="text-slate-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No hay subastas activas en este momento</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Actualmente no hemos detectado subastas que cumplan nuestros criterios de calidad en {city}. Vuelve pronto o suscríbete a nuestras alertas.
            </p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default CityHub;
