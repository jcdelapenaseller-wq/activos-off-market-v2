import React from 'react';
import { Send } from 'lucide-react';
import { trackConversion } from '../utils/tracking';

interface TelegramCTAProps {
  variant?: "article" | "banner" | "sidebar";
}

const TelegramCTA: React.FC<TelegramCTAProps> = ({ variant = "article" }) => {
  const telegramUrl = "https://t.me/activosoffmarket";

  const baseClasses = "bg-slate-50 border border-slate-200 rounded-2xl p-6 transition-all";

  const variantClasses = {
    article: "max-w-2xl mx-auto my-8 text-center",
    banner: "w-full my-8 flex flex-col md:flex-row items-center justify-between gap-6 p-8",
    sidebar: "w-full my-4 p-4 text-center"
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]}`}>
      <div className={variant === "banner" ? "text-left" : ""}>
        <h3 className="text-xl font-bold text-slate-900 mb-2">🔔 Alertas de subastas con alto descuento</h3>
        <p className="text-slate-600 mb-2">En el canal gratuito publicamos oportunidades detectadas en el BOE antes de que se adjudiquen.</p>
        <p className="text-sm font-semibold text-brand-600 mb-6">Más de 800 inversores ya están dentro.</p>
      </div>
      <a
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackConversion('general', 'discover', 'premium')}
        className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-brand-600 transition-colors whitespace-nowrap"
      >
        <Send size={16} />
        Ver canal Telegram
      </a>
    </div>
  );
};

export default TelegramCTA;
