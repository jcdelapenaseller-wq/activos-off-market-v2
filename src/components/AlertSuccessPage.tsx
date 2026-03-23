import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Zap, Clock, ShieldCheck, ArrowRight, Star, Mail, Bell } from 'lucide-react';
import { ROUTES } from '../constants/routes';
import { trackConversion } from '../utils/tracking';
import Header from './Header';
import Footer from './Footer';

const AlertSuccessPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email') || '';

  // URL de Stripe Payment Link Real
  // Se añade el parámetro prefilled_email para mejorar la UX
  const STRIPE_PAYMENT_LINK = `https://buy.stripe.com/cNifZj2Uf6hX8lT6WAdjO03?prefilled_email=${encodeURIComponent(email)}&client_reference_id=${encodeURIComponent(email)}`;

  const handleStripeClick = () => {
    trackConversion('espana', 'alert_creation', 'pro_checkout', { plan: 'radar_premium', email });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Confirma tu Alerta | Activos Off-Market";
    trackConversion('espana', 'alert_creation', 'pro_unlock', { step: 'upsell_arrival', email });
  }, [email]);

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center py-12 px-6">
        <div className="max-w-xl w-full">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100 text-center relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-8 shadow-inner">
                <CheckCircle size={40} />
              </div>
              
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                ¡Alerta creada con éxito!
              </h1>
              
              <p className="text-slate-600 text-lg mb-10 leading-relaxed">
                Te avisaremos en <span className="font-bold text-slate-900">{email}</span> cuando detectemos subastas que encajen con tu búsqueda.
              </p>

              {/* Radar Premium Upsell Block */}
              <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl mb-8 border border-slate-800 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-600 rounded-full opacity-10 blur-2xl -mr-12 -mt-12"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap size={16} className="text-brand-400" fill="currentColor" />
                    <span className="text-xs font-bold tracking-widest uppercase text-brand-400">Radar Premium</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">7 Días Gratis</h3>
                  <p className="text-slate-400 text-sm mb-6">Recibe las subastas antes que nadie y ahorra horas de búsqueda.</p>

                  <a 
                    href={STRIPE_PAYMENT_LINK}
                    onClick={handleStripeClick}
                    className="w-full py-4 bg-brand-600 text-white font-bold rounded-xl text-lg hover:bg-brand-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-600/20 group mb-4"
                  >
                    Activar Radar Premium <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                  
                  <p className="text-center text-[11px] text-slate-500">
                    Después 5€/mes. Sin compromiso. Cancela en 1 clic.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Link 
                  to={ROUTES.RECENT_AUCTIONS}
                  className="text-brand-700 font-bold hover:text-brand-800 transition-colors flex items-center justify-center gap-2"
                >
                  Volver al listado de subastas <ArrowRight size={18} />
                </Link>
                <Link 
                  to={ROUTES.HOME}
                  className="text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                  Ir al inicio
                </Link>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 text-xs font-medium">
            <Star size={12} className="text-brand-500" fill="currentColor" />
            <span>Inversores ya reciben alertas cada día</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AlertSuccessPage;
