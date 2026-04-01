import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, DollarSign, TrendingUp, ChevronRight, Calculator, Calendar, ArrowRight, Percent } from 'lucide-react';
import { AUCTIONS } from '../data/auctions';
import { ROUTES } from '../constants/routes';
import { getFilteredAuctions, isAuctionFinished, sortAuctions, formatDate, isAuctionActive } from '../utils/auctionHelpers';
import { AuctionCard } from './AuctionCard';
import { AuctionFilters } from './AuctionFilters';
import { AuctionData } from '../data/auctions';
import { ShareButtons } from './ShareButtons';
import { DiscoverReportsBlock } from './DiscoverReportsBlock';
import RadarPremiumCTA from './RadarPremiumCTA';
import { prefetchAuction } from '../utils/prefetch';

const RecentAuctions: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredAuctions, setFilteredAuctions] = useState<Record<string, AuctionData>>(AUCTIONS);
  const [sortBy, setSortBy] = useState<string>('recent');
  
  const currentPage = useMemo(() => {
    const pageParam = searchParams.get("page");
    return pageParam ? Number(pageParam) : 1;
  }, [searchParams]);

  console.log("currentPage", currentPage);

  const itemsPerPage = 12;
  
  const sortedAuctions = sortAuctions(Object.entries(filteredAuctions), sortBy);
  
  // Calculate total active auctions (without filters)
  const totalActiveAuctions = useMemo(() => {
    return Object.values(AUCTIONS).filter(a => isAuctionActive(a)).length;
  }, []);

  console.log('RecentAuctions: Total AUCTIONS keys:', Object.keys(AUCTIONS).length);
  const auctionsWithBadges = useMemo(() => {
    let newBadgeCount = 0;
    return sortedAuctions.map(([slug, data]) => {
      const showNewBadge = data.isNew && newBadgeCount < 6;
      if (showNewBadge) newBadgeCount++;
      return { slug, data, showNewBadge };
    });
  }, [sortedAuctions]);
  
  // Pagination logic
  const totalPages = Math.ceil(auctionsWithBadges.length / itemsPerPage);
  const safePage = Math.min(currentPage, totalPages || 1);
  const paginatedAuctions = useMemo(() => {
    const startIndex = (safePage - 1) * itemsPerPage;
    const result = auctionsWithBadges.slice(startIndex, startIndex + itemsPerPage);
    console.log('RecentAuctions: paginatedAuctions:', result);
    return result;
  }, [auctionsWithBadges, safePage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      if (page === 1) {
        params.delete('page');
      } else {
        params.set('page', page.toString());
      }
      return params;
    }, { replace: false });
  };

  const handleFilterChange = useCallback((newFiltered: Record<string, AuctionData>) => {
    setFilteredAuctions(newFiltered);
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      return params;
    }, { replace: false });
  }, [setSearchParams]);

  const handleSortChange = useCallback((newSort: string) => {
    setSortBy(newSort);
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      return params;
    }, { replace: false });
  }, [setSearchParams]);
  
  const activeCount = Object.keys(filteredAuctions).length;
  const hasFilters = activeCount !== totalActiveAuctions;

  const getSortLabel = (sort: string) => {
    switch (sort) {
      case 'oldest': return 'Más antiguas';
      case 'value_high': return 'Mayor valor';
      case 'value_low': return 'Menor valor';
      default: return '';
    }
  };

  const sortLabel = getSortLabel(sortBy);

  useEffect(() => {
    if (safePage > 1) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo(0, 0);
    }
    
    document.title = "Últimas subastas inmobiliarias detectadas | Activos Off-Market";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', "Listado de las subastas judiciales y administrativas más recientes detectadas en España. Análisis técnico y oportunidades de inversión inmobiliaria.");

    // SEO Pagination: noindex,follow for page > 1
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (safePage > 1) {
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta');
        robotsMeta.setAttribute('name', 'robots');
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute('content', 'noindex,follow');
    } else if (robotsMeta) {
      robotsMeta.setAttribute('content', 'index,follow');
    }

    // Canonical link: always base URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', window.location.origin + window.location.pathname);
  }, [safePage]);

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-600">
      <header className="bg-white border-b border-slate-200 pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex items-center text-sm text-slate-500 mb-8 font-medium" aria-label="Breadcrumb">
            <Link 
              to={ROUTES.HOME} 
              className="hover:text-brand-600 transition-colors"
            >
              Inicio
            </Link>
            <ChevronRight size={14} className="mx-2" />
            <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md" aria-current="page">Subastas Recientes</span>
          </nav>

          <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Últimas subastas inmobiliarias detectadas
          </h1>
          <p className="text-slate-500 text-sm mb-8 max-w-2xl">
            Filtra por provincia, tipo de inmueble o estado para encontrar oportunidades más rápido.
          </p>

          <ShareButtons 
            title="Últimas subastas inmobiliarias detectadas en España" 
            className="-mt-2" 
            province="España"
            origin="listing"
          />
        </div>
      </header>

      <div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-slate-50/95 -mx-6 px-6 pt-4 pb-2 mb-6 border-b border-slate-200/50">
            <RadarPremiumCTA 
              location="España" 
              variant="bar"
              origin="listing"
            />
            <AuctionFilters auctions={AUCTIONS} onFilteredChange={handleFilterChange} onSortChange={handleSortChange} />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 text-brand-700 font-bold px-4 py-2 rounded-lg shadow-sm w-fit">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
            </span>
            {hasFilters 
              ? `Mostrando ${activeCount} de ${totalActiveAuctions} subastas` 
              : `${totalActiveAuctions} subastas activas ahora`}
          </div>

          {sortLabel && (
            <div className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-600 text-sm px-3 py-1.5 rounded-md w-fit">
              <span className="font-medium">Orden:</span> {sortLabel}
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedAuctions.length > 0 ? paginatedAuctions.map(({ slug, data, showNewBadge }) => (
            <AuctionCard key={slug} slug={slug} data={data} showNewBadge={showNewBadge} showImage={false} />
          )) : (
            <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-lg">No se han encontrado subastas con los filtros actuales.</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
              >
                Reiniciar filtros
              </button>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-12 flex flex-wrap justify-center items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 rounded-lg font-bold transition-all ${
                  safePage === page
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-200'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-500 hover:text-brand-600'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}

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
            Hub de contenido y subastas por ciudad
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Link 
              to={ROUTES.NOTICIAS_SUBASTAS_INDEX} 
              className="flex items-center justify-between bg-white border border-slate-200 p-6 rounded-2xl hover:border-brand-500 hover:shadow-md transition-all group"
            >
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-brand-600">Noticias de Subastas</h3>
                <p className="text-sm text-slate-500">Actualidad y avisos del BOE</p>
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-brand-600" />
            </Link>
            <Link 
              to={ROUTES.HIGH_DISCOUNT} 
              className="flex items-center justify-between bg-white border border-slate-200 p-6 rounded-2xl hover:border-brand-500 hover:shadow-md transition-all group"
            >
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-brand-600">Subastas con Descuento</h3>
                <p className="text-sm text-slate-500">Más del 50% sobre tasación</p>
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-brand-600" />
            </Link>
            <Link 
              to={ROUTES.GUIDE_PILLAR} 
              className="flex items-center justify-between bg-white border border-slate-200 p-6 rounded-2xl hover:border-brand-500 hover:shadow-md transition-all group"
            >
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-brand-600">Guía de Inversión</h3>
                <p className="text-sm text-slate-500">Aprende a pujar con seguridad</p>
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-brand-600" />
            </Link>
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">Explorar por ciudad</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link 
              to="/subastas-en/madrid" 
              className="bg-white border border-slate-200 p-4 rounded-xl text-center hover:border-brand-500 hover:text-brand-700 transition-all font-bold shadow-sm"
            >
              Madrid
            </Link>
            <Link 
              to="/subastas-en/barcelona" 
              className="bg-white border border-slate-200 p-4 rounded-xl text-center hover:border-brand-500 hover:text-brand-700 transition-all font-bold shadow-sm"
            >
              Barcelona
            </Link>
            <Link 
              to="/subastas-en/valencia" 
              className="bg-white border border-slate-200 p-4 rounded-xl text-center hover:border-brand-500 hover:text-brand-700 transition-all font-bold shadow-sm"
            >
              Valencia
            </Link>
            <Link 
              to="/subastas-en/sevilla" 
              className="bg-white border border-slate-200 p-4 rounded-xl text-center hover:border-brand-500 hover:text-brand-700 transition-all font-bold shadow-sm"
            >
              Sevilla
            </Link>
          </div>
        </div>

        <div className="mt-24">
          <DiscoverReportsBlock />
        </div>
      </main>
    </div>
  );
};

export default RecentAuctions;
