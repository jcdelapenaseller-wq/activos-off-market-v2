import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';
import { getFilteredAuctions } from '../utils/auctionHelpers';
import { ChevronRight, MapPin, DollarSign, TrendingUp, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../constants/routes';
import { CITY_MAP, PROPERTY_TYPE_MAP } from '../constants';
import { AuctionCard } from './AuctionCard';
import { AuctionFilters } from './AuctionFilters';
import { AuctionData } from '../data/auctions';
import { isAuctionFinished, sortAuctions, isAuctionActive } from '../utils/auctionHelpers';
import { normalizePropertyType as normalizeTypeLabel, normalizeProvince, normalizeCity, normalizeLocationLabel } from '../utils/auctionNormalizer';
import { trackConversion } from '../utils/tracking';

const ZonePropertyAuctions: React.FC = () => {
  const { province: provinceParam, propertyType: propertyTypeParam, zone: zoneParam } = useParams<{ province: string; propertyType: string; zone: string }>();

  const province = useMemo(() => provinceParam ? provinceParam.charAt(0).toUpperCase() + provinceParam.slice(1) : '', [provinceParam]);
  const propertyType = useMemo(() => propertyTypeParam ? PROPERTY_TYPE_MAP[propertyTypeParam.toLowerCase()] || propertyTypeParam.charAt(0).toUpperCase() + propertyTypeParam.slice(1) : '', [propertyTypeParam]);
  const zone = useMemo(() => zoneParam ? zoneParam.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : '', [zoneParam]);

  const normalize = (str: string) => str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

  const initialFiltered = useMemo(() => {
    const normalizedProvince = normalize(province);
    const filtered = Object.entries(AUCTIONS).filter(([_, data]) => {
      if (!isAuctionActive(data)) return false;
      const p = normalizeProvince(data.province || data.city);
      const provinceMatch = normalize(p) === normalizedProvince || normalize(p).includes(normalizedProvince) || normalizedProvince.includes(normalize(p));
      const typeMatch = data.propertyType?.toLowerCase() === propertyType.toLowerCase();
      const zoneMatch = data.zone?.toLowerCase() === zone.toLowerCase();
      return provinceMatch && typeMatch && zoneMatch;
    });
    return Object.fromEntries(filtered);
  }, [province, propertyType, zone]);

  const [userFiltered, setUserFiltered] = useState<Record<string, AuctionData>>(initialFiltered);

  useEffect(() => {
    setUserFiltered(initialFiltered);
  }, [initialFiltered]);

  const sortedAuctions = useMemo(() => sortAuctions(Object.entries(userFiltered)), [userFiltered]);
  const activeCount = Object.keys(userFiltered).length;

  useEffect(() => {
    if (province && propertyType && zone) {
      document.title = `Subastas de ${propertyType} en ${zone}, ${province} | Activos Off-Market`;
    }
    window.scrollTo(0, 0);
  }, [province, propertyType, zone]);

  return (
    <div className="bg-slate-50 min-h-screen pb-20 px-6 pt-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link to={`/subastas/${provinceParam}`} className="inline-flex items-center gap-2 text-brand-600 font-bold hover:text-brand-700 transition-colors">
            <ArrowLeft size={20} /> Ver todas las subastas en {province}
          </Link>
        </div>

        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">
            Subastas de {propertyType} en {zone}, {province}
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mb-8">
            Descubre las oportunidades de inversión en subastas de {propertyType.toLowerCase()} en la zona de {zone}, {province}. 
            Analizamos el mercado local para ayudarte a encontrar las mejores opciones.
          </p>

          <AuctionFilters auctions={initialFiltered} onFilteredChange={setUserFiltered} />

          {activeCount > 0 && (
            <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 text-brand-700 font-bold px-4 py-2 rounded-lg shadow-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
              </span>
              {activeCount} subastas activas ahora mismo
            </div>
          )}
        </div>

        {sortedAuctions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(() => {
              let newBadgeCount = 0;
              return sortedAuctions.map(([slug, data]: [string, any]) => {
                const showNewBadge = data.isNew && newBadgeCount < 6;
                if (showNewBadge) newBadgeCount++;
                return <AuctionCard key={slug} slug={slug} data={data} showNewBadge={showNewBadge} />;
              });
            })()}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No hay subastas disponibles</h2>
            <p className="text-slate-600 mb-8">
              Actualmente no hay ejemplos analizados de {propertyType} en {zone}, {province}.
            </p>
          </div>
        )}

        <div className="mt-16 bg-brand-900 rounded-3xl p-10 text-center text-white">
          <h2 className="text-3xl font-serif font-bold mb-4">¿Buscas oportunidades en {province}?</h2>
          <p className="text-brand-200 mb-2 max-w-2xl mx-auto">
            En nuestro canal de Telegram publicamos regularmente análisis de subastas activas en {province} y otras provincias de España.
          </p>
          <p className="text-brand-300 text-sm mb-8 italic">
            Incluye: análisis, riesgos reales y estrategia de puja. Acceso limitado para mantener calidad.
          </p>
          <div className="flex flex-col items-center gap-4">
            <a 
              href="https://t.me/activosOffmarket" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => trackConversion(province, 'listing', 'premium')}
              className="inline-flex items-center gap-2 bg-white text-brand-900 font-bold py-4 px-8 rounded-xl hover:bg-brand-50 transition-all"
            >
              Unirme al canal de Telegram <ChevronRight size={20} />
            </a>
            <p className="text-brand-200 text-xs font-medium">
              🔒 Nuevas oportunidades cada día que no se publican en el canal gratuito
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Link to={`/subastas/${provinceParam}/${propertyTypeParam}`} className="text-brand-700 font-bold hover:underline">Ver todas las subastas de {propertyType} en {province}</Link>
          <Link to={`/subastas/${provinceParam}`} className="text-brand-700 font-bold hover:underline">Ver todas las subastas en {province}</Link>
          <Link to={ROUTES.CALCULATOR} className="text-brand-700 font-bold hover:underline">Calculadora de subastas</Link>
        </div>
      </div>
    </div>
  );
};

export default ZonePropertyAuctions;
