import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { ROUTES } from '../constants/routes';
import { Gavel, ArrowLeft, Loader2, CheckCircle, Shield, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { auth, googleProvider, db } from '../lib/firebase';
import { GoogleAuthProvider, signInWithCredential, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

declare global {
  interface Window {
    google: any;
  }
}

const LoginPage: React.FC = () => {
  const { login, isLogged, isLoading } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  // Redirection logic: if already logged in, go to dashboard or intended page
  useEffect(() => {
    console.log("[AUTH_DEBUG] LoginPage: isLogged:", isLogged, "isLoading:", isLoading);
    if (isLogged && !isLoading) {
      console.log("[AUTH_DEBUG] LoginPage: User is logged in and not loading, REDIRECTING...");
      const searchParams = new URLSearchParams(location.search);
      const redirectQuery = searchParams.get('redirect');
      const fromQuery = searchParams.get('from');
      const fromState = (location.state as any)?.from?.pathname;
      
      const from = redirectQuery || (fromQuery ? `/${fromQuery}` : (fromState || ROUTES.HOME));
      console.log("[AUTH_DEBUG] LoginPage: Target path:", from);
      navigate(from, { replace: true });
    }
  }, [isLogged, isLoading, navigate, location]);

  // Handle Redirect Result
  useEffect(() => {
    const checkRedirect = async () => {
      try {
        console.log("[AUTH_DEBUG] LoginPage: Checking getRedirectResult...");
        const result = await getRedirectResult(auth);
        console.log("[AUTH_DEBUG] LoginPage: getRedirectResult result:", result?.user?.uid || 'null');
        if (result) {
          setIsAuthenticating(true);
          const user = result.user;
          
          // Ensure profile exists in Firestore
          if (db) {
            console.log("[AUTH_DEBUG] LoginPage: Checking/Creating Firestore profile for:", user.uid);
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            
            if (!userSnap.exists()) {
              console.log("[AUTH_DEBUG] LoginPage: Creating new profile in Firestore");
              await setDoc(userRef, {
                id: user.uid,
                email: user.email || '',
                name: user.displayName || '',
                plan: 'free',
                createdAt: serverTimestamp(),
                analysisUsed: 0,
                lastAnalysisReset: serverTimestamp()
              });
            } else {
              console.log("[AUTH_DEBUG] LoginPage: Profile already exists in Firestore");
            }
          }
          console.log("[AUTH_DEBUG] LoginPage: Redirect result handled.");
        }
      } catch (error) {
        console.error('[AUTH_DEBUG] LoginPage: Error with redirect result:', error);
        setIsAuthenticating(false);
      }
    };
    checkRedirect();
  }, [navigate, location]);

  // Load Google One Tap
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google && import.meta.env.VITE_GOOGLE_CLIENT_ID) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });
        window.google.accounts.id.prompt();
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCredentialResponse = async (response: any) => {
    setIsAuthenticating(true);
    const credential = response.credential;
    const googleCredential = GoogleAuthProvider.credential(credential);
    try {
      await signInWithCredential(auth, googleCredential);
      // Redirection is handled by the useEffect above once auth state updates
    } catch (error) {
      console.error('Error logging in with One Tap:', error);
      setIsAuthenticating(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    setIsBlocked(false);
    try {
      console.log("[AUTH_DEBUG] calling redirect");
      await signInWithRedirect(auth, googleProvider);
    } catch (error: any) {
      console.error('Error logging in:', error);
      setIsAuthenticating(false);
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        setIsBlocked(true);
      }
    }
  };

  const getMessage = () => {
    const searchParams = new URLSearchParams(location.search);
    const from = searchParams.get('from');
    switch (from) {
      case 'charges': return "Accede al análisis jurídico completo de la subasta";
      case 'rentabilidad': return "Calcula la rentabilidad real antes de pujar";
      case 'favoritos': return "Guarda subastas y crea tu lista de oportunidades";
      case 'pro': return "Accede a herramientas avanzadas para inversores";
      default: return "Accede a tu cuenta para continuar";
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-6 bg-slate-50/50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Back link */}
        <Link 
          to={ROUTES.HOME} 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors mb-6 text-sm font-medium group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Volver
        </Link>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2 flex items-center gap-1.5">
              <Shield size={12} /> 🔒 Acceso privado inversores
            </div>
            <h1 className="text-2xl font-serif font-bold text-slate-900 mb-2">
              Iniciar sesión
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              {getMessage()}
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={isAuthenticating}
              className="w-full flex items-center justify-center gap-3 px-6 h-12 bg-white border border-slate-200 rounded-[10px] text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
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
                  {isBlocked ? 'Reintentar con Google' : 'Continuar con Google'}
                </>
              )}
            </button>

            <div className="text-center space-y-1">
              <p className="text-[11px] text-slate-400">
                Acceso inmediato · Sin compromiso · 1 análisis gratuito incluido
              </p>
            </div>

            {/* Value Block */}
            <div className="mt-6 pt-6 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <CheckCircle size={14} className="text-brand-600" /> Guarda subastas favoritas
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Zap size={14} className="text-brand-600" /> 1 análisis gratis incluido
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Shield size={14} className="text-brand-600" /> Acceso a herramientas PRO
              </div>
            </div>
            
            {/* Social Proof */}
            <div className="text-center pt-4">
               <p className="text-[10px] text-slate-400 italic">
                 Más de 5.000 inversores ya usan Activos Off-Market
               </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center">
          <p className="text-[10px] text-slate-400 px-4 leading-relaxed">
            Al continuar, aceptas nuestros{' '}
            <Link to={ROUTES.TERMS} className="underline hover:text-brand-600">Términos</Link> y{' '}
            <Link to={ROUTES.PRIVACY} className="underline hover:text-brand-600">Privacidad</Link>.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
