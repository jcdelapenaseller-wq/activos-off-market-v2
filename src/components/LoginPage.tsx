import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { ROUTES } from '../constants/routes';
import { Gavel, ArrowLeft, Loader2, CheckCircle, Shield, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { auth, googleProvider, db } from '../lib/firebase';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
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
  const searchParams = new URLSearchParams(location.search);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  
  const [showEmailForm, setShowEmailForm] = useState(searchParams.get('method') === 'email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (resetSuccess) {
      setResetSuccess('');
    }
  }, [email]);

  console.log("[AUTH_DEBUG] render LoginPage - isAuthenticating:", isAuthenticating);

  // Redirection logic: if already logged in, go to dashboard or intended page
  useEffect(() => {
    console.log("[AUTH_DEBUG] LoginPage: isLogged:", isLogged, "isLoading:", isLoading);
    if (isLogged && !isLoading) {
      console.log("[AUTH_DEBUG] LoginPage: User is logged in and not loading, REDIRECTING...");
      const redirectQuery = searchParams.get('redirect');
      const fromQuery = searchParams.get('from');
      const fromState = (location.state as any)?.from?.pathname;
      
      const from = redirectQuery || (fromQuery ? `/${fromQuery}` : (fromState || '/subastas-recientes'));
      console.log("[AUTH_DEBUG] LoginPage: Target path:", from);
      navigate(from || '/', { replace: true });
    }
  }, [isLogged, isLoading, navigate, location]);

  const handleGoogleLogin = async () => {
    if (isAuthenticating) return;
    console.log("[AUTH_DEBUG] click google");
    setIsAuthenticating(true);
    setAuthError('');

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error('Error logging in with popup:', e);
      if (isMounted.current) setIsAuthenticating(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthenticating) return;
    
    setAuthError('');
    setIsAuthenticating(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Error logging in with email:', error.code, error.message);
      if (!isMounted.current) return;
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setAuthError('Correo o contraseña incorrectos.');
      } else if (error.code === 'auth/invalid-email') {
        setAuthError('El formato del correo no es válido.');
      } else if (error.code === 'auth/network-request-failed') {
        setAuthError('Error de conexión. Revisa tu internet.');
      } else {
        setAuthError(error.message || 'Error al iniciar sesión.');
      }
      setIsAuthenticating(false);
    }
  };

  const handlePasswordReset = async () => {
    if (isResetting || resetSuccess) return;
    
    setAuthError('');
    setResetSuccess('');
    
    if (!email) {
      setAuthError('Introduce tu email');
      return;
    }
    
    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, email);
      if (!isMounted.current) return;
      setResetSuccess('Email enviado');
    } catch (error: any) {
      console.error('Error resetting password:', error.code, error.message);
      if (!isMounted.current) return;
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        setAuthError('Este email no está registrado');
      } else if (error.code === 'auth/invalid-email') {
        setAuthError('Email no válido');
      } else if (error.code === 'auth/too-many-requests') {
        setAuthError('Inténtalo más tarde');
      } else {
        setAuthError('Error al enviar el email.');
      }
    } finally {
      if (isMounted.current) {
        setIsResetting(false);
      }
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthenticating) return;
    
    setAuthError('');
    setIsAuthenticating(true);
    let createdUser: any = null;
    
    console.log("signup start");
    
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      createdUser = result.user;
      console.log("auth created");
      
      // Create user document in Firestore
      const userRef = doc(db, 'users', createdUser.uid);
      const userData = {
        id: createdUser.uid,
        email: createdUser.email || '',
        name: createdUser.email?.split('@')[0] || '', // Default name from email
        plan: 'free',
        analysisUsed: 0,
        favorites: [],
        alerts: [],
        createdAt: serverTimestamp(),
        lastAnalysisReset: serverTimestamp(),
        provider: 'email'
      };
      
      try {
        await setDoc(userRef, userData);
        console.log("firestore ok");
      } catch (firestoreError) {
        console.error('Error creating user profile in Firestore:', firestoreError);
        // Retry once
        try {
          await setDoc(userRef, userData);
          console.log("firestore ok (after retry)");
        } catch (retryError) {
          console.error('Retry failed for creating user profile:', retryError);
          // If it fails again, logout and show error
          await signOut(auth);
          if (isMounted.current) {
            setAuthError('Error al crear perfil. Inténtalo de nuevo.');
          }
          return;
        }
      }
      
      console.log("redirecting");
      // onAuthStateChanged in UserContext will handle the rest
    } catch (error: any) {
      console.error('Error signing up with email:', error.code, error.message);
      if (!isMounted.current) return;
      if (error.code === 'auth/email-already-in-use') {
        setAuthError('Este correo ya está registrado. Inicia sesión con Google.');
      } else if (error.code === 'auth/weak-password') {
        setAuthError('La contraseña debe tener al menos 6 caracteres.');
      } else if (error.code === 'auth/invalid-email') {
        setAuthError('El formato del correo no es válido.');
      } else if (error.code === 'auth/network-request-failed') {
        setAuthError('Error de conexión. Revisa tu internet.');
      } else {
        setAuthError(error.message || 'Error al crear la cuenta. Inténtalo de nuevo.');
      }
    } finally {
      console.log("signup end");
      if (isMounted.current) {
        setIsAuthenticating(false);
      }
    }
  };

  if (isLogged && isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-4" />
        <p className="text-slate-500 text-sm font-medium">Preparando tu cuenta...</p>
      </div>
    );
  }

  const getMessage = () => {
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
          <div className="flex flex-col items-center text-center mb-5">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2 flex items-center gap-1.5">
              <Shield size={12} /> 🔒 Acceso privado inversores
            </div>
            <h1 className="text-2xl font-serif font-bold text-slate-900 mb-1">
              Iniciar sesión
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              {getMessage()}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
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

            {!showEmailForm ? (
              <button
                onClick={() => setShowEmailForm(true)}
                className="w-full py-2 text-slate-500 font-medium hover:text-slate-700 transition-colors text-sm"
              >
                Usar otro correo
              </button>
            ) : (
              <div className="mt-2 pt-2 border-t border-slate-100">
                <div className="relative flex items-center justify-center mb-2">
                  <span className="bg-white px-2 text-[10px] text-slate-400 font-medium uppercase tracking-wider">o con email</span>
                </div>
                
                <form className="space-y-2" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Tu correo electrónico"
                      className="w-full px-3 h-9 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Contraseña"
                      className="w-full px-3 h-9 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                      required
                    />
                    <div className="flex flex-col items-end mt-1.5">
                      <button
                        type="button"
                        onClick={handlePasswordReset}
                        disabled={isResetting || !!resetSuccess}
                        className={`text-[11px] transition-colors flex items-center gap-1 ${
                          resetSuccess 
                            ? 'text-emerald-600 cursor-default' 
                            : isResetting
                              ? 'text-slate-400 cursor-not-allowed'
                              : 'text-slate-400 hover:text-slate-600 hover:underline'
                        }`}
                      >
                        {isResetting ? (
                          <>
                            <Loader2 size={10} className="animate-spin" />
                            <span>Enviando...</span>
                          </>
                        ) : resetSuccess ? (
                          <>
                            <CheckCircle size={10} />
                            <span>Email enviado</span>
                          </>
                        ) : (
                          "¿Olvidaste tu contraseña?"
                        )}
                      </button>
                      {resetSuccess && (
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          Revisa tu bandeja de entrada o spam
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {authError && (
                    <p className="text-xs text-red-500 text-center">{authError}</p>
                  )}
                  
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleEmailSignup}
                      disabled={isAuthenticating || !email || !password}
                      className="flex-1 h-9 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-all text-xs disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isAuthenticating ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Creando...</span>
                        </>
                      ) : (
                        "Crear cuenta"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleEmailLogin}
                      disabled={isAuthenticating || !email || !password}
                      className="flex-1 h-9 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-all text-xs disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isAuthenticating ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Iniciando...</span>
                        </>
                      ) : (
                        "Iniciar sesión"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="text-center space-y-1">
              <p className="text-[10px] text-slate-400 font-medium mt-1">
                Acceso en 1 clic · Sin tarjeta
              </p>
            </div>

            {/* Value Block */}
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
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
            <div className="text-center pt-3">
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
