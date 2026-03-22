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
    document.title = "¡Alerta Activada! | Activos Off-Market";
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-16 md:py-24 px-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Mensaje de éxito */}
          <div className="bg-white border border-emerald-100 rounded-3xl p-10 md:p-16 shadow-sm text-center mb-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-12 -mt-12 opacity-50"></div>
            
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-full text-emerald-600 mb-8">
              <CheckCircle size={48} />
            </div>
            
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 mb-6">¡Tu alerta está activa!</h1>
            <p className="text-slate-600 text-xl max-w-2xl mx-auto leading-relaxed">
              Hemos registrado tus filtros correctamente. Recibirás un email en <span className="font-bold text-slate-900">{email}</span> en cuanto detectemos nuevas subastas que encajen con tu búsqueda.
            </p>
          </div>

          {/* UPSELL: RADAR PREMIUM */}
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
                    Activa tu <span className="text-brand-500">Radar Premium</span>
                  </h2>
                  <p className="text-slate-300 text-xl leading-relaxed">
                    No llegues tarde. Los mejores chollos se deciden en las primeras 24 horas. Con el Radar Premium, recibes las alertas antes que nadie.
                  </p>
                </div>
                <div className="flex-shrink-0">
                   <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm text-center">
                      <p className="text-slate-400 text-sm uppercase font-bold tracking-widest mb-1">Prueba Gratuita</p>
                      <p className="text-4xl font-bold text-white">7 Días</p>
                      <p className="text-slate-500 text-sm mt-2">Luego 19€/mes</p>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-brand-600/20 rounded-xl flex items-center justify-center text-brand-500 flex-shrink-0">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Acceso Anticipado</h3>
                    <p className="text-slate-400 text-sm">Recibe las alertas 48h antes de que se publiquen en Telegram.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-brand-600/20 rounded-xl flex items-center justify-center text-brand-500 flex-shrink-0">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Análisis Técnico</h3>
                    <p className="text-slate-400 text-sm">Incluimos un pre-análisis de riesgos en cada alerta premium.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-brand-600/20 rounded-xl flex items-center justify-center text-brand-500 flex-shrink-0">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Frecuencia Diaria</h3>
                    <p className="text-slate-400 text-sm">Escaneo constante del BOE para que no se te escape nada.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <a 
                  href={STRIPE_PAYMENT_LINK}
                  className="w-full sm:w-auto px-10 py-5 bg-brand-600 text-white font-bold rounded-2xl text-xl hover:bg-brand-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-brand-600/20 group"
                >
                  Probar 7 días GRATIS <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </a>
                <Link 
                  to={ROUTES.HOME}
                  className="text-slate-400 hover:text-white font-medium transition-colors"
                >
                  No, gracias. Prefiero la versión gratuita.
                </Link>
              </div>
              
              <p className="mt-10 text-slate-500 text-sm text-center md:text-left">
                * Sin compromiso. Cancela en cualquier momento desde tu panel de usuario.
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link to={ROUTES.HOME} className="text-brand-700 font-bold hover:underline flex items-center justify-center gap-2">
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
