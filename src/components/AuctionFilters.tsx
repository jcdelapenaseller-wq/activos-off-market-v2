import React, { useState, useMemo, useEffect } from 'react';
import { AuctionData } from '../data/auctions';
import { getComputedStatus, getAuctionType } from '../utils/auctionHelpers';

interface AuctionFiltersProps {
  auctions: Record<string, AuctionData>;
  onFilteredChange: (filtered: Record<string, AuctionData>) => void;
}

export const AuctionFilters: React.FC<AuctionFiltersProps> = ({ auctions, onFilteredChange }) => {
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [status, setStatus] = useState<string>('');
  const [type, setType] = useState<string>('');

  const filteredAuctions = useMemo(() => {
    return Object.entries(auctions).reduce((acc, [slug, data]) => {
      if (city && data.city?.toLowerCase() !== city.toLowerCase()) return acc;
      if (province && data.province?.toLowerCase() !== province.toLowerCase()) return acc;
      if (status && getComputedStatus(data) !== status) return acc;
      if (type && getAuctionType(data.boeId) !== type) return acc;
      acc[slug] = data;
      return acc;
    }, {} as Record<string, AuctionData>);
  }, [auctions, city, province, status, type]);

  useEffect(() => {
    onFilteredChange(filteredAuctions);
  }, [filteredAuctions, onFilteredChange]);

  const cities = useMemo(() => Array.from(new Set(Object.values(auctions).map(a => a.city).filter(Boolean))), [auctions]);
  const provinces = useMemo(() => Array.from(new Set(Object.values(auctions).map(a => a.province).filter(Boolean))), [auctions]);
  const statuses = ['active', 'upcoming', 'suspended', 'closed'];
  const types = useMemo(() => Array.from(new Set(Object.values(auctions).map(a => getAuctionType(a.boeId)).filter(Boolean))), [auctions]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <select value={city} onChange={e => setCity(e.target.value)} className="p-2 border rounded-lg">
          <option value="">Ciudad</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={province} onChange={e => setProvince(e.target.value)} className="p-2 border rounded-lg">
          <option value="">Provincia</option>
          {provinces.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} className="p-2 border rounded-lg">
          <option value="">Estado</option>
          <option value="active">En curso</option>
          <option value="upcoming">Próxima apertura</option>
          <option value="suspended">Pausada</option>
          <option value="closed">Finalizada</option>
        </select>
        <select value={type} onChange={e => setType(e.target.value)} className="p-2 border rounded-lg">
          <option value="">Tipo de subasta</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
    </div>
  );
};
