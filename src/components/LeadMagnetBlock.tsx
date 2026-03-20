import React, { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import { trackConversion } from '../utils/tracking';

const LeadMagnetBlock: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'checklist' }),
      });
      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 my-12 shadow-sm">
      {status === 'success' ? (
        <div className="flex flex-col md:flex-row items-center gap-6 text-emerald-700">
          <CheckCircle size={48} className="flex-shrink-0" />
          <p className="text-xl font-bold">¡Checklist enviado! Revisa tu bandeja de entrada (y la carpeta de spam).</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h3 className="font-serif text-3xl font-bold text-slate-900 mb-4">Descarga el Checklist de Subastas BOE</h3>
            <p className="text-slate-600 text-lg mb-6">
              Evita errores costosos con nuestra guía paso a paso. 
              <span className="block font-semibold text-slate-900 mt-2">Es gratis, sin compromiso y te ahorrará horas de investigación.</span>
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu mejor email"
                required
                className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-lg focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              onClick={() => trackConversion('general', 'lead_magnet', 'premium')}
              className="w-full bg-brand-600 text-white font-bold py-4 rounded-xl text-lg hover:bg-brand-700 transition-colors disabled:opacity-50 shadow-md"
            >
              {status === 'loading' ? 'Enviando...' : 'Obtener checklist gratis'}
            </button>
            <p className="text-center text-slate-400 text-sm">Sin compromiso. Puedes darte de baja cuando quieras.</p>
            {status === 'error' && <p className="text-red-500 text-sm text-center">Hubo un error, inténtalo de nuevo.</p>}
          </form>
        </div>
      )}
    </div>
  );
};

export default LeadMagnetBlock;
