import React, { useState, useMemo, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import { AuctionData } from '../data/auctions';
import { normalizePropertyType, normalizeProvince, normalizeCity } from '../utils/auctionNormalizer';

interface AuctionFiltersProps {
  auctions: [string, AuctionData][];
  onFilter: (filtered: [string, AuctionData][]) => void;
}

export const AuctionFilters: React.FC<AuctionFiltersProps> = ({ auctions, onFilter }) => {
  const [cityFilter, setCityFilter] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const cities = useMemo(() => {
    const set = new Set<string>();
    auctions.forEach(([_, data]) => {
      if (data.city) set.add(normalizeCity(data.city));
    });
    return Array.from(set).sort();
  }, [auctions]);

  const provinces = useMemo(() => {
    const set = new Set<string>();
    auctions.forEach(([_, data]) => {
      if (data.province) set.add(normalizeProvince(data.province));
    });
    return Array.from(set).sort();
  }, [auctions]);

  const types = useMemo(() => {
    const set = new Set<string>();
    auctions.forEach(([_, data]) => {
      if (data.propertyType) set.add(normalizePropertyType(data.propertyType));
    });
    return Array.from(set).sort();
  }, [auctions]);

  const statuses = [
    { label: 'En curso', value: 'active' },
    { label: 'Próxima apertura', value: 'upcoming' },
    { label: 'Pausada', value: 'suspended' },
    { label: 'Finalizada', value: 'closed' },
  ];

  useEffect(() => {
    const filtered = auctions.filter(([_, data]) => {
      const matchesCity = !cityFilter || normalizeCity(data.city).toLowerCase().includes(cityFilter.toLowerCase());
      const matchesProvince = !provinceFilter || normalizeProvince(data.province).toLowerCase().includes(provinceFilter.toLowerCase());
      const matchesStatus = !statusFilter || data.status === statusFilter;
      const matchesType = !typeFilter || normalizePropertyType(data.propertyType) === typeFilter;
      return matchesCity && matchesProvince && matchesStatus && matchesType;
    });
    onFilter(filtered);
  }, [cityFilter, provinceFilter, statusFilter, typeFilter, auctions, onFilter]);

  const clearFilters = () => {
    setCityFilter('');
    setProvinceFilter('');
    setStatusFilter('');
    setTypeFilter('');
  };

  const hasFilters = cityFilter || provinceFilter || statusFilter || typeFilter;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-sm">
      <div className="flex items-center gap-2 mb-6 text-slate-900 font-bold">
        <Filter size={20} className="text-brand-600" />
        Filtrar subastas
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Provincia */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Provincia</label>
          <select 
            value={provinceFilter}
            onChange={(e) => setProvinceFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
          >
            <option value="">Todas las provincias</option>
            {provinces.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Ciudad */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ciudad</label>
          <input 
            type="text"
            placeholder="Ej: Madrid, Valencia..."
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
          />
        </div>

        {/* Estado */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Estado</label>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
          >
            <option value="">Todos los estados</option>
            {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Tipo de Activo */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tipo de activo</label>
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
          >
            <option value="">Todos los tipos</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {hasFilters && (
        <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end">
          <button 
            onClick={clearFilters}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-600 transition-colors"
          >
            <X size={16} /> Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
};
