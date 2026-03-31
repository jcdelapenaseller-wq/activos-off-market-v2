import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, ShieldCheck, Bell, Heart } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

interface SoftGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  origin?: 'favorite' | 'alert' | 'note' | 'limit_favorite' | 'limit_alert' | 'valuation' | 'boe' | 'save' | 'limit_analysis' | 'streetview' | 'catastro' | 'comparativa';
  onUnlock?: () => void;
}

const SoftGateModal: React.FC<SoftGateModalProps> = ({ isOpen, onClose, origin, onUnlock }) => {
  const { user, isLoading, plan } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  if (plan === 'pro' && isOpen) {
    // If somehow a PRO user triggers this, we just close it or don't show it
    return null;
  }

  const handleAuthAction = () => {
    if (isLoading) return;

    if (user) {
      navigate(ROUTES.PRO);
    } else {
      let redirectPath = window.location.pathname + window.location.search;
      if (origin === 'boe') {
        redirectPath += (window.location.search ? '&' : '?') + 'openBoe=true';
      }
      navigate(`${ROUTES.LOGIN}?from=feature&redirect=${encodeURIComponent(redirectPath)}`);
    }
    onClose();
  };

  const handleUnlockAction = () => {
    if (onUnlock) {
      onUnlock();
      onClose();
    }
  };

  const getContent = () => {
    switch (origin) {
      case 'streetview':
        return {
          title: 'Ver entorno real del inmueble',
          text: 'Accede a la vista de calle para analizar el entorno del activo y su estado exterior.',
          hint: 'Plan actual: FREE',
          upgradeHint: 'BASIC o PRO requerido'
        };
      case 'catastro':
        return {
          title: 'Ver superficie real verificada',
          text: 'Visualiza el ahorro potencial, comparación con mercado y métricas de oportunidad.',
          hint: 'Plan actual: FREE',
          upgradeHint: 'BASIC o PRO requerido'
        };
      case 'comparativa':
        return {
          title: 'Ver precio real de mercado',
          text: 'Accede al análisis de precios comparables y valoración estimada del activo.',
          hint: 'Plan actual: FREE',
          upgradeHint: 'BASIC o PRO requerido'
        };
      case 'boe':
        return {
          title: 'Accede al expediente oficial',
          text: 'Inicia sesión gratis para ver el enlace directo al Portal de Subastas del BOE.',
          hint: null,
          upgradeHint: null
        };
      default:
        return {
          title: 'Guarda subastas y crea alertas gratis',
          text: 'Crea una cuenta gratuita para guardar favoritos, añadir notas y recibir alertas de nuevas oportunidades.',
          hint: null,
          upgradeHint: null
        };
    }
  };

  const content = getContent();
  const isLimit = origin?.startsWith('limit_');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
            >
              <X size={20} />
            </button>

            <div className="p-6 pt-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-50 rounded-xl mb-4 relative">
                <Lock className="text-brand-600" size={24} />
                <div className="absolute -top-1.5 -right-1.5 flex gap-0.5">
                  <div className="w-5 h-5 bg-white rounded-md shadow-sm flex items-center justify-center animate-bounce" style={{ animationDelay: '0s' }}>
                    <Heart className="text-red-500" size={10} fill="currentColor" />
                  </div>
                  <div className="w-5 h-5 bg-white rounded-md shadow-sm flex items-center justify-center animate-bounce" style={{ animationDelay: '0.2s' }}>
                    <Bell className="text-emerald-500" size={10} fill="currentColor" />
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-serif font-bold text-slate-900 mb-2">
                {content.title}
              </h3>
              
              <div className="mb-6">
                <p className="text-slate-600 leading-relaxed text-sm">
                  {content.text}
                </p>
                {content.upgradeHint && (
                  <p className="text-[11px] text-brand-600 font-bold mt-2">
                    {content.upgradeHint}
                  </p>
                )}
                {content.hint && (
                  <p className="text-[10px] text-slate-400 mt-1.5 font-medium uppercase tracking-wider">
                    {content.hint}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {!user ? (
                  <>
                    <button
                      onClick={handleAuthAction}
                      className="w-full flex items-center justify-center gap-3 px-6 h-12 bg-white border border-slate-200 rounded-[10px] text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all active:scale-[0.98]"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continuar con Google
                    </button>
                    <button
                      onClick={() => {
                        const redirectPath = window.location.pathname + window.location.search;
                        navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(redirectPath)}&method=email`);
                        onClose();
                      }}
                      className="w-full py-2 text-slate-500 font-medium hover:text-slate-700 transition-colors text-sm"
                    >
                      Usar otro correo
                    </button>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">
                      Acceso en 1 clic · Sin tarjeta
                    </p>
                  </>
                ) : plan === 'free' ? (
                  <>
                    <button
                      onClick={handleAuthAction}
                      className="w-full py-3.5 px-6 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 text-base"
                    >
                      Desbloquear con BASIC
                    </button>
                    <button
                      onClick={handleAuthAction}
                      className="w-full py-3 px-6 border-2 border-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-200 transition-all text-sm"
                    >
                      Ver planes
                    </button>
                  </>
                ) : plan === 'basic' && (user.analysisUsed || 0) < 5 ? (
                  <button
                    onClick={handleUnlockAction}
                    className="w-full py-3.5 px-6 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 text-base"
                  >
                    Desbloquear con 1 crédito
                  </button>
                ) : (
                  <button
                    onClick={handleAuthAction}
                    className="w-full py-3.5 px-6 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 text-base"
                  >
                    Comprar análisis
                  </button>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] text-slate-400">
                <ShieldCheck size={12} />
                <span>Privacidad garantizada • Sin compromiso</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SoftGateModal;
