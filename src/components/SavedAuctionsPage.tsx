import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Star, ArrowRight, TrendingUp, MapPin, Clock, Home, AlertTriangle, Bell, BellRing } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { AUCTIONS } from '../data/auctions';
import { ROUTES } from '../constants/routes';
import { normalizePropertyType, normalizeCity, formatAddress } from '../utils/auctionNormalizer';
import { getAuctionType } from '../utils/auctionHelpers';

const SavedAuctionsPage: React.FC = () => {
  const { user, isLogged, isLoading } = useUser();
  const [savedAuctions, setSavedAuctions] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isAlertsActive, setIsAlertsActive] = useState(false);

  useEffect(() => {
    const fetchSavedAuctions = async () => {
      if (!user || !db) {
        setIsFetching(false);
        return;
      }

      try {
        const q = query(
          collection(db, 'favorites'),
          where('userId', '==', user.id),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        
        const auctions = querySnapshot.docs
          .map(doc => {
            const data = doc.data();
            const auctionData = AUCTIONS[data.auctionId];
            if (!auctionData) return null;
            return {
              id: doc.id,
              auctionId: data.auctionId,
              savedAt: data.createdAt?.toDate() || new Date(),
              ...auctionData
            };
          })
          .filter(Boolean);

        setSavedAuctions(auctions);
      } catch (error) {
        console.error("Error fetching saved auctions:", error);
      } finally {
        setIsFetching(false);
      }
    };

    if (!isLoading) {
      fetchSavedAuctions();
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
          <Star size={24} className="fill-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">Mis Guardados</h1>
          <p className="text-slate-500">Subastas que estás siguiendo</p>
        </div>
      </div>

      {/* Alertas Block */}
      <div className={`mb-8 border rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all ${isAlertsActive ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-slate-200'}`}>
        <div className="flex items-start md:items-center gap-4">
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${isAlertsActive ? 'bg-emerald-100 text-emerald-600' : 'bg-brand-50 text-brand-600'}`}>
            {isAlertsActive ? <BellRing size={20} className="md:hidden" /> : <Bell size={20} className="md:hidden" />}
            {isAlertsActive ? <BellRing size={24} className="hidden md:block" /> : <Bell size={24} className="hidden md:block" />}
          </div>
          <div>
            <h2 className={`text-base md:text-lg font-bold mb-0.5 ${isAlertsActive ? 'text-emerald-900' : 'text-slate-900'}`}>
              {isAlertsActive ? 'Alertas activas' : 'Activa alertas sobre oportunidades similares'}
            </h2>
            <p className={`text-sm ${isAlertsActive ? 'text-emerald-700/80' : 'text-slate-500'}`}>
              {isAlertsActive 
                ? 'Te avisaremos cuando detectemos nuevas subastas que encajen con tu perfil.'
                : 'Recibe notificaciones cuando se publiquen subastas similares a tus guardados.'}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsAlertsActive(!isAlertsActive)}
          className={`w-full md:w-auto shrink-0 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
            isAlertsActive 
              ? 'bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm' 
              : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md'
          }`}
        >
          {isAlertsActive ? 'Configurar alertas' : 'Activar alertas'}
        </button>
      </div>

      {isFetching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 h-64 animate-pulse"></div>
          ))}
        </div>
      ) : savedAuctions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6">
            <Star size={32} className="text-slate-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Aún no tienes subastas guardadas</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Explora las subastas activas y guarda las que te interesen para hacerles seguimiento.
          </p>
          <Link 
            to={ROUTES.RECENT_AUCTIONS}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-600 text-white font-bold hover:bg-brand-700 transition-colors"
          >
            Explorar subastas <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedAuctions.map(auction => {
            const propertyType = normalizePropertyType(auction.propertyType);
            const cityName = normalizeCity(auction);
            const discount = auction.appraisalValue && auction.claimedDebt 
              ? Math.round((1 - (auction.claimedDebt / auction.appraisalValue)) * 100) 
              : 0;
            
            const now = new Date();
            const auctionDate = auction.auctionDate ? new Date(auction.auctionDate) : null;
            const diffTime = auctionDate ? auctionDate.getTime() - now.getTime() : null;
            const diffDays = diffTime !== null ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : null;
            
            const isFinished = diffDays !== null && diffDays < 0;
            const isSuspended = auction.status === 'suspended';
            
            return (
              <Link 
                key={auction.id}
                to={`/subasta/${auction.auctionId}`}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group flex flex-col"
              >
                <div className="p-5 flex-grow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
                        <Home size={16} />
                      </div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {propertyType}
                      </span>
                    </div>
                    {isFinished ? (
                      <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                        Finalizada
                      </span>
                    ) : isSuspended ? (
                      <span className="px-2 py-1 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
                        Suspendida
                      </span>
                    ) : diffDays !== null && diffDays <= 3 ? (
                      <span className="px-2 py-1 rounded-md bg-red-50 text-red-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <Clock size={10} /> Cierra pronto
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                        Activa
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif font-bold text-lg text-slate-900 leading-tight mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
                    {propertyType} en {cityName}
                  </h3>
                  
                  <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-4">
                    <MapPin size={14} />
                    <span className="truncate">{formatAddress(auction.address) || cityName}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Tasación</p>
                      <p className="font-bold text-slate-900">
                        {auction.appraisalValue ? auction.appraisalValue.toLocaleString('es-ES') + '€' : '---'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Deuda</p>
                      <p className="font-bold text-slate-600">
                        {auction.claimedDebt ? auction.claimedDebt.toLocaleString('es-ES') + '€' : '---'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                  {discount > 0 ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm">
                      <TrendingUp size={16} />
                      <span>{discount}% margen</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-slate-500 font-bold text-sm">
                      <AlertTriangle size={16} />
                      <span>Revisar cargas</span>
                    </div>
                  )}
                  <span className="text-brand-600 font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Ver ficha <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedAuctionsPage;
