import React, { useEffect, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ChevronRight, MapPin, TrendingUp, Filter, ShieldCheck, Clock } from 'lucide-react';
import { ROUTES } from '../constants/routes';
import { AUCTIONS } from '../data/auctions';
import { getFilteredAuctions } from '../utils/auctionHelpers';
import { isAuctionFinished, sortAuctions } from '../utils/auctionHelpers';
import { normalizeProvince, normalizePropertyType, normalizeLocationLabel } from '../utils/auctionNormalizer';
import { trackConversion } from '../utils/tracking';
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

const ProvinceHub: React.FC = () => {
  const { province } = useParams<{ province: string }>();
  const normalizedProvinceParam = province?.toLowerCase() || '';
  
  const GuideComponent = CITY_GUIDES[normalizedProvinceParam];

  const provinceAuctions = useMemo(() => {
    if (!province) return [];
    const filtered = Object.entries(AUCTIONS).filter(([_, a]) => {
      const p = normalizeProvince(a.province || a.city).toLowerCase();
      return p === normalizedProvinceParam || p.includes(normalizedProvinceParam) || normalizedProvinceParam.includes(p);
    });
    return sortAuctions(filtered);
  }, [province, normalizedProvinceParam]);

  const activeAuctions = useMemo(() => {
    return provinceAuctions.filter(([_, data]: [string, any]) => data.status !== 'closed' && !isAuctionFinished(data.auctionDate));
  }, [provinceAuctions]);

  const zones = useMemo(() => {
    const zoneSet = new Set<string>();
    provinceAuctions.forEach(([_, data]: [string, any]) => {
      if (data.zone && !isAuctionFinished(data.auctionDate)) {
        zoneSet.add(data.zone);
      }
    });
    return Array.from(zoneSet).sort();
  }, [provinceAuctions]);

  const propertyTypes = useMemo(() => {
    const typeSet = new Set<string>();
    provinceAuctions.forEach(([_, data]: [string, any]) => {
      if (data.propertyType && !isAuctionFinished(data.auctionDate)) {
        typeSet.add(normalizePropertyType(data.propertyType));
      }
    });
    return Array.from(typeSet).sort();
  }, [provinceAuctions]);

  const marketStats = useMemo(() => {
    if (activeAuctions.length === 0) return null;
    let validAuctionsCount = 0;
    const totalDiscount = activeAuctions.reduce((acc, [_, a]) => {
      if (a.appraisalValue && a.claimedDebt !== undefined && a.claimedDebt !== null && a.appraisalValue > a.claimedDebt) {
        const discount = 1 - a.claimedDebt / a.appraisalValue;
        if (a.claimedDebt !== 0 && discount <= 0.85) {
          validAuctionsCount++;
          return acc + discount;
        }
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

  const topOpportunities = useMemo(() => {
    return activeAuctions
      .map(([slug, data]: [string, any]) => {
        const valorReferencia = data.valorTasacion || data.valorSubasta || data.appraisalValue;
        const cantidadReclamada = data.claimedDebt;
        let ratio = (valorReferencia && cantidadReclamada !== undefined && cantidadReclamada !== null) 
          ? Math.round(((valorReferencia - cantidadReclamada) / valorReferencia) * 100)
          : 0;
        if (cantidadReclamada === 0 || ratio > 85) {
          ratio = 0;
        }
        return { slug, data, ratio };
      })
      .filter(item => item.ratio > 40)
      .sort((a, b) => b.ratio - a.ratio)
      .slice(0, 3);
  }, [activeAuctions]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (province) {
      document.title = `Subastas en ${province.charAt(0).toUpperCase() + province.slice(1)} | Activos Off-Market`;
    }
  }, [province]);

  if (!province) return <Navigate to={ROUTES.HOME} replace />;

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
            <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md capitalize">Subastas en {province}</span>
          </nav>
          
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight capitalize">
            Subastas en {province}
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mb-8 leading-relaxed">
            Descubre el listado actualizado de subastas judiciales, notariales y de Hacienda en la provincia de <span className="capitalize font-medium">{province}</span>. Analizamos diariamente el BOE para identificar pisos, casas y locales con alto potencial de rentabilidad. Accede a los datos clave, calcula tu puja máxima y encuentra oportunidades de inversión por debajo del valor de mercado.
          </p>
        </div>
      )}

      {/* Dynamic Auctions Section (Bottom) */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-slate-200">
        {marketStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="bg-brand-50 p-3 rounded-xl text-brand-600">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Subastas activas</p>
                <p className="text-2xl font-bold text-slate-900">{marketStats.totalActive}</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Descuento medio</p>
                <p className="text-2xl font-bold text-slate-900">-{marketStats.avgDiscount}%</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
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

        {topOpportunities.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold text-slate-900 capitalize">
                Mejores oportunidades en {province}
              </h2>
              <button 
                onClick={() => document.getElementById('all-auctions')?.scrollIntoView({ behavior: 'smooth' })}
                className="hidden md:flex items-center gap-2 text-brand-600 font-medium hover:text-brand-700 transition-colors"
              >
                Ver todas las oportunidades <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {topOpportunities.map(({ slug, data }: { slug: string, data: any }) => (
                <AuctionCard key={slug} slug={slug} data={data} />
              ))}
            </div>
            <button 
              onClick={() => document.getElementById('all-auctions')?.scrollIntoView({ behavior: 'smooth' })}
              className="mt-6 w-full md:hidden flex justify-center items-center gap-2 bg-brand-50 text-brand-700 font-bold px-4 py-3 rounded-xl border border-brand-100 hover:bg-brand-100 transition-colors"
            >
              Ver todas las oportunidades <ChevronRight size={18} />
            </button>
          </div>
        )}

        <div id="all-auctions" className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pt-8 border-t border-slate-200">
          <div>
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2 capitalize">
              Todas las subastas en {province}
            </h2>
            <p className="text-slate-500">
              {activeAuctions.length} oportunidades analizadas actualmente.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Link 
              to={`/subastas/${normalizedProvinceParam}/oportunidades`}
              onClick={() => trackConversion(province || 'general', 'listing', 'listado')}
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
                    to={`/subastas/${normalizedProvinceParam}/${zone.toLowerCase().replace(/\s+/g, '-')}`}
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

        {provinceAuctions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {provinceAuctions.map(([slug, data]: [string, any]) => (
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
              Actualmente no hay subastas que cumplan nuestros criterios de calidad en la provincia de {province}. Vuelve pronto o suscríbete a nuestras alertas.
            </p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default ProvinceHub;
