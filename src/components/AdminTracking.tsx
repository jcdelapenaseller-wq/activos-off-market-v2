import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, Trash2, MapPin, MousePointer2, Globe, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

interface TrackingEvent {
  timestamp: string;
  province: string;
  origin: string;
  clickType: string;
}

const AdminTracking: React.FC = () => {
  const [events, setEvents] = useState<TrackingEvent[]>([]);

  useEffect(() => {
    const loadEvents = () => {
      const data = localStorage.getItem('aom_tracking_events');
      if (data) {
        try {
          setEvents(JSON.parse(data));
        } catch (e) {
          console.error('Error parsing tracking data', e);
        }
      }
    };
    loadEvents();
  }, []);

  const resetData = () => {
    if (window.confirm('¿Estás seguro de que quieres borrar todos los datos de tracking?')) {
      localStorage.removeItem('aom_tracking_events');
      setEvents([]);
    }
  };

  const provinceStats = useMemo(() => {
    const stats: Record<string, { premium: number; listado: number; consultoria: number; total: number }> = {};
    
    events.forEach(event => {
      const prov = event.province || 'general';
      if (!stats[prov]) {
        stats[prov] = { premium: 0, listado: 0, consultoria: 0, total: 0 };
      }
      
      if (event.clickType === 'premium') stats[prov].premium++;
      else if (event.clickType === 'listado') stats[prov].listado++;
      else if (event.clickType === 'consultoria') stats[prov].consultoria++;
      
      stats[prov].total++;
    });

    return Object.entries(stats)
      .map(([name, counts]) => ({ name, ...counts }))
      .sort((a, b) => b.total - a.total);
  }, [events]);

  const originStats = useMemo(() => {
    const stats: Record<string, number> = {};
    events.forEach(event => {
      const origin = event.origin || 'unknown';
      stats[origin] = (stats[origin] || 0) + 1;
    });

    return Object.entries(stats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [events]);

  return (
    <div className="bg-slate-50 min-h-screen p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <Link to={ROUTES.HOME} className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-600 mb-4 transition-colors">
              <ArrowLeft size={18} /> Volver a la web
            </Link>
            <h1 className="text-4xl font-serif font-bold text-slate-900 flex items-center gap-3">
              <BarChart3 className="text-brand-600" size={36} />
              Dashboard de Tracking Interno
            </h1>
            <p className="text-slate-500 mt-2">Seguimiento de conversiones y clics (Solo LocalStorage)</p>
          </div>
          
          <button 
            onClick={resetData}
            className="inline-flex items-center gap-2 bg-red-50 text-red-600 font-bold py-3 px-6 rounded-xl border border-red-100 hover:bg-red-100 transition-all"
          >
            <Trash2 size={18} /> Resetear datos
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <p className="text-slate-500 font-medium mb-1 uppercase tracking-wider text-xs">Total Eventos</p>
            <p className="text-5xl font-bold text-slate-900">{events.length}</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <p className="text-slate-500 font-medium mb-1 uppercase tracking-wider text-xs">Provincias Activas</p>
            <p className="text-5xl font-bold text-brand-600">{provinceStats.length}</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <p className="text-slate-500 font-medium mb-1 uppercase tracking-wider text-xs">Orígenes Detectados</p>
            <p className="text-5xl font-bold text-emerald-600">{originStats.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          {/* Top Provincias */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="text-brand-500" size={20} />
                Conversión por Provincia
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest">
                    <th className="px-8 py-4 font-bold">Provincia</th>
                    <th className="px-4 py-4 font-bold text-center">Listado</th>
                    <th className="px-4 py-4 font-bold text-center">Premium</th>
                    <th className="px-4 py-4 font-bold text-center">Consultoría</th>
                    <th className="px-8 py-4 font-bold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {provinceStats.length > 0 ? provinceStats.map((stat) => (
                    <tr key={stat.name} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-4 font-bold text-slate-900 capitalize">{stat.name}</td>
                      <td className="px-4 py-4 text-center text-slate-600">{stat.listado}</td>
                      <td className="px-4 py-4 text-center text-brand-600 font-medium">{stat.premium}</td>
                      <td className="px-4 py-4 text-center text-emerald-600 font-medium">{stat.consultoria}</td>
                      <td className="px-8 py-4 text-right font-bold text-slate-900">{stat.total}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-8 py-12 text-center text-slate-400 italic">No hay datos registrados todavía</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Orígenes */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Globe className="text-emerald-500" size={20} />
                Clics por Origen
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest">
                    <th className="px-8 py-4 font-bold">Origen</th>
                    <th className="px-8 py-4 font-bold text-right">Total Clics</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {originStats.length > 0 ? originStats.map((stat) => (
                    <tr key={stat.name} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-4 font-bold text-slate-900 capitalize flex items-center gap-2">
                        <MousePointer2 size={14} className="text-slate-400" />
                        {stat.name}
                      </td>
                      <td className="px-8 py-4 text-right font-bold text-slate-900">{stat.count}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={2} className="px-8 py-12 text-center text-slate-400 italic">No hay datos registrados todavía</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-brand-50 p-8 rounded-3xl border border-brand-100">
          <h3 className="font-bold text-brand-900 mb-2">Nota Técnica:</h3>
          <p className="text-brand-800 text-sm leading-relaxed">
            Este panel lee exclusivamente del <code>localStorage</code> de tu navegador. Los datos son locales y se pierden si borras la caché o usas otro dispositivo. Es una herramienta de diagnóstico rápido para validar qué CTAs y provincias están traccionando mejor sin necesidad de implementar un backend complejo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminTracking;
