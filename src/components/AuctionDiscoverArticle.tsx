import React, { useEffect, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';
import { ROUTES } from '../routes';
import { Calendar, User, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';
import { generateDiscoverTitle } from '../utils/discoverTitles';
import { isAuctionFinished } from '../utils/auctionHelpers';
import FinishedAuctionBanner from './FinishedAuctionBanner';

const AuctionDiscoverArticle: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const auction = useMemo(() => slug ? AUCTIONS[slug] : null, [slug]);
  const title = useMemo(() => auction && slug ? generateDiscoverTitle(slug, auction) : '', [auction, slug]);

  const discount = useMemo(() => {
    if (!auction || !auction.appraisalValue || !auction.claimedDebt) return null;
    return Math.round((1 - auction.claimedDebt / auction.appraisalValue) * 100);
  }, [auction]);

  const altText = useMemo(() => {
    if (!auction) return 'Subasta inmobiliaria';
    return `Subasta de ${auction.propertyType?.toLowerCase()} en ${auction.zone} ${auction.city}${discount ? ` con descuento del ${discount}% sobre tasación` : ''}`;
  }, [auction, discount]);

  useEffect(() => {
    if (auction && title && slug) {
      document.title = `${title} | Activos Off-Market`;
      
      const metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      metaRobots.setAttribute('content', 'max-image-preview:large');
      document.head.appendChild(metaRobots);

      const schemaData = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": title,
        "description": `Una nueva oportunidad acaba de aparecer en el portal de subastas: un ${auction.propertyType?.toLowerCase() || 'inmueble'} ubicado en ${auction.zone}, ${auction.city}.`,
        "image": [
          `https://picsum.photos/seed/real-estate-building-facade-auction-${slug}/1200/675`
        ],
        "datePublished": new Date().toISOString(),
        "dateModified": new Date().toISOString(),
        "author": [{
            "@type": "Person",
            "name": "José Carlos de la Peña"
        }],
        "publisher": {
          "@type": "Organization",
          "name": "Activos Off Market",
          "logo": {
            "@type": "ImageObject",
            "url": "https://activosoffmarket.es/logo.png"
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://activosoffmarket.es/noticias-subastas/${slug}`
        }
      };

      const scriptSchema = document.createElement('script');
      scriptSchema.setAttribute('type', 'application/ld+json');
      scriptSchema.textContent = JSON.stringify(schemaData);
      document.head.appendChild(scriptSchema);

      return () => {
        document.head.removeChild(metaRobots);
        document.head.removeChild(scriptSchema);
      };
    }
  }, [auction, title, slug]);

  if (!auction) return <Navigate to="/404" />;

  const formattedDate = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  const isFinished = isAuctionFinished(auction.auctionDate);

  return (
    <div className="bg-white min-h-screen">
      <article className="max-w-3xl mx-auto px-6 py-12">
        {isFinished && (
          <div className="mb-8">
            <FinishedAuctionBanner auctionDate={auction.auctionDate} />
          </div>
        )}
        <header className="mb-12">
          <img 
            src={`https://picsum.photos/seed/real-estate-building-facade-auction-${slug}/1200/675`} 
            alt={altText} 
            className="w-full rounded-lg object-cover aspect-video mb-10"
            referrerPolicy="no-referrer"
          />
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-8 leading-tight">
            {title}
          </h1>

          <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-sm text-slate-500 uppercase tracking-wider font-bold mb-1">Análisis realizado por</p>
            <p className="text-lg font-serif font-bold text-slate-900">José Carlos de la Peña</p>
            <p className="text-sm text-slate-600">Jurista especializado en subastas públicas</p>
          </div>

          <div className="prose prose-slate prose-lg max-w-none mb-8">
            <p>
              Esta subasta presenta una oportunidad destacada sobre un {auction.propertyType?.toLowerCase() || 'inmueble'} situado en una ubicación estratégica de {auction.zone}, {auction.city}. 
              {discount && (
                <> Lo que hace especialmente interesante este activo es la notable diferencia entre su valor de tasación y la deuda reclamada, lo que se traduce en un descuento potencial del {discount}% sobre el valor de mercado.</>
              )}
            </p>
            <p>
              Para los inversores inmobiliarios, este tipo de activos representan una vía de entrada al mercado con márgenes de beneficio superiores a la media, siempre que se realice un análisis exhaustivo de las cargas registrales y la situación posesoria. 
              La ubicación en {auction.zone} es un factor determinante, ya que suele tener una alta demanda, lo que facilita tanto la reventa como el alquiler posterior a la adjudicación.
            </p>
            <p>
              No obstante, es crucial abordar este proceso con cautela, evaluando cada detalle del expediente para mitigar riesgos y asegurar una rentabilidad real.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 my-8">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Análisis de la subasta</h2>
            <p className="text-slate-600 mb-4">Consulta el análisis técnico detallado, los riesgos y la rentabilidad estimada para esta subasta.</p>
            <Link to={`/ejemplo-subasta/${slug}`} className="inline-flex items-center gap-2 text-brand-600 font-bold hover:text-brand-700 transition-colors">
              Ver análisis completo <ArrowRight size={16} />
            </Link>
          </div>

          <div className="text-sm text-gray-500 mb-6 flex flex-col gap-1">
            <p>Publicado el {formattedDate}</p>
            <p>Análisis realizado por José Carlos de la Peña</p>
          </div>
        </header>

        <div className="prose prose-slate prose-lg max-w-none space-y-6">
          <p className="lead">Una nueva oportunidad acaba de aparecer en el portal de subastas: un {auction.propertyType?.toLowerCase()} ubicado en {auction.zone}, {auction.city}.</p>
          
          <h2 className="mt-10 mb-4">Tipo de subasta y procedimiento</h2>
          <p>Este activo se encuentra bajo un procedimiento de {auction.procedureType || 'subasta pública'}. Es fundamental entender las implicaciones legales de este tipo de ejecución antes de participar.</p>
          
          <h2 className="mt-10 mb-4">Contexto del mercado en {auction.city}</h2>
          <p>La zona de {auction.zone} en {auction.city} es un área de gran interés inmobiliario. Analizar el valor de mercado es clave para determinar si la puja es rentable.</p>
          
          <h2 className="mt-10 mb-4">Detalles del expediente</h2>
          <p>{auction.description || 'El expediente presenta características particulares que requieren un análisis detallado de la nota simple y las cargas asociadas.'}</p>
          
          <h2 className="mt-10 mb-4">¿Es una oportunidad o un riesgo?</h2>
          <p>Toda subasta conlleva riesgos, especialmente en lo relativo a la situación posesoria ({auction.occupancy || 'desconocida'}) y las cargas previas. La clave del éxito reside en una correcta tasación y análisis de riesgos.</p>
          
          <h2 className="mt-10 mb-4">Qué deben analizar los inversores antes de participar en una subasta</h2>
          <ul>
            <li>valor real de mercado del inmueble</li>
            <li>posibles cargas registrales</li>
            <li>estado de ocupación</li>
            <li>margen de seguridad en la puja</li>
          </ul>

          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 text-center mt-12 mb-10">
            <p className="text-lg mb-6">Antes de participar en una subasta es recomendable calcular la puja máxima para evitar pagar de más.</p>
            <Link to={`/calcular-puja-subasta/${slug}`} className="inline-block bg-brand-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-brand-700 transition-all">
              Calcular puja máxima
            </Link>
          </div>

          <div className="bg-brand-50 p-8 rounded-2xl border border-brand-100 mt-12 mb-10">
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4 mt-0">
              Más oportunidades de subastas en {auction.city}
            </h2>
            <p className="text-slate-700 mb-6">
              Si estás analizando subastas en esta zona, puedes ver otras oportunidades detectadas recientemente en {auction.city} con mayor diferencia entre tasación y deuda.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to={`/mejores-subastas/${auction.city?.toLowerCase()}`} 
                className="inline-flex items-center justify-center bg-brand-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-brand-700 transition-colors"
              >
                Ver las mejores subastas en {auction.city}
              </Link>
              <Link 
                to={`/noticias-subastas/${auction.city?.toLowerCase()}`} 
                className="inline-flex items-center justify-center bg-slate-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-brand-600 transition-colors"
              >
                Más subastas detectadas recientemente en {auction.city}
              </Link>
            </div>
          </div>

          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 mt-12 mb-10">
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4 mt-0">
              Más subastas en {auction.zone}
            </h2>
            <p className="text-slate-700 mb-6">
              Si estás analizando esta oportunidad, puedes ver otras subastas detectadas en {auction.zone}.
            </p>
            <Link 
              to={`/subastas/${auction.city?.toLowerCase()}/${auction.zone?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '')}`} 
              className="inline-flex items-center justify-center bg-slate-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-brand-600 transition-colors"
            >
              Ver subastas en {auction.zone}
            </Link>
          </div>
        </div>

        <footer className="mt-16 border-t border-slate-200 pt-12">
          <h3 className="text-2xl font-bold mb-6">¿Quieres analizar esta subasta?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to={`/ejemplo-subasta/${slug}`} className="bg-slate-900 text-white font-bold py-3 px-6 rounded-xl text-center hover:bg-brand-600">Ver análisis</Link>
            <Link to={ROUTES.CALCULATOR} className="bg-brand-600 text-white font-bold py-3 px-6 rounded-xl text-center hover:bg-brand-700">Calculadora</Link>
            <Link to={`/subastas-en-${auction.city?.toLowerCase()}`} className="bg-slate-100 text-slate-900 font-bold py-3 px-6 rounded-xl text-center hover:bg-slate-200">Ver más en {auction.city}</Link>
          </div>
          <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-200">
            <p className="font-bold text-slate-900">¿Necesitas ayuda con esta subasta?</p>
            <p className="text-slate-600">Nuestro equipo de expertos puede ayudarte a analizar las cargas y riesgos de esta subasta pública.</p>
          </div>
        </footer>
      </article>
    </div>
  );
};

export default AuctionDiscoverArticle;
