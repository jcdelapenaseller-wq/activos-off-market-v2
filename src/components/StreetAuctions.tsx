import React, { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';
import { getFilteredAuctions } from '../utils/auctionHelpers';
import { ChevronRight, MapPin, Home, DollarSign, TrendingUp } from 'lucide-react';
import { ROUTES } from '../constants/routes';
import { AuctionCard } from './AuctionCard';
import { isAuctionFinished, sortAuctions, isAuctionActive } from '../utils/auctionHelpers';
import { normalizePropertyType, normalizeProvince, normalizeCity, normalizeLocationLabel } from '../utils/auctionNormalizer';

const StreetAuctions: React.FC = () => {
  const { city: province, zone, street } = useParams<{ city: string, zone: string, street: string }>();

  const normalize = (str: string) => str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

  const filteredAuctions = useMemo(() => {
    if (!province || !zone || !street) return [];
    
    const normalizedProvince = normalize(province);
    const normalizedZone = normalize(zone);
    const normalizedStreet = normalize(street);

    const filtered = Object.entries(AUCTIONS).filter(([_, data]) => {
      if (!isAuctionActive(data)) return false;
      const p = normalizeProvince(data.province || data.city);
      const provinceMatch = normalize(p) === normalizedProvince || normalize(p).includes(normalizedProvince) || normalizedProvince.includes(normalize(p));
      const dataZoneSlug = normalize(data.zone || '');
      const dataStreetSlug = normalize(data.address || '');
      
      return provinceMatch && 
             dataZoneSlug === normalizedZone && 
             dataStreetSlug === normalizedStreet;
    });
    
    return sortAuctions(filtered);
  }, [province, zone, street]);

  const activeCount = useMemo(() => {
    return filteredAuctions.length;
  }, [filteredAuctions]);

  const { displayProvince, displayZone, displayStreet } = useMemo(() => {
    if (filteredAuctions.length > 0) {
      const data = filteredAuctions[0][1];
      return {
        displayProvince: data.province || data.city || '',
        displayZone: data.zone || '',
        displayStreet: data.address || ''
      };
    }
    
    const format = (s: string) => s.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return {
      displayProvince: province ? province.charAt(0).toUpperCase() + province.slice(1) : '',
      displayZone: zone ? format(zone) : '',
      displayStreet: street ? format(street) : ''
    };
  }, [filteredAuctions, province, zone, street]);

  const availableStreets = useMemo(() => {
    if (!province || !zone) return [];
    const normalizedProvince = normalize(province);
    const normalizedZone = normalize(zone);
    const normalizedCurrentStreet = normalize(street || '');
    
    const zoneAuctions = Object.values(AUCTIONS).filter(a => {
      const p = normalizeProvince(a.province || a.city);
      return (normalize(p) === normalizedProvince || normalize(p).includes(normalizedProvince) || normalizedProvince.includes(normalize(p))) && 
      normalize(a.zone || '') === normalizedZone;
    });
    
    const streets = new Set<string>();
    zoneAuctions.forEach(a => {
      if (a.address && normalize(a.address) !== normalizedCurrentStreet) {
        streets.add(a.address);
      }
    });
    return Array.from(streets).sort().slice(0, 7);
  }, [province, zone, street]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (displayStreet) {
      document.title = `Subastas inmobiliarias en ${displayStreet}, ${displayZone} (${displayProvince}) | Activos Off-Market`;
    }
  }, [displayProvince, displayZone, displayStreet]);

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="bg-white border-b border-slate-200 pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex items-center text-sm text-slate-500 mb-8 font-medium flex-wrap gap-2">
            <Link 
              to={ROUTES.HOME} className="hover:text-brand-600 transition-colors"
            >
              Inicio
            </Link>
            <ChevronRight size={14} />
            <Link 
              to={ROUTES.GUIDE_PILLAR} className="hover:text-brand-600 transition-colors"
            >
              Guía Subastas
            </Link>
            <ChevronRight size={14} />
            <Link 
              to={`/subastas/${province}`} className="hover:text-brand-600 transition-colors"
            >
              Subastas en {displayProvince}
            </Link>
            <ChevronRight size={14} />
            <Link 
              to={`/subastas/${province}/${zone}`} className="hover:text-brand-600 transition-colors"
            >
              {displayZone}
            </Link>
            <ChevronRight size={14} />
            <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md">{displayStreet}</span>
          </nav>

          <h1 className="font-serif text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
            Subastas inmobiliarias en {displayStreet}, {displayZone} ({displayProvince})
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
              Explora las oportunidades de inversión mediante subastas judiciales y administrativas localizadas específicamente en la calle <strong>{displayStreet}</strong>, dentro del barrio de <strong>{displayZone}</strong> en <strong>{displayProvince}</strong>. Esta zona destaca por su dinamismo inmobiliario y su excelente ubicación, lo que convierte a cualquier activo en subasta en una opción potencialmente muy rentable. Analizar el mercado hiperlocal es clave para determinar el valor real de los inmuebles y establecer una estrategia de puja ganadora. En esta página encontrarás el listado actualizado de activos disponibles, incluyendo su valor de tasación oficial y la deuda reclamada, permitiéndote calcular el descuento potencial de cada operación antes de participar en el proceso de licitación pública.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {filteredAuctions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(() => {
              let newBadgeCount = 0;
              return filteredAuctions.map(([slug, data]: [string, any]) => {
                const showNewBadge = data.isNew && newBadgeCount < 6;
                if (showNewBadge) newBadgeCount++;
                return <AuctionCard key={slug} slug={slug} data={data} showNewBadge={showNewBadge} />;
              });
            })()}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Home size={40} className="text-slate-300" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">No hay subastas activas en esta calle</h2>
            <p className="text-slate-600 mb-8">
              Actualmente no hemos detectado subastas judiciales o administrativas en la calle {displayStreet}. 
              Te recomendamos explorar otras zonas de {displayProvince} o utilizar nuestra calculadora para estar preparado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to={`/subastas/${province}`} className="bg-brand-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-brand-700 transition-colors"
              >
                Ver subastas en {displayProvince}
              </Link>
              <Link 
                to={ROUTES.CALCULATOR} className="bg-slate-100 text-slate-900 font-bold py-3 px-8 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Calculadora de subastas
              </Link>
            </div>
          </div>
        )}

        <div className="mt-20 prose prose-slate max-w-4xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6">
            Mercado inmobiliario en {displayStreet}, {displayZone}
          </h2>
          <div className="text-slate-600 leading-relaxed space-y-4">
            <p>
              El mercado inmobiliario en la calle <strong>{displayStreet}</strong> y sus alrededores dentro del barrio de <strong>{displayZone}</strong> se caracteriza por una demanda sostenida y una oferta limitada, lo que mantiene los precios estables y atractivos para la inversión. Esta zona de <strong>{displayProvince}</strong> es especialmente valorada por su consolidación urbana, acceso a servicios y conectividad, factores que minimizan el riesgo de desocupación y maximizan el potencial de rentabilidad por alquiler.
            </p>
            <p>
              Para los inversores en subastas, esta ubicación representa una oportunidad estratégica. Los activos que salen a licitación pública en esta calle suelen atraer un interés considerable debido a su liquidez. Participar en una subasta aquí requiere un análisis exhaustivo del valor de mercado hiperlocal, ya que incluso pequeñas variaciones en la ubicación dentro del barrio pueden influir significativamente en la tasación final. El contexto de subastas en esta zona suele estar marcado por procedimientos de ejecución hipotecaria o administrativos, donde el conocimiento previo de la calle permite ajustar la puja máxima con mayor seguridad.
            </p>
          </div>

          <h2 className="text-3xl font-serif font-bold text-slate-900 mt-12 mb-6">
            Qué analizar antes de pujar en una subasta en {displayZone}
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Antes de participar en cualquier proceso en <strong>{displayZone}</strong>, es fundamental realizar una auditoría completa del activo. Esto incluye la verificación de cargas registrales en el Registro de la Propiedad, el estudio de la situación posesoria (si el inmueble está ocupado o vacío) y la consulta de posibles deudas de comunidad o IBI que el adjudicatario deba asumir. Un análisis técnico riguroso de la zona le permitirá identificar si el valor de tasación del BOE está alineado con la realidad del mercado actual.
          </p>
        </div>

        {availableStreets.length > 0 && (
          <div className="mt-20 max-w-4xl mx-auto">
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6">
              Otras subastas detectadas en calles de {displayZone}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableStreets.map(streetName => (
                <Link 
                  key={streetName}
                  to={`/subastas/${normalize(province || '')}/${normalize(zone || '')}/${normalize(streetName)}`} className="bg-white border border-slate-200 rounded-xl p-3 text-sm text-brand-600 hover:text-brand-800 hover:border-brand-200 hover:shadow-sm transition-all flex items-center gap-2 font-medium"
                >
                  <ChevronRight size={14} className="flex-shrink-0" />
                  <span className="truncate">Subastas en {streetName}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-20 bg-brand-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">¿Has encontrado una oportunidad en {displayStreet}?</h2>
            <p className="text-brand-100 text-lg mb-8 leading-relaxed">
              Antes de participar en la subasta, es vital que calcules con precisión tu puja máxima para asegurar la rentabilidad de la operación y evitar riesgos innecesarios.
            </p>
            <Link 
              to={ROUTES.CALCULATOR} className="inline-flex items-center justify-center bg-white text-brand-900 font-bold py-4 px-10 rounded-2xl hover:bg-brand-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Calcular puja máxima ahora
              <TrendingUp size={20} className="ml-2" />
            </Link>
          </div>
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none hidden lg:block">
            <TrendingUp size={400} className="translate-x-20 -translate-y-20" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreetAuctions;
