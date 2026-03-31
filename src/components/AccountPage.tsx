import React, { useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { 
  User, 
  ShieldCheck, 
  TrendingUp, 
  History, 
  ArrowRight, 
  CheckCircle, 
  Zap, 
  Calendar,
  FileText,
  Star,
  Bell,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { motion } from 'motion/react';
import { db, auth } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { toast } from 'sonner';

const AccountPage: React.FC = () => {
  const { user, isLogged, plan, isLoading } = useUser();
  const navigate = useNavigate();
  const [history, setHistory] = React.useState<any[]>([]);
  const [alerts, setAlerts] = React.useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = React.useState(false);
  const [isLoadingAlerts, setIsLoadingAlerts] = React.useState(false);

  useEffect(() => {
    console.log("[AUTH_DEBUG] AccountPage: user:", user?.id || 'null', "isLoading:", isLoading);
    if (isLoading) {
      console.log("[AUTH_DEBUG] AccountPage: Still loading, skipping redirect check.");
      return;
    }
    if (!user) {
      console.log("[AUTH_DEBUG] AccountPage: No user found after loading, REDIRECTING TO LOGIN...");
      navigate(ROUTES.LOGIN);
    } else {
      console.log("[AUTH_DEBUG] AccountPage: User found, access granted.");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !db) return;
      
      setIsLoadingHistory(true);
      setIsLoadingAlerts(true);
      
      try {
        // Fetch History
        const historyRef = collection(db, 'users', user.id, 'viewHistory');
        const qHistory = query(historyRef, orderBy('viewedAt', 'desc'), limit(10));
        const historySnapshot = await getDocs(qHistory);
        setHistory(historySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch Alerts
        const alertsRef = collection(db, 'users', user.id, 'alerts');
        const qAlerts = query(alertsRef, orderBy('createdAt', 'desc'));
        const alertsSnapshot = await getDocs(qAlerts);
        setAlerts(alertsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching account data:", error);
      } finally {
        setIsLoadingHistory(false);
        setIsLoadingAlerts(false);
      }
    };

    if (isLogged && user) {
      fetchData();
    }
  }, [isLogged, user]);

  const handleDeleteAlert = async (alertId: string) => {
    if (!user || !db) return;
    
    try {
      await deleteDoc(doc(db, 'users', user.id, 'alerts', alertId));
      setAlerts(prev => prev.filter(a => a.id !== alertId));
      toast.success("Alerta eliminada correctamente");
    } catch (error) {
      console.error("Error deleting alert:", error);
      toast.error("Error al eliminar la alerta");
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const usage = user.analysisUsed || 0;
  const planLimit = plan === 'free' ? 1 : plan === 'basic' ? 3 : 10;
  const remaining = Math.max(0, planLimit - usage);
  
  const lastReset = user.lastAnalysisReset?.toDate ? user.lastAnalysisReset.toDate() : new Date(user.lastAnalysisReset || Date.now());
  const nextReset = new Date(lastReset);
  nextReset.setMonth(nextReset.getMonth() + 1);

  const getPlanFeatures = () => {
    if (plan === 'pro') {
      return [
        'Análisis cargas IA ilimitado',
        'Dossier PDF inversión',
        'Scoring oportunidad',
        'Riesgo jurídico ampliado',
        'Alertas avanzadas',
        '20% descuento asesorías',
        'Prioridad nuevas oportunidades'
      ];
    }
    if (plan === 'basic') {
      return [
        'Favoritos ilimitados',
        'Alertas personalizadas',
        'Calculadora avanzada',
        '5 análisis cargas / mes',
        'Notas personales',
        'Botón "Ir a BOE oficial"',
        'Datos Catastro básicos'
      ];
    }
    return [
      'Acceso fichas subastas',
      '5 favoritos',
      '1 alerta básica',
      '1 análisis cargas gratis',
      'Checklist inversor'
    ];
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Top Consumption Bar */}
      <div className="mb-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
            <Zap size={20} className="fill-brand-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Consumo del plan</p>
            <p className="text-sm font-bold text-slate-900">
              {plan === 'pro' ? 'Ilimitado' : `${usage}/${planLimit} análisis`}
            </p>
          </div>
        </div>
        
        <div className="flex-1 max-w-md">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Uso del plan {plan.toUpperCase()}</span>
            <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">
              {plan === 'pro' ? '100%' : (
                <Link to="/pro" className="hover:underline flex items-center gap-1">
                  {Math.min(100, Math.round((usage / planLimit) * 100))}% <ArrowRight size={10} />
                </Link>
              )}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: plan === 'pro' ? '100%' : `${Math.min(100, (usage / planLimit) * 100)}%` }}
              className={`h-full rounded-full ${usage >= planLimit && plan !== 'pro' ? 'bg-amber-500' : 'bg-brand-600'}`}
            />
          </div>
        </div>
      </div>

      <div className="mb-10">
        <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">Mi cuenta</h1>
        <p className="text-slate-500">Gestiona tu suscripción, consumo y actividad.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Profile & Consumption */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center text-brand-700 border border-brand-100">
                <User size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                <p className="text-slate-500 text-sm">{user.email}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  Usuario desde {new Date(user.createdAt?.toDate ? user.createdAt.toDate() : user.createdAt).toLocaleDateString('es-ES')}
                </div>
              </div>
            </div>

            {/* Consumption Block */}
            {plan !== 'pro' && (
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={18} className="text-brand-600" />
                    <h3 className="font-bold text-slate-900">Tus análisis este mes</h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    plan === 'basic' ? 'bg-amber-100 text-amber-700' : 
                    'bg-slate-200 text-slate-600'
                  }`}>
                    Plan {plan.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Usados</p>
                    <p className="text-2xl font-bold text-slate-900">{usage} de {planLimit}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Restantes</p>
                    <p className="text-2xl font-bold text-brand-600">{remaining}</p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Próximo reset</p>
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <Calendar size={14} className="text-slate-400" />
                      <span>{nextReset.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (usage / planLimit) * 100)}%` }}
                      className={`h-full rounded-full ${usage >= planLimit ? 'bg-amber-500' : 'bg-brand-600'}`}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 text-right">
                    {usage} de {planLimit} análisis utilizados este mes
                  </p>
                </div>
              </div>
            )}

            {/* No credits card */}
            {plan !== 'pro' && usage >= planLimit && (
              <div className="mt-6 bg-amber-50 border border-amber-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">No te quedan análisis este mes</h4>
                    <p className="text-xs text-slate-500">Mejora tu plan para obtener más análisis</p>
                  </div>
                </div>
                <Link 
                  to="/pro"
                  className="px-6 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  Ver planes
                </Link>
              </div>
            )}
          </div>

          {/* Alerts Block */}
          <div id="alerts" className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-2">
                <Bell size={20} className="text-brand-600" />
                <h3 className="font-bold text-slate-900 text-lg">Mis alertas activas</h3>
              </div>
              
              {plan !== 'pro' && (
                <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Uso de alertas</p>
                  <p className="text-sm font-bold text-slate-900">
                    {alerts.length} de {plan === 'free' ? 1 : 3} alertas usadas
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {isLoadingAlerts ? (
                <div className="space-y-3">
                  {[1, 2].map(i => (
                    <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : alerts.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {alerts.map((alert) => (
                    <div 
                      key={alert.id}
                      className="border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
                          <MapPin size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{alert.city} {alert.zone && `(${alert.zone})`}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded">
                              {alert.propertyType}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Creada el {alert.createdAt?.toDate ? alert.createdAt.toDate().toLocaleDateString('es-ES') : 'recientemente'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
                      >
                        Eliminar alerta
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
                    <Bell size={24} />
                  </div>
                  <p className="text-slate-400 text-sm">No tienes ninguna alerta configurada.</p>
                  <Link to={ROUTES.ALERTAS} className="text-brand-600 text-xs font-bold mt-2 inline-block hover:underline">
                    Configurar mi primera alerta &rarr;
                  </Link>
                </div>
              )}
            </div>

            {/* Alert CTA */}
            <div className="mt-8 pt-8 border-t border-slate-50">
              {plan !== 'pro' && alerts.length >= (plan === 'free' ? 1 : 3) ? (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle size={18} className="text-amber-600" />
                    <p className="text-xs font-bold text-slate-900">Límite de alertas alcanzado</p>
                  </div>
                  <Link to="/pro" className="text-xs font-bold text-brand-600 hover:underline">
                    Mejorar plan &rarr;
                  </Link>
                </div>
              ) : (
                <Link 
                  to={ROUTES.ALERTAS}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  Crear nueva alerta <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </div>

          {/* History Block */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <History size={20} className="text-slate-400" />
              <h3 className="font-bold text-slate-900 text-lg">Historial de subastas vistas</h3>
            </div>
            
            <div className="space-y-4">
              {isLoadingHistory ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : history.length > 0 ? (
                history.map((item) => (
                  <Link 
                    key={item.id}
                    to={`/subasta/${item.auctionId}`}
                    className="border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 line-clamp-1">{item.title}</p>
                        <p className="text-xs text-slate-500">
                          Visto el {item.viewedAt?.toDate ? item.viewedAt.toDate().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }) : 'recientemente'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-slate-300 group-hover:text-brand-600 transition-colors" />
                  </Link>
                ))
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
                    <History size={24} />
                  </div>
                  <p className="text-slate-400 text-sm">Aún no has visto ninguna subasta.</p>
                  <Link to="/subastas-recientes" className="text-brand-600 text-xs font-bold mt-2 inline-block hover:underline">
                    Explorar subastas &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Benefits & Upgrade */}
        <div className="space-y-8">
          {/* Benefits Block */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck size={20} className="text-emerald-500" />
              <h3 className="font-bold text-slate-900 text-lg">Beneficios {plan.toUpperCase()}</h3>
            </div>
            
            <ul className="space-y-4">
              {getPlanFeatures().map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-600">
                  <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-xs font-medium">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Upgrade Block */}
          {plan !== 'pro' && (
            <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Zap size={80} className="fill-white" />
              </div>
              
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Pásate a {plan === 'free' ? 'BASIC' : 'PRO'}</h3>
                <p className="text-slate-400 text-xs mb-6 leading-relaxed">
                  {plan === 'free' 
                    ? 'Desbloquea 5 análisis al mes, alertas personalizadas y favoritos ilimitados.' 
                    : 'Análisis ilimitados, dossiers PDF y scoring de oportunidad avanzado.'}
                </p>
                
                <Link 
                  to="/pro"
                  className="w-full py-3 px-6 rounded-xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-900/20"
                >
                  Mejorar plan <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-4">
            <Link to="/mis-guardados" className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <Star size={20} className="text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-slate-900">Guardados</p>
            </Link>
            <Link to="/alertas-subastas" className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <Bell size={20} className="text-brand-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-slate-900">Alertas</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
