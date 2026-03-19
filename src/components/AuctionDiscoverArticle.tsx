import React, { useEffect, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';
import { getFilteredAuctions } from '../utils/auctionHelpers';
import { ROUTES } from '../constants/routes';
import { Calendar, User, MapPin, CircleDollarSign, Landmark, TrendingDown, Clock, MessageSquare, ExternalLink, ShieldCheck, Info, ArrowLeft, ArrowRight } from 'lucide-react';
import { generateDiscoverTitle } from '../utils/discoverTitles';
import { isAuctionFinished } from '../utils/auctionHelpers';
import { normalizeCity, normalizeProvince } from '../utils/auctionNormalizer';
import { trackConversion } from '../utils/tracking';
import { generateEditorialContent } from '../utils/editorialGenerator';
import FinishedAuctionBanner from './FinishedAuctionBanner';

const AuctionDiscoverArticle: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const auction = useMemo(() => slug ? AUCTIONS[slug] : null, [slug]);
  const title = useMemo(() => auction && slug ? generateDiscoverTitle(slug, auction) : '', [auction, slug]);

  const discount = useMemo(() => {
    if (!auction || !auction.appraisalValue || !auction.claimedDebt) return null;
    return Math.round((1 - auction.claimedDebt / auction.appraisalValue) * 100);
  }, [auction]);

  const imageUrl = useMemo(() => {
    const type = auction?.propertyType?.toLowerCase() || '';
    if (type.includes('local')) return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop';
    if (type.includes('garaje')) return 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=1200&auto=format&fit=crop';
    if (type.includes('nave')) return 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop';
    return 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1200&auto=format&fit=crop';
  }, [auction]);

  const cityName = useMemo(() => auction ? (normalizeCity(auction) || 'España') : 'España', [auction]);

  const formattedCurrency = (value: number | undefined) => {
    if (value === undefined) return 'Consultar';
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  };

  useEffect(() => {
    if (auction && title && slug) {
      document.title = `${title} | Activos Off-Market`;
      
      const metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      metaRobots.setAttribute('content', 'max-image-preview:large');
      document.head.appendChild(metaRobots);

      const scriptSchema = document.createElement('script');
      scriptSchema.setAttribute('type', 'application/ld+json');
      scriptSchema.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": title,
        "description": `Análisis de la subasta de un ${auction.propertyType?.toLowerCase() || 'inmueble'} en ${auction.zone}, ${cityName}. Datos clave, riesgos y cómo participar.`,
        "image": [imageUrl],
        "datePublished": auction.publishedAt || new Date().toISOString(),
        "author": [{
            "@type": "Person",
            "name": "José Carlos de la Peña"
        }]
      });
      document.head.appendChild(scriptSchema);

      return () => {
        document.head.removeChild(metaRobots);
        document.head.removeChild(scriptSchema);
      };
    }
  }, [auction, title, slug]);

  if (!auction) return <Navigate to="/404" />;

  const publishDate = auction.publishedAt 
    ? new Date(auction.publishedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  
  const isFinished = isAuctionFinished(auction.auctionDate);

  const isPublishedToday = useMemo(() => {
    if (!auction.publishedAt) return false;
    const pubDate = new Date(auction.publishedAt);
    const today = new Date();
    return pubDate.toDateString() === today.toDateString();
  }, [auction.publishedAt]);

  const provinceName = useMemo(() => normalizeProvince(auction.province || cityName || ''), [auction.province, cityName]);

  const editorialParagraphs = useMemo(() => {
    return generateEditorialContent(auction);
  }, [auction]);

  const relatedAuctions = useMemo(() => {
    return Object.entries(AUCTIONS)
      .filter(([key, data]) => data.city === cityName && key !== slug)
      .reverse()
      .slice(0, 3);
  }, [cityName, slug]);

  return (
    <div className="bg-white min-h-screen">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* A) Encabezado */}
        <header className="mb-8">
          {isPublishedToday && (
            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-bold border border-blue-100 shadow-sm">
              <span>⚡</span> Nueva subasta detectada hoy en {cityName}
            </div>
          )}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-slate-900 mb-6 leading-tight">
            {title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-slate-600 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-brand-600" />
              <span className="text-sm">{publishDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={18} className="text-brand-600" />
              <span className="text-sm font-medium text-slate-900">José Carlos de la Peña</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-brand-600" />
              <span className="text-sm">Tiempo de lectura: 2 min</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Actualizado: {publishDate}</span>
            </div>
          </div>
        </header>

        {isFinished && (
          <div className="mb-8">
            <FinishedAuctionBanner auctionDate={auction.auctionDate} />
          </div>
        )}

        {/* B) Imagen principal */}
        <div className="mb-10">
          <img 
            src={imageUrl} 
            alt={`Subasta de ${auction.propertyType} en ${cityName}`} 
            className="w-full rounded-2xl object-cover aspect-video shadow-lg"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* C) Resumen rápido */}
        <section className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 mb-10 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
            <Info size={20} className="text-brand-400" />
            Datos clave de la subasta
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <MapPin size={20} className="text-brand-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Ubicación</p>
                <p className="font-medium">
                  {auction.zone}, <Link to={`/subastas/${cityName.toLowerCase()}`} className="hover:underline text-brand-400">{cityName}</Link>
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <CircleDollarSign size={20} className="text-brand-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Valor Subasta</p>
                <p className="font-medium">{formattedCurrency(auction.appraisalValue)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Landmark size={20} className="text-brand-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Deuda Reclamada</p>
                <p className="font-medium">{formattedCurrency(auction.claimedDebt)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <TrendingDown size={20} className="text-brand-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Descuento Estimado</p>
                <p className="font-medium text-brand-400">{discount ? `${discount}%` : 'Ver análisis'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Clock size={20} className="text-brand-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Fecha de cierre</p>
                <p className="font-medium">{auction.auctionDate ? new Date(auction.auctionDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }) : 'Consultar BOE'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* D) Explicación breve (Dinámica) */}
        <div className="prose prose-slate prose-lg max-w-none mb-10">
          {editorialParagraphs.map((paragraph, index) => (
            <p key={index} className="mb-6">
              {paragraph}
            </p>
          ))}
          {auction.description && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-600 italic mt-6">
              <strong>Nota del edicto:</strong> {auction.description.length > 300 ? `${auction.description.substring(0, 300)}...` : auction.description}
            </div>
          )}
        </div>

        <section className="mb-10">
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">Qué está pasando con las subastas en {cityName}</h2>
          <p className="text-slate-700 mb-4">
            Estamos detectando un aumento significativo en la actividad de subastas en <Link to={`/subastas/${cityName.toLowerCase()}`} className="hover:underline text-brand-600">{cityName}</Link>, especialmente en zonas como {auction.zone}. Esto abre oportunidades interesantes para inversores que buscan activos con descuento.
          </p>
          <div className="flex gap-4">
            <Link to={`/subastas/${cityName.toLowerCase()}`} className="text-brand-600 font-bold hover:underline">📊 Análisis completo del mercado en {cityName} →</Link>
            <Link to={`/subastas/${cityName.toLowerCase()}/${auction.zone?.toLowerCase().replace(/\s+/g, '-')}`} className="text-brand-600 font-bold hover:underline">📊 Análisis del mercado en {auction.zone} →</Link>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">Lo que llama la atención de esta subasta</h2>
          <p className="text-slate-700 mb-4">
            El descuento del {discount}% sobre el valor de tasación es el primer factor que destaca. La ubicación en {auction.zone} sitúa este activo en un punto estratégico de <Link to={`/subastas/${cityName.toLowerCase()}`} className="hover:underline text-brand-600">{cityName}</Link>, un mercado donde la oferta de {auction.propertyType?.toLowerCase()} a precios competitivos es escasa.
          </p>
        </section>

        {/* E) Bloque de análisis experto */}
        <div className="bg-brand-50 border-l-4 border-brand-500 p-6 mb-10 rounded-r-2xl">
          <h3 className="text-brand-900 font-bold flex items-center gap-2 mb-2">
            <ShieldCheck size={20} />
            Análisis rápido
          </h3>
          <p className="text-slate-700 italic">
            {auction.description 
              ? `"${auction.description.split('.')[0]}."`
              : `"Este tipo de activos en ${cityName} suele generar bastante interés cuando empiezan las pujas. La clave del éxito aquí será validar si las cargas anteriores están realmente canceladas económicamente."`
            }
          </p>
          <div className="mt-4">
            <Link 
              to={`/subastas/${cityName.toLowerCase()}/${auction.zone?.toLowerCase().replace(/\s+/g, '-')}`} 
              className="text-brand-700 font-bold hover:text-brand-900 flex items-center gap-1"
            >
              📊 Análisis del mercado en {auction.zone} →
            </Link>
            <Link 
              to={`/subastas/${cityName.toLowerCase()}`} 
              className="text-brand-700 font-bold hover:text-brand-900 flex items-center gap-1 mt-2"
            >
              📊 Análisis general del mercado en {cityName} →
            </Link>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">Qué miran primero los inversores</h2>
          <ul className="list-disc list-inside text-slate-700 space-y-2">
            <li><strong>Situación posesoria:</strong> ¿Está ocupado? Es el riesgo número uno.</li>
            <li><strong>Cargas registrales:</strong> ¿Qué hipotecas o embargos anteriores existen?</li>
            <li><strong>Estado del inmueble:</strong> ¿Requiere reforma integral o es para entrar a vivir?</li>
            <li><strong>Valor real en la zona:</strong> ¿El precio de mercado justifica el riesgo?</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">Por qué esta subasta puede interesar</h2>
          <p className="text-slate-700 mb-4">
            La ratio entre la deuda reclamada ({formattedCurrency(auction.claimedDebt)}) y el valor de tasación ({formattedCurrency(auction.appraisalValue)}) sugiere un margen de maniobra interesante. La demanda de {auction.propertyType?.toLowerCase()} en {cityName} es constante, lo que garantiza una alta liquidez si el precio de adjudicación es el adecuado.
          </p>
        </section>

        {/* F) CTA hacia Telegram */}
        <section className="bg-sky-50 border border-sky-100 rounded-2xl p-8 mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-500 text-white rounded-full mb-4 shadow-lg shadow-sky-200">
            <MessageSquare size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Únete a la comunidad de subastas</h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            En el canal Telegram analizo cada subasta y aviso cuando aparecen oportunidades interesantes antes de que se vuelvan virales.
          </p>
          <a 
            href="https://t.me/activosOffmarket" 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={() => trackConversion(provinceName, 'discover', 'premium')}
            className="inline-flex items-center gap-2 bg-sky-500 text-white font-bold py-4 px-8 rounded-xl hover:bg-sky-600 transition-all shadow-lg shadow-sky-200"
          >
            👉 Seguir el canal Telegram
          </a>
        </section>

        {/* I) Sección “Cómo participar” */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6">Cómo participar en esta subasta</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-4 p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
              <div className="flex-shrink-0 w-8 h-8 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center font-bold">1</div>
              <p className="text-slate-700 text-sm">Debes estar registrado en el Portal de Subastas del BOE con certificado digital o Cl@ve.</p>
            </div>
            <div className="flex gap-4 p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
              <div className="flex-shrink-0 w-8 h-8 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center font-bold">2</div>
              <p className="text-slate-700 text-sm">Es obligatorio realizar un depósito del 5% del valor de tasación para poder pujar.</p>
            </div>
            <div className="flex gap-4 p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
              <div className="flex-shrink-0 w-8 h-8 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center font-bold">3</div>
              <p className="text-slate-700 text-sm">Las pujas suelen durar 20 días naturales desde la apertura del proceso.</p>
            </div>
            <div className="flex gap-4 p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
              <div className="flex-shrink-0 w-8 h-8 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center font-bold">4</div>
              <p className="text-slate-700 text-sm">Si resultas ganador, tendrás un plazo para consignar el resto del precio del remate.</p>
            </div>
          </div>
        </section>

        {/* G) CTA hacia consultoría */}
        <section className="bg-slate-900 text-white rounded-2xl p-8 md:p-10 mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-serif font-bold mb-4">¿Necesitas un análisis profesional?</h3>
            <p className="text-slate-300 mb-8 max-w-2xl">
              Si estás pensando en participar en una subasta como esta, puedo revisar el expediente completo, analizar las cargas registrales y explicarte los riesgos reales antes de que pongas tu dinero.
            </p>
            <a 
              href="https://calendly.com/activosoffmarket" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => trackConversion(provinceName, 'discover', 'consultoria')}
              className="inline-flex items-center gap-2 bg-brand-500 text-white font-bold py-4 px-8 rounded-xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-900/50"
            >
              📅 Reservar análisis de subasta
            </a>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">Antes de pujar conviene revisar</h2>
          <p className="text-slate-700 mb-4">
            No te lances sin hacer los deberes. Antes de realizar cualquier depósito:
          </p>
          <ul className="list-disc list-inside text-slate-700 space-y-2">
            <li><strong>Revisa la nota simple:</strong> Es el documento que revela la verdad sobre las cargas.</li>
            <li><strong>Confirma la ocupación:</strong> Si está ocupado, el proceso de desahucio es largo y costoso.</li>
            <li><strong>Valida las cargas:</strong> Asegúrate de qué cargas se cancelan y cuáles te subrogas.</li>
          </ul>
        </section>

        {/* J) Últimas subastas detectadas en {city} */}
        {relatedAuctions.length > 0 && (
          <section className="mt-16 mb-10">
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-8 border-b border-slate-100 pb-4">
              Últimas subastas detectadas en {cityName}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedAuctions.map(([relatedSlug, data]) => {
                const hasValues = data.appraisalValue && data.claimedDebt !== undefined && data.claimedDebt !== null;
                let relatedDiscount = data.discount !== undefined 
                  ? data.discount 
                  : (hasValues ? Math.round((1 - (data.claimedDebt! / data.appraisalValue!)) * 100) : null);
                  
                if (data.claimedDebt === 0 || (relatedDiscount !== null && relatedDiscount > 85)) {
                  relatedDiscount = null;
                }

                return (
                  <div key={relatedSlug} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all flex flex-col h-full group">
                    <div className="p-6 flex-grow">
                      <div className="flex justify-between items-start mb-4">
                        <span className="bg-brand-50 text-brand-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                          {data.propertyType || 'Inmueble'}
                        </span>
                        {relatedDiscount !== null && relatedDiscount > 0 && (
                          <div className="flex flex-col items-end">
                            <span className="flex items-center gap-1 text-xl font-black text-emerald-600 leading-none">
                              <TrendingDown size={16} className="text-emerald-500" /> {relatedDiscount}%
                            </span>
                          </div>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mb-3 group-hover:text-brand-600 transition-colors line-clamp-2">
                        {data.propertyType || 'Inmueble'} en {data.city || 'España'}
                      </h3>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-slate-600 text-xs">
                          <MapPin size={14} className="text-slate-400" />
                          <span className="truncate">{data.zone || data.city || 'Ubicación no disponible'}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                        <div>
                          <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400 mb-1">Tasación</p>
                          <p className="text-xs font-bold text-slate-900">
                            {data.appraisalValue 
                              ? data.appraisalValue.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}) 
                              : 'N/D'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400 mb-1">Deuda</p>
                          <p className="text-xs font-bold text-slate-900">
                            {data.claimedDebt 
                              ? data.claimedDebt.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}) 
                              : 'N/D'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 pb-6 mt-auto">
                      <Link 
                        to={`/noticias-subastas/${relatedSlug}`}
                        className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white font-bold py-3 px-4 rounded-xl hover:bg-brand-600 transition-all shadow-md text-sm"
                      >
                        Ver subasta <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Footer del artículo con enlaces relacionados */}
        <footer className="mt-16 pt-12 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <Link to={ROUTES.NOTICIAS_SUBASTAS_INDEX} className="text-slate-500 hover:text-brand-600 flex items-center gap-2 transition-colors">
              <ArrowLeft size={16} /> Volver a noticias
            </Link>
            <div className="flex gap-4">
              <Link to={`/subasta/${slug}`} className="text-brand-600 font-bold hover:underline flex items-center gap-1">
                Ver ficha técnica <ExternalLink size={14} />
              </Link>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
};

export default AuctionDiscoverArticle;
