import React, { useState, useMemo, useEffect } from 'react';
import { AuctionData } from '../data/auctions';
import { getComputedStatus, getAuctionType, isAuctionActive } from '../utils/auctionHelpers';

interface AuctionFiltersProps {
  auctions: Record<string, AuctionData>;
  onFilteredChange: (filtered: Record<string, AuctionData>) => void;
  onSortChange?: (sort: string) => void;
}

export const AuctionFilters: React.FC<AuctionFiltersProps> = ({ auctions, onFilteredChange, onSortChange }) => {
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [status, setStatus] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const normalizeText = (str: string) =>
    str
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .trim();

  const filteredAuctions = useMemo(() => {
    return Object.entries(auctions).reduce((acc, [slug, data]) => {
      if (city && data.city && normalizeText(data.city) !== normalizeText(city)) return acc;
      if (province && data.province?.toLowerCase() !== province.toLowerCase()) return acc;
      if (status) {
        if (getComputedStatus(data) !== status) return acc;
      }
      if (type && getAuctionType(data.boeId) !== type) return acc;
      acc[slug] = data;
      return acc;
    }, {} as Record<string, AuctionData>);
  }, [auctions, city, province, status, type]);

  useEffect(() => {
    onFilteredChange(filteredAuctions);
  }, [filteredAuctions, onFilteredChange]);

  useEffect(() => {
    if (onSortChange) {
      onSortChange(sortBy);
    }
  }, [sortBy, onSortChange]);

  const clearFilters = () => {
    setCity('');
    setProvince('');
    setStatus('');
    setType('');
    setSortBy('recent');
  };

  const hasActiveFilters = city || province || status || type || sortBy !== 'recent';

  const cities = useMemo(() => {
    const rawCities = Object.values(auctions).map(a => a.city).filter(Boolean) as string[];
    
    // Normalizar nombres eliminando tildes antes de deduplicar
    const normalizedSet = new Set(
      rawCities.map(c => c.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim())
    );
    
    return Array.from(normalizedSet)
      .map(c => c.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '))
      .sort((a, b) => a.localeCompare(b, 'es'));
  }, [auctions]);
  const provinces = useMemo(() => {
    const uniqueProvinces = Array.from(new Set(Object.values(auctions).map(a => a.province).filter(Boolean))) as string[];
    return uniqueProvinces.sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
  }, [auctions]);
  const types = useMemo(() => Array.from(new Set(Object.values(auctions).map(a => getAuctionType(a.boeId)).filter(Boolean))), [auctions]);

  const selectBaseClass = "border border-slate-200 bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all w-full";
  const selectSizeClass = isScrolled ? "p-1.5 text-xs rounded-lg" : "p-2.5 text-sm rounded-xl";

  return (
    <div className={`sticky top-0 md:top-2 z-40 transition-all duration-300 mb-8 ${isScrolled ? 'bg-white/95 shadow-md md:rounded-2xl border-b md:border border-slate-200/50 p-2.5 md:p-3 -mx-6 px-6 md:mx-0 md:px-3' : 'bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm'}`}>
      <div className={`grid gap-2 md:gap-3 ${onSortChange ? 'grid-cols-2 md:grid-cols-6' : 'grid-cols-2 md:grid-cols-4'}`}>
        <div className="col-span-1">
          <select value={city} onChange={e => setCity(e.target.value)} className={`${selectBaseClass} ${selectSizeClass}`}>
            <option value="">Municipio</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        
        <div className="hidden md:block col-span-1">
          <select value={province} onChange={e => setProvince(e.target.value)} className={`${selectBaseClass} ${selectSizeClass}`}>
            <option value="">Provincia</option>
            {provinces.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="col-span-1">
          <select value={status} onChange={e => setStatus(e.target.value)} className={`${selectBaseClass} ${selectSizeClass}`}>
            <option value="">Situación</option>
            <option value="active">En curso</option>
            <option value="upcoming">Próxima apertura</option>
            <option value="suspended">Pausada</option>
            <option value="closed">Finalizada</option>
          </select>
        </div>
        
        <div className="hidden md:block col-span-1">
          <select value={type} onChange={e => setType(e.target.value)} className={`${selectBaseClass} ${selectSizeClass}`}>
            <option value="">Tipo de subasta</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {onSortChange && (
          <div className="col-span-2 md:col-span-1">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={`${selectBaseClass} ${selectSizeClass} bg-slate-50 font-medium`}>
              <option value="recent">Más recientes</option>
              <option value="oldest">Más antiguas</option>
              <option value="value_high">Mayor valor</option>
              <option value="value_low">Menor valor</option>
            </select>
          </div>
        )}

        {hasActiveFilters && (
          <div className="col-span-2 md:col-span-1 flex items-center justify-center md:justify-start">
            <button 
              onClick={clearFilters}
              className={`text-slate-500 hover:text-slate-800 transition-colors underline decoration-slate-300 hover:decoration-slate-500 underline-offset-2 ${isScrolled ? 'text-xs py-1' : 'text-sm py-2'}`}
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
