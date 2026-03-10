import React, { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';

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
    <div className="bg-brand-900 rounded-3xl p-8 md:p-12 text-white my-12 shadow-xl">
      {status === 'success' ? (
        <div className="flex items-center gap-4 text-emerald-300">
          <CheckCircle size={48} />
          <p className="text-xl font-bold">Te acabo de enviar el Checklist de subastas BOE. Revisa tu email.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="font-serif text-3xl font-bold mb-4">¿Quieres el Checklist de Subastas BOE?</h3>
            <p className="text-slate-300 text-lg">Descarga gratis nuestra guía rápida para no perderte ningún paso crítico en tu próxima puja.</p>
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
                className="w-full bg-white text-slate-900 rounded-xl py-4 pl-12 pr-4 text-lg focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-brand-500 text-white font-bold py-4 rounded-xl text-lg hover:bg-brand-600 transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? 'Enviando...' : 'Descargar Checklist'}
            </button>
            {status === 'error' && <p className="text-red-300 text-sm">Hubo un error, inténtalo de nuevo.</p>}
          </form>
        </div>
      )}
    </div>
  );
};

export default LeadMagnetBlock;
