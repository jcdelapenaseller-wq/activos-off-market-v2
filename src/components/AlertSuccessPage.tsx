import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Zap, Clock, ShieldCheck, ArrowRight, Star, Mail, Bell } from 'lucide-react';
import { ROUTES } from '../constants/routes';
import { trackConversion } from '../utils/tracking';
import { useUser } from '../contexts/UserContext';
import Header from './Header';
import Footer from './Footer';

const AlertSuccessPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email') || '';
  const { plan } = useUser();

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
              <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 mx-auto mb-8 shadow-inner">
                <Zap size={40} fill="currentColor" />
              </div>
              
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 mb-4 px-4">
                Recibe solo oportunidades que encajan contigo
              </h1>
              
              <p className="text-slate-600 text-lg mb-10 leading-relaxed px-4">
                Te avisamos cuando detectemos una subasta que encaje con tu búsqueda.
              </p>

              {/* Upgrade Block */}
              {plan !== 'pro' && (
                <div className="bg-slate-900 rounded-[2rem] p-8 md:p-10 text-white shadow-2xl mb-10 border border-slate-800 text-center relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-brand-600 rounded-full opacity-10 blur-3xl -mr-20 -mt-20 group-hover:opacity-20 transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-brand-600 rounded-full opacity-5 blur-3xl -ml-20 -mb-20"></div>
                  
                  <div className="relative z-10">
                    <h3 className="text-3xl font-black mb-4 tracking-tight">¿Quieres más alertas?</h3>
                    <p className="text-slate-300 text-lg mb-8">
                      {plan === 'free' 
                        ? 'Tienes 1 alerta. BASIC permite hasta 3.' 
                        : 'Tienes 3 alertas. PRO permite ilimitadas.'}
                    </p>
                    
                    <Link 
                      to={ROUTES.PRO}
                      className="w-full py-5 bg-brand-600 text-white font-bold rounded-2xl text-xl hover:bg-brand-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-600/30 group scale-100 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {plan === 'free' ? 'Mejorar a BASIC' : 'Pasar a PRO'} <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4">
                <Link 
                  to={ROUTES.RECENT_AUCTIONS}
                  className="text-slate-400 font-medium hover:text-brand-700 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  Seguir buscando subastas <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 text-xs font-medium">
            <ShieldCheck size={14} className="text-brand-500" />
            <span>Inversores ya reciben alertas cada día</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AlertSuccessPage;
