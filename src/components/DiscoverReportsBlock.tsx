import React from 'react';
import { Link } from 'react-router-dom';
import { DISCOVER_REPORTS } from '../data/discoverReports';
import { ROUTES } from '../constants/routes';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export const DiscoverReportsBlock: React.FC = () => {
  const reports = Object.values(DISCOVER_REPORTS).sort((a, b) => 
    new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  ).slice(0, 3);

  if (reports.length === 0) return null;

  return (
    <section className="py-12 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-600">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-900">Selección del experto</h2>
            <p className="text-slate-500 text-sm">Análisis de las mejores oportunidades del mercado</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map(report => (
            <Link 
              key={report.id}
              to={ROUTES.DISCOVER_REPORT.replace(':slug', report.id)} className="group flex flex-col bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 hover:border-emerald-200 hover:shadow-md transition-all"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={report.image} 
                  alt={report.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  width="1200"
                  height="675"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700">
                  {new Date(report.publishDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-serif font-bold text-lg text-slate-900 mb-3 group-hover:text-emerald-700 transition-colors line-clamp-2">
                  {report.title}
                </h3>
                <p className="text-slate-600 text-sm line-clamp-2 mb-4 flex-grow">
                  {report.intro}
                </p>
                <div className="flex items-center text-emerald-600 font-bold text-sm mt-auto">
                  Leer análisis
                  <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
