import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Zap, Clock, ShieldCheck, ArrowRight, Star, Mail, Bell } from 'lucide-react';
import { ROUTES } from '../constants/routes';
import Header from './Header';
import Footer from './Footer';

const AlertSuccessPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email') || '';

  // URL de Stripe Payment Link Real
  // Se añade el parámetro prefilled_email para mejorar la UX
  const STRIPE_PAYMENT_LINK = `https://buy.stripe.com/cNifZj2Uf6hX8lT6WAdjO03?prefilled_email=${encodeURIComponent(email)}&client_reference_id=${encodeURIComponent(email)}`;

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Confirma tu Alerta | Activos Off-Market";
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-16 md:py-24 px-6">
        <div className="max-w-4xl mx-auto">
          
          {/* BLOQUE SUPERIOR (NUEVO) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-10 md:p-16 shadow-sm text-center mb-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-full -mr-12 -mt-12 opacity-50"></div>
            
            <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-50 rounded-full text-brand-600 mb-8">
              <Mail size={48} />
            </div>
            
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Confirma tu alerta para empezar a recibir oportunidades
            </h1>
            <p className="text-slate-600 text-xl max-w-2xl mx-auto leading-relaxed">
              Hemos guardado tus criterios de búsqueda para <span className="font-bold text-slate-900">{email}</span>. 
              <br className="hidden md:block" />
              Activa el <span className="text-brand-700 font-semibold">Radar Premium</span> para recibir por email nuevas subastas que encajen contigo sin tener que revisar el BOE cada día.
            </p>
          </div>

          {/* BLOQUE PREMIUM (REESCRIBIR) */}
          <div className="bg-slate-900 rounded-3xl p-10 md:p-16 text-white shadow-2xl relative overflow-hidden border border-slate-800">
            {/* Decoración */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600 rounded-full opacity-10 blur-3xl translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-500 rounded-full opacity-5 blur-3xl -translate-x-1/2 translate-y-1/2"></div>

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                <div className="max-w-xl">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-600/20 text-brand-400 rounded-full text-sm font-bold tracking-widest uppercase mb-6 border border-brand-600/30">
                    <Star size={14} fill="currentColor" /> Recomendado para Inversores
                  </span>
                  <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 leading-tight">
                    Recibe nuevas subastas sin tener que <span className="text-brand-500">revisar el BOE</span>
                  </h2>
                  <p className="text-slate-300 text-xl leading-relaxed">
                    Evita revisar decenas de anuncios del BOE cada día. Recibe solo los que encajan con tu búsqueda directamente en tu bandeja de entrada.
                  </p>
                </div>
                <div className="flex-shrink-0">
                   <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 backdrop-blur-sm text-center min-w-[200px]">
                      <p className="text-brand-400 text-sm uppercase font-bold tracking-widest mb-1">Prueba Gratuita</p>
                      <p className="text-4xl font-bold text-white">7 Días</p>
                      <div className="h-px bg-slate-700 my-4"></div>
                      <p className="text-slate-300 text-lg font-medium">Después 5€/mes</p>
                      <p className="text-slate-500 text-xs mt-2">Cancela cuando quieras</p>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mb-12">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-brand-600/20 rounded-lg flex items-center justify-center text-brand-500 flex-shrink-0">
                    <Bell size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Aviso inmediato</h3>
                    <p className="text-slate-400 text-sm">Te avisamos en cuanto aparece una nueva subasta relevante para ti.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-brand-600/20 rounded-lg flex items-center justify-center text-brand-500 flex-shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Filtrado inteligente</h3>
                    <p className="text-slate-400 text-sm">Recibe solo oportunidades que encajan con tu provincia y tipo de inmueble.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-brand-600/20 rounded-lg flex items-center justify-center text-brand-500 flex-shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Ahorro de tiempo</h3>
                    <p className="text-slate-400 text-sm">Ahorra horas revisando el BOE manualmente cada día.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-brand-600/20 rounded-lg flex items-center justify-center text-brand-500 flex-shrink-0">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Foco en oportunidades</h3>
                    <p className="text-slate-400 text-sm">Recibe solo oportunidades que encajan contigo, sin ruido innecesario.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center md:items-start gap-6">
                <div className="w-full sm:w-auto text-center md:text-left">
                  <a 
                    href={STRIPE_PAYMENT_LINK}
                    className="w-full sm:w-auto px-10 py-5 bg-brand-600 text-white font-bold rounded-2xl text-xl hover:bg-brand-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-brand-600/20 group"
                  >
                    Probar 7 días gratis <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                  <p className="mt-3 text-slate-400 text-sm font-medium">
                    Sin compromiso. Cancela en un clic.
                  </p>
                </div>
                
                <Link 
                  to={ROUTES.HOME}
                  className="text-slate-500 hover:text-white font-medium transition-colors"
                >
                  Prefiero hacerlo más tarde
                </Link>
              </div>
              
              {/* BLOQUE CIERRE */}
              <div className="mt-12 border-t border-slate-800 pt-8">
                <p className="text-slate-400 text-sm mb-2 font-medium">
                  Revisamos nuevas subastas cada día y te avisamos cuando aparece algo relevante.
                </p>
                <p className="text-slate-500 text-xs">
                  Este servicio está pensado para quienes quieren enterarse antes sin tener que revisar el BOE todos los días.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link to={ROUTES.HOME} className="text-slate-500 hover:text-brand-700 transition-colors flex items-center justify-center gap-2">
               Volver al inicio
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AlertSuccessPage;
