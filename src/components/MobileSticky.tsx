import React from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { trackConversion } from '../utils/tracking';

const MobileSticky: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-3 md:hidden z-50 flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <a 
            href="https://t.me/activosoffmarket"
            target="_blank"
            rel="noopener noreferrer" 
            className="flex-1 bg-white text-brand-900 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm border-2 border-brand-100 active:bg-slate-50"
        >
            <Send size={18} className="text-brand-600" /> Canal Gratis
        </a>
        <Link 
            to={ROUTES.ALERTAS} onClick={() => trackConversion('espana', 'footer', 'premium', { plan: 'radar_premium' })}
            className="flex-1 bg-brand-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm active:bg-brand-800 shadow-md"
        >
            <Sparkles size={18} className="text-yellow-400" /> Premium
        </Link>
    </div>
  );
};

export default MobileSticky;