import React, { useEffect, useMemo } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ACTIVE_AUCTIONS as AUCTIONS } from '../data/filteredAuctions';
import { Calendar, ChevronRight, TrendingUp, MapPin, ArrowRight } from 'lucide-react';
import { ROUTES } from '../constants/routes';
import { isAuctionFinished, sortActiveFirst } from '../utils/auctionHelpers';
import { normalizeProvince, normalizePropertyType, normalizeLocationLabel } from '../utils/auctionNormalizer';
import { trackConversion } from '../utils/tracking';
import { AuctionCard } from './AuctionCard';
import PremiumValueBlock from './PremiumValueBlock';
import Header from './Header';
import Footer from './Footer';

interface Props {
  variant?: 'urgency' | 'opportunity' | 'analysis';
}

const DiscoverProvinceArticle: React.FC<Props> = ({ variant = 'opportunity' }) => {
  const { province } = useParams<{ province: string }>();
  
  const normalizedProvinceParam = province?.toLowerCase() || '';
  const provinceName = useMemo(() => {
    if (!province) return '';
    return province.charAt(0).toUpperCase() + province.slice(1).toLowerCase();
  }, [province]);

  const provinceAuctions = useMemo(() => {
    if (!province) return [];
    const filtered = Object.entries(AUCTIONS).filter(([_, a]) => {
      const p = normalizeProvince(a.province || a.city).toLowerCase();
      return p === normalizedProvinceParam || p.includes(normalizedProvinceParam) || normalizedProvinceParam.includes(p);
    });
    return sortActiveFirst(filtered, (item) => item[1].auctionDate);
  }, [province, normalizedProvinceParam]);

  const activeAuctions = useMemo(() => {
    return provinceAuctions.filter(([_, data]) => !isAuctionFinished(data.auctionDate));
  }, [provinceAuctions]);

  const stats = useMemo(() => {
    if (activeAuctions.length === 0) return null;
    
    let maxDiscount = 0;
    
    activeAuctions.forEach(([_, a]) => {
      if (a.appraisalValue && a.claimedDebt !== undefined && a.claimedDebt !== null && a.appraisalValue > a.claimedDebt) {
        const discount = Math.round((1 - a.claimedDebt / a.appraisalValue) * 100);
        if (a.claimedDebt !== 0 && discount <= 85 && discount > maxDiscount) {
          maxDiscount = discount;
        }
      }
    });
    
    return {
      totalActive: activeAuctions.length,
      maxDiscount
    };
  }, [activeAuctions]);

  const topExamples = useMemo(() => {
    return activeAuctions
      .map(([slug, data]) => {
        const valorReferencia = data.valorTasacion || data.valorSubasta || data.appraisalValue;
        const cantidadReclamada = data.claimedDebt;
        const ratio = (valorReferencia && cantidadReclamada !== undefined && cantidadReclamada !== null) 
          ? Math.round(((valorReferencia - cantidadReclamada) / valorReferencia) * 100)
          : 0;
        return { slug, data, ratio };
      })
      .filter(item => item.ratio > 0)
      .sort((a, b) => b.ratio - a.ratio)
      .slice(0, 3);
  }, [activeAuctions]);

  const content = useMemo(() => {
    const total = stats?.totalActive || 0;
    const maxDesc = stats?.maxDiscount || 0;
    
    if (variant === 'urgency') {
      return {
        title: total > 0 ? `Subastas en ${provinceName} hoy: ${total} expedientes a punto de cerrar` : `Subastas en ${provinceName} hoy: Análisis de mercado`,
        meta: `El tiempo es clave. Revisa las ${total} subastas activas hoy en ${provinceName} antes de que finalice el plazo.`,
        intro: `El tiempo es clave en las subastas judiciales y administrativas. Hoy, nuestro sistema monitoriza **${total} expedientes activos** en la provincia de **${provinceName}**. Revisa estas oportunidades antes de que finalice el plazo de pujas y desaparezcan del BOE.`,
        cta: `Ver subastas activas hoy en ${provinceName}`,
        image: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1200&q=80'
      };
    }
    if (variant === 'analysis') {
      return {
        title: total > 0 ? `Dónde invertir en subastas en ${provinceName}: Análisis de mercado` : `Análisis de subastas en ${provinceName}`,
        meta: `¿Buscando rentabilidad en ${provinceName}? Analizamos el estado actual de las subastas públicas con ${total} activos disponibles.`,
        intro: `¿Buscando alta rentabilidad en **${provinceName}**? Analizamos el estado actual de las subastas públicas en la región. Con **${total} activos disponibles** y descuentos detectados de hasta el **${maxDesc}%**, el mercado ofrece opciones estratégicas tanto para inversores patrimoniales (alquiler) como para operaciones de flipping.`,
        cta: `Explorar el mercado de subastas en ${provinceName}`,
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'
      };
    }
    // default: opportunity
    return {
      title: total > 0 ? `Nuevas oportunidades en ${provinceName}: hasta ${maxDesc}% de descuento` : `Oportunidades de subastas en ${provinceName}`,
      meta: `Nuevas oportunidades de inversión inmobiliaria en ${provinceName}. ${total} activos disponibles con descuentos de hasta el ${maxDesc}%.`,
      intro: `El mercado de subastas en **${provinceName}** acaba de actualizarse. Nuestro algoritmo ha detectado **${total} oportunidades activas** hoy, alcanzando descuentos de **hasta un ${maxDesc}%** frente a su valor de mercado real.`,
      cta: `Ver las ${total} oportunidades en ${provinceName}`,
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    };
  }, [variant, provinceName, stats]);

  useEffect(() => {
    if (provinceName) {
      document.title = `${content.title} | Activos Off-Market`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', content.meta);
      }
    }
    window.scrollTo(0, 0);
  }, [provinceName, content]);

  if (!province) return <Navigate to={ROUTES.HOME} replace />;

  const today = new Date();
  const formattedDate = today.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-600 flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-3xl mx-auto px-6 py-12 w-full">
        <nav className="flex items-center text-sm text-slate-500 mb-8 font-medium" aria-label="Breadcrumb">
          <Link to={ROUTES.HOME} className="hover:text-brand-600 transition-colors">Inicio</Link>
          <ChevronRight size={14} className="mx-2" />
          <Link to={ROUTES.NOTICIAS_SUBASTAS_INDEX} className="hover:text-brand-600 transition-colors">Noticias</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md capitalize">{provinceName}</span>
        </nav>

        <article className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200">
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
              <div className="flex items-center gap-1.5 text-brand-700 bg-brand-50 px-3 py-1 rounded-full font-bold">
                <Calendar size={14} />
                <time dateTime={today.toISOString()}>Actualizado: {formattedDate}</time>
              </div>
              {stats && stats.totalActive > 0 && (
                <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-bold border border-emerald-100">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  {stats.totalActive} subastas activas
                </div>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-slate-900 mb-6 leading-tight">
              {content.title}
            </h1>

            {/* Imagen principal grande para Discover */}
            <figure className="mb-8 rounded-2xl overflow-hidden shadow-sm border border-slate-100">
              <img 
                src={content.image} 
                alt={`Subastas inmobiliarias en ${provinceName}`}
                className="w-full h-[400px] object-cover"
                referrerPolicy="no-referrer"
              />
            </figure>
            
            <div className="flex items-center gap-4">
              <img 
                src="https://activosoffmarket.es/logo.png" 
                alt="Activos Off-Market" 
                className="w-10 h-10 rounded-full bg-slate-100 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Activos+OffMarket&background=0f172a&color=fff';
                }}
              />
              <div>
                <p className="font-bold text-slate-900 text-sm">Equipo de Análisis</p>
                <p className="text-xs text-slate-500">Activos Off-Market</p>
              </div>
            </div>
          </header>

          <div className="prose prose-lg prose-slate max-w-none">
            <p className="lead text-xl text-slate-700 font-medium mb-6" dangerouslySetInnerHTML={{ __html: content.intro }} />

            {stats && stats.totalActive > 0 ? (
              <>
                <div className="my-8 text-center">
                  <Link 
                    to={`/subastas/${normalizedProvinceParam}`}
                    onClick={() => trackConversion(provinceName, 'discover', 'listado')}
                    className="inline-flex items-center justify-center gap-2 bg-brand-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-brand-700 transition-colors shadow-md hover:shadow-lg hover:-translate-y-0.5 w-full sm:w-auto text-lg"
                  >
                    🔎 Ver todas las subastas en {provinceName}
                  </Link>
                </div>

                {topExamples.length > 0 && (
                  <div className="my-12">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                      <TrendingUp className="text-brand-600" size={24} /> 
                      Mejores oportunidades hoy
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 not-prose mb-8">
                      {topExamples.slice(0, 2).map(({ slug, data }) => (
                        <AuctionCard key={slug} slug={slug} data={data} />
                      ))}
                    </div>
                    <div className="bg-brand-50 rounded-2xl p-6 border border-brand-100 text-center not-prose">
                      <p className="text-lg font-bold text-brand-900 mb-4">👉 Estas son solo algunas. Hay más activas ahora</p>
                      <Link 
                        to={`/subastas/${normalizedProvinceParam}`}
                        onClick={() => trackConversion(provinceName, 'discover', 'listado')}
                        className="inline-flex items-center justify-center gap-2 bg-white text-brand-700 font-bold px-6 py-3 rounded-xl hover:bg-brand-100 transition-colors shadow-sm border border-brand-200"
                      >
                        Ver listado completo <ArrowRight size={18} />
                      </Link>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="mb-8">
                Actualmente estamos monitorizando el BOE y los juzgados de {provinceName}, pero no hay subastas activas que cumplan nuestros criterios de rentabilidad. El mercado se actualiza a diario, por lo que te recomendamos revisar el listado completo regularmente.
              </p>
            )}

            <div className="mt-12">
              <PremiumValueBlock />
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default DiscoverProvinceArticle;
