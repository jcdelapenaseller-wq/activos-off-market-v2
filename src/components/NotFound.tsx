import React from 'react';
import { Link } from 'react-router-dom';
import { Home, BookOpen, AlertCircle } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-10 md:p-16 text-center">
        <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <AlertCircle size={40} className="text-brand-600" />
        </div>
        
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 mb-6">
          404: Página no encontrada
        </h1>
        
        <p className="text-xl text-slate-600 mb-10 leading-relaxed">
          Parece que te has perdido en el BOE. Esta página no existe o ha sido adjudicada a otro postor.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="inline-flex items-center justify-center gap-2 bg-brand-700 text-white font-bold py-3 px-8 rounded-xl hover:bg-brand-800 transition-colors shadow-lg"
          >
            <Home size={20} /> Ir al Inicio
          </Link>
          <Link 
            to="/subastas-judiciales-espana" 
            className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 border-2 border-slate-200 font-bold py-3 px-8 rounded-xl hover:bg-slate-50 hover:border-brand-200 transition-colors"
          >
            <BookOpen size={20} /> Guía de Subastas
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;