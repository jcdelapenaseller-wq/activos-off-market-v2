import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Star, CheckCircle, ArrowRight, FileText, Search, Home } from 'lucide-react';
import { trackConversion } from '../utils/tracking';
import { motion } from 'motion/react';
import { useUser } from '../contexts/UserContext';
import { toast } from 'sonner';
import { startCheckout, BillingCycle as StripeBillingCycle } from '../lib/billing';
import { ROUTES } from '../constants/routes';

type BillingCycle = 'mensual' | 'trimestral' | 'anual';

const ProPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('anual');
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro'>('basic');
  const { user, isLoading, updatePlan, plan: currentPlan } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    trackConversion('espana', 'pro_page_view', 'arrival');
  }, []);

  const handleActivate = async (planToActivate: 'basic' | 'pro') => {
    if (currentPlan === planToActivate) return;

    if (isLoading) return;

    if (!user) {
      navigate(`${ROUTES.LOGIN}?from=feature&redirect=${window.location.pathname}`);
      return;
    }

    try {
      // Map local billing cycle to Stripe billing cycle
      const stripeCycle: StripeBillingCycle = 
        billingCycle === 'mensual' ? 'monthly' :
        billingCycle === 'trimestral' ? 'quarterly' : 'yearly';
        
      await startCheckout(planToActivate, stripeCycle);
    } catch (error) {
      toast.error('Error al iniciar el proceso de pago');
    }
  };

  const getPrice = (plan: 'basic' | 'pro') => {
    if (plan === 'basic') {
      if (billingCycle === 'mensual') return '9,90€';
      if (billingCycle === 'trimestral') return '24,90€';
      return '79€';
    } else {
      if (billingCycle === 'mensual') return '19,90€';
      if (billingCycle === 'trimestral') return '49€';
      return '149€';
    }
  };

  const getPeriodLabel = () => {
    if (billingCycle === 'mensual') return '/ mes';
    if (billingCycle === 'trimestral') return '/ trimestre';
    return '/ año';
  };

  const getSavingsData = (plan: 'basic' | 'pro') => {
    if (billingCycle === 'mensual') return null;

    const basePrice = plan === 'basic' ? 9.90 : 19.90;
    const currentPrice = plan === 'basic' 
      ? (billingCycle === 'trimestral' ? 24.90 : 79)
      : (billingCycle === 'trimestral' ? 49 : 149);
    const months = billingCycle === 'trimestral' ? 3 : 12;

    const monthlyEq = (currentPrice / months).toFixed(2).replace('.', ',');
    const normalTotal = basePrice * months;
    const savingsPercent = Math.round(((normalTotal - currentPrice) / normalTotal) * 100);

    return { monthlyEq, savingsPercent };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 pb-32 md:pb-20">
      <div className="text-center max-w-3xl mx-auto mb-16">
        {currentPlan === 'free' && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-6">
            <CheckCircle size={14} />
            Empieza con 1 análisis gratis incluido
          </div>
        )}
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 mb-4">
          Todo lo que necesitas para analizar una subasta con seguridad
        </h1>
        <p className="text-sm text-slate-500 mb-10">
          Empieza gratis hoy · Mejora cuando quieras
        </p>

        {/* Toggle */}
        <div className="inline-flex items-center p-1 bg-slate-100 rounded-full border border-slate-200">
          <button
            onClick={() => setBillingCycle('mensual')}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
              billingCycle === 'mensual'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setBillingCycle('trimestral')}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
              billingCycle === 'trimestral'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Trimestral
          </button>
          <button
            onClick={() => setBillingCycle('anual')}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
              billingCycle === 'anual'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Anual
            <span className="bg-emerald-100 text-emerald-700 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold">
              -30%
            </span>
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-4">
          Elige anual y ahorra hasta un 35%
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24">
        {/* GRATIS */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold uppercase tracking-wider py-1 px-4 rounded-full whitespace-nowrap">
            Empieza gratis · 1 análisis incluido
          </div>
          <div className="mb-6 mt-2">
            <h3 className="text-xl font-bold text-slate-900 mb-2">GRATIS</h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold text-slate-900">0€</span>
            </div>
            <div className="h-6 mb-3"></div>
            <p className="text-slate-600 text-sm">Para empezar a explorar el mercado.</p>
          </div>
          
          <ul className="space-y-4 mb-8 flex-1">
            {[
              'Acceso fichas',
              '5 favoritos',
              '1 alerta básica',
              '1 análisis cargas gratis',
              'Checklist inversor'
            ].map((feature, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-700">
                <CheckCircle size={18} className="text-slate-400 shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          <button className="w-full py-3.5 px-6 rounded-xl bg-slate-100 text-slate-900 font-bold hover:bg-slate-200 transition-colors">
            Explorar gratis
          </button>
        </div>

        {/* BASIC */}
        <div 
          className={`bg-slate-900 rounded-3xl border shadow-xl p-8 flex flex-col relative transform md:-translate-y-4 cursor-pointer transition-all ${selectedPlan === 'basic' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-800'}`}
          onClick={() => setSelectedPlan('basic')}
        >
          {currentPlan !== 'basic' && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-500 text-white text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-full flex items-center gap-1">
              <Star size={12} className="fill-white" />
              Recomendado
            </div>
          )}
          {currentPlan === 'basic' && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-full flex items-center gap-1">
              <CheckCircle size={12} className="text-white" />
              Plan actual
            </div>
          )}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">BASIC</h3>
            <div className="text-[10px] text-amber-400 font-bold uppercase tracking-widest mb-2">Todo lo necesario para analizar una subasta</div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold text-white">{getPrice('basic')}</span>
              <span className="text-slate-400 text-sm">{getPeriodLabel()}</span>
            </div>
            <div className="h-6 mb-3">
              {billingCycle !== 'mensual' && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">{getSavingsData('basic')?.monthlyEq}€ / mes</span>
                  <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded font-medium">Ahorras {getSavingsData('basic')?.savingsPercent}%</span>
                </div>
              )}
            </div>
            <p className="text-slate-400 text-sm">Para inversores activos que buscan oportunidades.</p>
          </div>
          
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-start gap-3 text-white font-medium">
              <CheckCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <span className="text-sm">Todo lo de Gratis, más:</span>
            </li>
            {[
              'Favoritos ilimitados',
              'Alertas personalizadas',
              'Calculadora avanzada',
              '5 análisis cargas / mes',
              'Notas personales',
              'Botón "Ir a BOE oficial"',
              'Datos Catastro básicos',
              'Historial subastas vistas'
            ].map((feature, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-300">
                <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto">
            <button 
              onClick={(e) => { e.stopPropagation(); handleActivate('basic'); }}
              disabled={currentPlan === 'basic'}
              className={`w-full py-3.5 px-6 rounded-xl font-bold transition-colors shadow-lg ${
                currentPlan === 'basic' 
                  ? 'bg-slate-800 text-slate-400 cursor-default shadow-none' 
                  : 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/20'
              }`}
            >
              {currentPlan === 'basic' ? 'Plan actual' : `Activar BASIC por ${getPrice('basic')}`}
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">
              Sin compromiso · Cancela cuando quieras
            </p>
          </div>
        </div>

        {/* PRO */}
        <div 
          className={`bg-white rounded-3xl border shadow-sm p-8 flex flex-col relative cursor-pointer transition-all ${selectedPlan === 'pro' ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-slate-200'}`}
          onClick={() => setSelectedPlan('pro')}
        >
          {currentPlan === 'pro' && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-full flex items-center gap-1">
              <CheckCircle size={12} className="text-white" />
              Plan actual
            </div>
          )}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2">PRO</h3>
            <div className="text-[10px] text-brand-600 font-bold uppercase tracking-widest mb-2">Para decidir antes de pujar</div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold text-slate-900">{getPrice('pro')}</span>
              <span className="text-slate-500 text-sm">{getPeriodLabel()}</span>
            </div>
            <div className="h-6 mb-3">
              {billingCycle !== 'mensual' && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">{getSavingsData('pro')?.monthlyEq}€ / mes</span>
                  <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-medium">Ahorras {getSavingsData('pro')?.savingsPercent}%</span>
                </div>
              )}
            </div>
            <p className="text-slate-600 text-sm">Para profesionales que necesitan máxima ventaja.</p>
          </div>
          
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-start gap-3 text-slate-900 font-medium">
              <CheckCircle size={18} className="text-slate-900 shrink-0 mt-0.5" />
              <span className="text-sm">Todo lo de BASIC, más:</span>
            </li>
            {[
              'Análisis cargas IA ilimitado',
              'Dossier PDF inversión',
              'Scoring oportunidad',
              'Riesgo jurídico ampliado',
              'Alertas avanzadas',
              '20% descuento asesorías',
              'Prioridad nuevas oportunidades'
            ].map((feature, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-700">
                <CheckCircle size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto">
            <button 
              onClick={(e) => { e.stopPropagation(); handleActivate('pro'); }}
              disabled={currentPlan === 'pro'}
              className={`w-full py-3.5 px-6 rounded-xl font-bold transition-colors ${
                currentPlan === 'pro'
                  ? 'bg-slate-100 text-slate-400 cursor-default'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {currentPlan === 'pro' ? 'Plan actual' : `Activar PRO por ${getPrice('pro')}`}
            </button>
            <p className="text-xs text-gray-500 text-center mt-3">
              Sin compromiso · Cancela cuando quieras
            </p>
          </div>
        </div>
      </div>

      {/* Servicios sin suscripción */}
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">
            Servicios sin suscripción
          </h2>
          <p className="text-slate-600">
            Paga solo por lo que necesitas, cuando lo necesitas.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Dossier */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-slate-300 transition-colors">
            <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center mb-4 text-slate-700">
              <FileText size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Dossier inversión</h3>
            <p className="text-slate-600 text-sm mb-4">
              Informe completo en PDF con todos los datos de la subasta listos para analizar.
            </p>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-200">
              <span className="font-bold text-slate-900">3,99€</span>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Pago único</span>
            </div>
          </div>

          {/* Análisis cargas */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-slate-300 transition-colors">
            <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center mb-4 text-slate-700">
              <Search size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Análisis cargas</h3>
            <p className="text-slate-600 text-sm mb-4">
              Estudio detallado de la certificación de cargas para detectar riesgos ocultos.
            </p>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-200">
              <span className="font-bold text-slate-900">2,99€</span>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Pago único</span>
            </div>
          </div>

          {/* Verificación ocupación */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-slate-300 transition-colors">
            <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center mb-4 text-slate-700">
              <Home size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Verificación ocupación</h3>
            <p className="text-slate-600 text-sm mb-4">
              Comprobación in situ del estado de ocupación del inmueble por profesionales.
            </p>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-200">
              <span className="font-bold text-slate-900">Desde 99€</span>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Bajo presupuesto</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky CTA Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-8px_15px_-3px_rgba(0,0,0,0.1)] z-50">
        <button 
          onClick={() => handleActivate(selectedPlan)}
          disabled={currentPlan === selectedPlan}
          className={`w-full py-3.5 px-6 rounded-xl font-bold text-white transition-colors shadow-lg ${
            currentPlan === selectedPlan
              ? 'bg-slate-300 shadow-none cursor-default'
              : selectedPlan === 'basic' 
                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' 
                : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20'
          }`}
        >
          {currentPlan === selectedPlan 
            ? 'Plan actual' 
            : `Activar ${selectedPlan === 'basic' ? 'BASIC ⭐' : 'PRO'} por ${getPrice(selectedPlan)}`}
        </button>
        <p className="text-[11px] text-gray-500 text-center mt-2 font-medium">
          Sin compromiso · Cancela cuando quieras
        </p>
      </div>
    </div>
  );
};

export default ProPage;
