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
      const redirectPath = window.location.pathname + window.location.search;
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
                      className="w-full py-3.5 px-6 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 text-base"
                    >
                      Continuar con Google
                    </button>
                    <button
                      onClick={handleAuthAction}
                      className="w-full py-3 px-6 border-2 border-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-200 transition-all text-sm"
                    >
                      Iniciar sesión
                    </button>
                    <p className="text-[10px] text-slate-400 font-medium">
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
                
                <button
                  onClick={onClose}
                  className={`mt-1 text-xs text-slate-400 hover:text-slate-600 transition-colors ${isLimit ? '' : 'underline underline-offset-4'}`}
                >
                  {isLimit ? 'Quizás más tarde' : 'Continuar sin guardar'}
                </button>
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
