import React, { useEffect, useState, useMemo, useContext } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Calculator, Gavel, TrendingUp, Search, ChevronRight, 
  MapPin, Home, DollarSign, AlertTriangle, CheckCircle, 
  Info, ArrowRight, FileText, Scale, ShieldCheck, AlertOctagon,
  Clock, Calendar, User, Twitter, Linkedin, Mail, MessageCircle,
  ExternalLink, AlertCircle, Lock, ArrowUpRight, Heart, Share2,
  Bell, StickyNote, X, Car, Train, Navigation, Shield, LineChart, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AUCTIONS } from '../data/auctions';
import { AUCTION_RESULTS } from '../data/auctionResults';
import { getFilteredAuctions, isAuctionFinished, getAuctionType, getProcedureType } from '../utils/auctionHelpers';
import { ROUTES } from '../constants/routes';
import { normalizePropertyType, normalizeCity, normalizeLocationLabel, normalizeProvince, formatAddress } from '../utils/auctionNormalizer';
import { trackConversion } from '../utils/tracking';
import { subscribeToMailerLite, sendAlertConfirmationEmail } from '../utils/mailerlite';
import FinishedAuctionBanner from './FinishedAuctionBanner';
import { ShareButtons } from './ShareButtons';
import ConversionBlock from './ConversionBlock';
import ConsultingCTA from './ConsultingCTA';
import RadarPremiumCTA from './RadarPremiumCTA';
import RelatedAuctions from './RelatedAuctions';
import LoadAnalysisBlock from './LoadAnalysisBlock';
import FullAnalysisModal from './FullAnalysisModal';
import SoftGateModal from './SoftGateModal';
import Header from './Header';
import Footer from './Footer';
import AuctionCalculator from './AuctionCalculator';
import { useUser, UserContext } from '../contexts/UserContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, getDoc, setDoc, serverTimestamp, getCountFromServer } from 'firebase/firestore';
import { getAuctionValuation, ValuationResult } from '../services/valuationService';
import PaymentModal from './PaymentModal';

interface LockedFeatureBlockProps {
  title?: string;
  description?: string;
  ctaText?: string;
  subtext?: string;
  onAction: () => void;
}

const LockedFeatureBlock: React.FC<LockedFeatureBlockProps> = ({
  title = "Contenido avanzado bloqueado",
  description = "Este análisis está disponible en planes BASIC y PRO",
  ctaText,
  subtext,
  onAction
}) => {
  const { isLogged, plan } = useUser();
  
  const finalCtaText = ctaText || (isLogged ? "Desbloquear con BASIC" : "Crear cuenta gratis");
  const finalSubtext = subtext || (isLogged ? "Disponible en BASIC y PRO" : "Accede a datos avanzados del activo");

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-white/60 backdrop-blur-md rounded-xl border border-slate-200/50 shadow-sm">
      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4 shadow-sm border border-white">
        <Lock className="w-5 h-5 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-500 mb-6 max-w-[240px]">
        {description}
      </p>
      <button
        onClick={onAction}
        className="w-full max-w-[220px] py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
      >
        {finalCtaText}
        <ArrowRight className="w-4 h-4" />
      </button>
      <p className="mt-3 text-xs text-slate-400 font-medium uppercase tracking-wider">
        {finalSubtext}
      </p>
    </div>
  );
};

const AuctionPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const cleanSlug = slug ? decodeURIComponent(slug).replace(/\/$/, '').toLowerCase() : '';
  const auction = cleanSlug ? AUCTIONS[cleanSlug] : null;
  const { user, isLogged, requireLogin, plan, trackAuctionView } = useUser();
  const hasAccess = isLogged && (plan === 'basic' || plan === 'pro');
  const userContext = useContext(UserContext);

  // Payment State
  const auctionId = auction?.boeId || auction?.slug || '';
  const [analysisPaid, setAnalysisPaid] = useState<boolean>(() => {
    if (!auctionId) return false;
    const paid = sessionStorage.getItem(`analysisPaid_${auctionId}`);
    const timestamp = sessionStorage.getItem(`analysisPaid_${auctionId}_time`);
    if (paid === 'true' && timestamp) {
      const hours = (Date.now() - parseInt(timestamp)) / (1000 * 60 * 60);
      if (hours < 24) return true;
      // Expired
      sessionStorage.removeItem(`analysisPaid_${auctionId}`);
      sessionStorage.removeItem(`analysisPaid_${auctionId}_time`);
    }
    return false;
  });
  const [cargasPaid, setCargasPaid] = useState<boolean>(() => {
    if (!auctionId) return false;
    const paid = sessionStorage.getItem(`cargasPaid_${auctionId}`);
    const timestamp = sessionStorage.getItem(`cargasPaid_${auctionId}_time`);
    if (paid === 'true' && timestamp) {
      const hours = (Date.now() - parseInt(timestamp)) / (1000 * 60 * 60);
      if (hours < 24) return true;
      // Expired
      sessionStorage.removeItem(`cargasPaid_${auctionId}`);
      sessionStorage.removeItem(`cargasPaid_${auctionId}_time`);
    }
    return false;
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState<'analysis' | 'cargas'>('analysis');

  // Calculator State
  const [valorMercado, setValorMercado] = useState<number | ''>('');
  const [deudas, setDeudas] = useState<number | ''>('');
  const [showCalculator, setShowCalculator] = useState(false);
  
  // Favorites State
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [favoritesCount, setFavoritesCount] = useState<number>(0);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showFullAnalysisModal, setShowFullAnalysisModal] = useState(false);
  const [softGateOrigin, setSoftGateOrigin] = useState<'favorite' | 'alert' | 'note' | 'limit_favorite' | 'limit_alert' | 'valuation' | 'boe' | 'save' | 'limit_analysis' | 'streetview' | 'catastro' | 'comparativa' | null>(null);
  const [showStreetView, setShowStreetView] = useState(false);
  const [showCargasUpload, setShowCargasUpload] = useState(false);
  const [hasActiveAlert, setHasActiveAlert] = useState(false);
  const [activeAlertId, setActiveAlertId] = useState<string | null>(null);
  const [alertsCount, setAlertsCount] = useState(0);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  
  // Notes State
  const [note, setNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  useEffect(() => {
    if (!auctionId) return;

    const params = new URLSearchParams(window.location.search);
    const analysisParam = params.get('analysis');
    const cargasParam = params.get('cargas');

    let shouldScrollToAnalysis = false;
    let shouldScrollToCargas = false;

    if (analysisParam === 'paid') {
      sessionStorage.setItem(`analysisPaid_${auctionId}`, 'true');
      sessionStorage.setItem(`analysisPaid_${auctionId}_time`, Date.now().toString());
      setAnalysisPaid(true);
      shouldScrollToAnalysis = true;
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (cargasParam === 'paid') {
      sessionStorage.setItem(`cargasPaid_${auctionId}`, 'true');
      sessionStorage.setItem(`cargasPaid_${auctionId}_time`, Date.now().toString());
      setCargasPaid(true);
      shouldScrollToCargas = true;
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (shouldScrollToAnalysis || analysisPaid) {
      setTimeout(() => {
        const element = document.getElementById('analisis-completo');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
        if (shouldScrollToAnalysis || analysisPaid) {
          setShowFullAnalysisModal(true);
        }
      }, 500);
    } else if (shouldScrollToCargas || cargasPaid) {
      setTimeout(() => {
        const element = document.getElementById('analisis-tecnico');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, [auctionId, analysisPaid, cargasPaid]);

  const approximateCoords = useMemo(() => {
    if (!auction?.lat || !auction?.lng) return null;
    if (plan !== 'free') return { lat: auction.lat, lng: auction.lng };
    
    // Fixed offset based on boeId to be stable
    const seed = auction.boeId?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
    const offsetLat = (Math.sin(seed) * 0.005);
    const offsetLng = (Math.cos(seed) * 0.005);
    
    return {
      lat: auction.lat + offsetLat,
      lng: auction.lng + offsetLng
    };
  }, [auction?.lat, auction?.lng, auction?.boeId, plan]);

  const keyDistances = useMemo(() => {
    if (!auction?.boeId) return null;
    
    // Stable pseudo-random distances based on boeId
    const seed = auction.boeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const getDist = (offset: number) => {
      const val = ((seed * offset) % 15) + 2; // 2 to 17 mins
      return Math.floor(val);
    };

    return [
      { label: 'Centro ciudad', time: getDist(1.5), icon: Navigation },
      { label: 'Estación tren/bus', time: getDist(2.3), icon: Train },
      { label: 'Zona comercial', time: getDist(3.7), icon: Home }
    ];
  }, [auction?.boeId]);

  // Valuation State
  const [valuationResult, setValuationResult] = useState<ValuationResult | null>(null);

  // Market Comparator State
  const [purchasePriceSlider, setPurchasePriceSlider] = useState<number>(0);
  const [isComparatorExpanded, setIsComparatorExpanded] = useState(false);
  const [marketScenario, setMarketScenario] = useState<'conservador' | 'medio' | 'optimista'>('medio');

  useEffect(() => {
    if (auction?.appraisalValue) {
      setPurchasePriceSlider(auction.appraisalValue * 0.7);
    } else if (valuationResult?.marketValue) {
      setPurchasePriceSlider(valuationResult.marketValue * 0.7);
    }
  }, [auction?.appraisalValue, valuationResult?.marketValue]);

  // Comparator calculations
  const compAppraisalValue = auction?.appraisalValue || 0;
  
  const baseMarketValue = valuationResult?.marketValue || 0;
  let compMarketValue = baseMarketValue;
  if (marketScenario === 'conservador') compMarketValue = baseMarketValue * 0.9;
  if (marketScenario === 'optimista') compMarketValue = baseMarketValue * 1.1;

  const compSurface = valuationResult?.calculations?.surface || auction?.surface || 0;
  const compMarketPricePerSqm = compSurface > 0 ? compMarketValue / compSurface : 0;
  
  const compSavings = compMarketValue - purchasePriceSlider;
  const isOverpriced = compSavings < 0;
  const compDiscountVsMarket = compMarketValue > 0 ? ((compMarketValue - purchasePriceSlider) / compMarketValue) * 100 : 0;
  const compOverpricePercent = compMarketValue > 0 ? ((purchasePriceSlider - compMarketValue) / compMarketValue) * 100 : 0;
  const compPricePerSqm = compSurface > 0 ? purchasePriceSlider / compSurface : 0;
  const compPercentOfAppraisal = compAppraisalValue > 0 ? (purchasePriceSlider / compAppraisalValue) * 100 : 0;

  const getCompBadgeData = (discount: number, isOverpriced: boolean) => {
    if (isOverpriced) return { text: 'Sobreprecio', color: 'text-red-700 bg-red-50 border-red-200' };
    if (discount >= 35) return { text: 'Alta oportunidad', color: 'text-emerald-700 bg-emerald-100 border-emerald-200' };
    if (discount >= 20) return { text: 'Buena oportunidad', color: 'text-blue-700 bg-blue-100 border-blue-200' };
    if (discount >= 10) return { text: 'Margen ajustado', color: 'text-amber-700 bg-amber-100 border-amber-200' };
    return { text: 'Descuento limitado', color: 'text-slate-600 bg-slate-100 border-slate-200' };
  };

  const compBadge = getCompBadgeData(compDiscountVsMarket, isOverpriced);
  const compBaseValueForSlider = compAppraisalValue > 0 ? compAppraisalValue : compMarketValue;
  const compSliderMin = compBaseValueForSlider * 0.1;
  const compSliderMax = compBaseValueForSlider * 1.5;

  // Automatically load or calculate valuation on page open
  useEffect(() => {
    const loadValuation = async () => {
      if (!auction?.boeId) return;
      try {
        // The API automatically checks the cache first.
        // If not cached, it runs the surface pipeline, saves it, and returns it.
        const result = await getAuctionValuation(auction);
        setValuationResult(result);
      } catch (e) {
        console.error('Error loading valuation:', e);
      }
    };
    loadValuation();
  }, [auction?.boeId]);

  // Handle noindex for valuation results from local fallbacks
  useEffect(() => {
    if (valuationResult && valuationResult.metadata.source === 'local_fallback') {
      const meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = 'noindex, nofollow';
      document.head.appendChild(meta);
      return () => {
        document.head.removeChild(meta);
      };
    }
  }, [valuationResult]);

  const calculatePotencial = () => {
    if (!valuationResult || !auction || !auction.appraisalValue) return 0;
    return ((valuationResult.marketValue - auction.appraisalValue) / auction.appraisalValue) * 100;
  };

  const getPotencialData = (potencial: number) => {
    if (potencial <= 5) return { text: `Potencial +${potencial.toFixed(0)}%`, color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' };
    
    let color = '';
    let bg = '';
    let border = '';
    
    if (potencial <= 15) { color = 'text-blue-600'; bg = 'bg-blue-50'; border = 'border-blue-100'; }
    else if (potencial <= 25) { color = 'text-emerald-600'; bg = 'bg-emerald-50'; border = 'border-emerald-100'; }
    else if (potencial <= 40) { color = 'text-emerald-700'; bg = 'bg-emerald-100'; border = 'border-emerald-200'; }
    else if (potencial <= 60) { color = 'text-amber-600'; bg = 'bg-amber-50'; border = 'border-amber-100'; }
    else { color = 'text-purple-600'; bg = 'bg-purple-50'; border = 'border-purple-100'; }
    
    return { text: `Potencial +${potencial.toFixed(0)}%`, color, bg, border };
  };

  const potencial = calculatePotencial();
  const potencialData = getPotencialData(potencial);

  const handleUnlockAnalysis = () => {
    setSoftGateOrigin('valuation');
  };

  const handleDownloadPDF = () => {
    toast.info('Generando PDF del informe...');
    window.print();
  };

  // Track view
  useEffect(() => {
    if (isLogged && auction && cleanSlug) {
      const propertyType = normalizePropertyType(auction.propertyType) || 'Propiedad';
      const cityName = normalizeCity(auction) || 'España';
      const title = `${propertyType} en ${cityName}`;
      trackAuctionView(cleanSlug, title);
    }
  }, [isLogged, auction, cleanSlug, trackAuctionView]);

  // Load note and check alerts from Firestore/localStorage
  useEffect(() => {
    const loadData = async () => {
      if (isLogged && user && db && cleanSlug) {
        try {
          // Load note
          const noteRef = doc(db, 'users', user.id, 'notes', cleanSlug);
          const noteSnap = await getDoc(noteRef);
          if (noteSnap.exists()) {
            setNote(noteSnap.data().content);
          }

          // Load alerts count from Firestore
          const alertsRef = collection(db, 'users', user.id, 'alerts');
          const snapshot = await getCountFromServer(query(alertsRef));
          setAlertsCount(snapshot.data().count);

          // Check if alert already exists for this city/type
          if (auction) {
            const city = normalizeCity(auction) || '';
            const type = normalizePropertyType(auction.propertyType) || 'Vivienda';
            const q = query(alertsRef, where('city', '==', city), where('propertyType', '==', type));
            const alertSnap = await getDocs(q);
            if (!alertSnap.empty) {
              setHasActiveAlert(true);
              setActiveAlertId(alertSnap.docs[0].id);
            } else {
              setHasActiveAlert(false);
              setActiveAlertId(null);
            }
          }
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      } else if (cleanSlug) {
        // Legacy/Guest behavior using localStorage
        const savedNote = localStorage.getItem(`note_${cleanSlug}`);
        if (savedNote) setNote(savedNote);

        if (auction) {
          const alertsUsage = JSON.parse(localStorage.getItem('alerts_usage') || '[]');
          setAlertsCount(alertsUsage.length);

          const city = normalizeCity(auction) || '';
          const type = normalizePropertyType(auction.propertyType) || 'Vivienda';
          const exists = alertsUsage.some((a: any) => a.city === city && a.type === type);
          setHasActiveAlert(exists);
        }
      }
    };

    loadData();
  }, [cleanSlug, isLogged, user, auction]);

  // Autosave note
  useEffect(() => {
    if (!cleanSlug || !isLogged) return;
    
    const timeoutId = setTimeout(() => {
      localStorage.setItem(`note_${cleanSlug}`, note);
      setIsSavingNote(false);
      if (note.trim().length > 0) {
        toast.success('Nota guardada', { duration: 2000 });
      }
    }, 1500);

    setIsSavingNote(true);
    return () => clearTimeout(timeoutId);
  }, [note, cleanSlug, isLogged]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    const footer = document.getElementById('main-footer');
    if (footer) {
      observer.observe(footer);
    }

    return () => {
      if (footer) {
        observer.unobserve(footer);
      }
    };
  }, []);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!user || !cleanSlug || !db) {
        setIsFavorite(false);
        setFavoriteId(null);
        setFavoritesCount(0);
        return;
      }

      try {
        const q = query(
          collection(db, 'favorites'),
          where('userId', '==', user.id),
          where('auctionId', '==', cleanSlug)
        );
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          setIsFavorite(true);
          setFavoriteId(querySnapshot.docs[0].id);
        } else {
          setIsFavorite(false);
          setFavoriteId(null);
        }

        if (plan === 'free') {
          const countQuery = query(collection(db, 'favorites'), where('userId', '==', user.id));
          const snapshot = await getCountFromServer(countQuery);
          setFavoritesCount(snapshot.data().count);
        }
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    checkFavoriteStatus();
  }, [user, cleanSlug]);

  const scrollToNotes = () => {
    if (!isLogged) {
      setSoftGateOrigin('note');
      return;
    }
    const notesElement = document.getElementById('user-notes');
    if (notesElement) {
      notesElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleToggleFavorite = async () => {
    if (!isLogged) {
      setSoftGateOrigin('save');
      return;
    }

    if (plan === 'free' && !isFavorite) {
      setSoftGateOrigin('save');
      return;
    }

    if (!user || !cleanSlug || isTogglingFavorite || !db || !auction) return;

    setIsTogglingFavorite(true);

    try {
      if (isFavorite && favoriteId) {
        // Remove from favorites
        await deleteDoc(doc(db, 'favorites', favoriteId));
        setIsFavorite(false);
        setFavoriteId(null);
        setFavoritesCount(prev => Math.max(0, prev - 1));
      } else {
        // Check limits for free users
        if (plan === 'free') {
          const countQuery = query(collection(db, 'favorites'), where('userId', '==', user.id));
          const snapshot = await getCountFromServer(countQuery);
          if (snapshot.data().count >= 3) {
            setShowPremiumModal(true);
            setIsTogglingFavorite(false);
            return;
          }
        }

        // Add to favorites
        const docRef = await addDoc(collection(db, 'favorites'), {
          userId: user.id,
          auctionId: cleanSlug,
          createdAt: serverTimestamp()
        });
        setIsFavorite(true);
        setFavoriteId(docRef.id);
        setFavoritesCount(prev => prev + 1);
        toast.success('Guardado en favoritos', { duration: 2000 });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      // Revert optimistic update if failed (though we didn't do optimistic here to be safe)
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleDeleteAlert = async () => {
    if (!user || !db || !activeAlertId) return;
    
    try {
      await deleteDoc(doc(db, 'users', user.id, 'alerts', activeAlertId));
      setHasActiveAlert(false);
      setActiveAlertId(null);
      setAlertsCount(prev => Math.max(0, prev - 1));
      toast.success("Alerta eliminada correctamente");
    } catch (error) {
      console.error("Error deleting alert:", error);
      toast.error("Error al eliminar la alerta");
    }
  };

  const handleCreateAlert = async () => {
    if (!isLogged) {
      setSoftGateOrigin('alert');
      return;
    }

    // Check limits
    const isLimitReached = (plan === 'free' && alertsCount >= 1) || (plan === 'basic' && alertsCount >= 3);
    
    if (isLimitReached) {
      setSoftGateOrigin('limit_alert');
      return;
    }

    if (!auction || !user || !db) return;

    const city = normalizeCity(auction) || '';
    const type = normalizePropertyType(auction.propertyType) || 'Vivienda';

    try {
      // 1. Save to Firestore
      const alertsRef = collection(db, 'users', user.id, 'alerts');
      const docRef = await addDoc(alertsRef, {
        city,
        zone: '',
        propertyType: type,
        minPrice: 0,
        maxPrice: 10000000,
        createdAt: serverTimestamp(),
        active: true
      });

      // 2. Sync with MailerLite (Legacy/Sync)
      await subscribeToMailerLite({
        email: user.email,
        source: 'alertas_ficha',
        fields: {
          alerta_provincia: city,
          alerta_tipo: type,
          plan_status: plan === 'free' ? 'free' : 'pro'
        }
      });

      // 3. Send confirmation email (Transactional)
      sendAlertConfirmationEmail(user.email, city);

      setAlertsCount(prev => prev + 1);
      setHasActiveAlert(true);
      setActiveAlertId(docRef.id);
      toast.success(`Alerta creada para ${type} en ${city}`);
    } catch (error) {
      console.error("Error creating alert:", error);
      toast.error("Error al crear la alerta");
    }
  };

  if (!auction) return <Navigate to={ROUTES.HOME} replace />;

  const isFinished = auction.status === 'closed' || isAuctionFinished(auction.auctionDate);
  const isSuspended = auction.status === 'suspended';
  const isUpcoming = auction.status === 'upcoming';
  const isActive = auction.status === 'active' || (!isFinished && !isSuspended && !isUpcoming);

  const cityName = normalizeCity(auction) || 'España';
  const provinceName = normalizeProvince(auction.province || cityName);
  const propertyType = normalizePropertyType(auction.propertyType);
  const locationLabel = normalizeLocationLabel(auction);

  const opportunityRatio = useMemo(() => {
    if (auction.appraisalValue && auction.claimedDebt !== undefined && auction.claimedDebt !== null) {
      const ratio = 1 - (auction.claimedDebt / auction.appraisalValue);
      if (auction.claimedDebt === 0 || ratio > 0.85) {
        return null;
      }
      return ratio;
    }
    return null;
  }, [auction]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (auction) {
      setValorMercado(auction.appraisalValue || '');
      setDeudas(auction.claimedDebt || '');
      
      const propertyType = normalizePropertyType(auction.propertyType);
      const cityName = normalizeCity(auction) || 'España';
      const discount = auction.appraisalValue && auction.claimedDebt 
        ? Math.round((1 - (auction.claimedDebt / auction.appraisalValue)) * 100) 
        : 0;
      
      const addressPart = formatAddress(auction.address);
      const streetPart = addressPart ? ` (${addressPart})` : '';
      
      let discountPart = '';
      if (auction.claimedDebt === 0) {
        discountPart = ' (Sin cargas declaradas)';
      } else if (discount > 85) {
        discountPart = ' (Oportunidad a analizar)';
      } else if (discount > 0) {
        discountPart = ` con ${discount}% de descuento`;
      }
      
      // Dynamic Title by Status
      const isFinishedStatus = auction.status === 'closed' || isAuctionFinished(auction.auctionDate);
      const isSuspendedStatus = auction.status === 'suspended';
      
      let title = '';
      if (isFinishedStatus) {
        const hasResult = !!(auction.auctionResultStatus || auction.finalPrice);
        const suffix = hasResult ? 'Resultado subasta BOE' : 'Subasta BOE finalizada';
        title = `${propertyType} subastado en ${cityName} | ${suffix}`;
      } else if (isSuspendedStatus) {
        title = `Subasta suspendida en ${cityName} | ${propertyType} en análisis BOE`;
      } else {
        // Active or Upcoming
        title = `${propertyType} en subasta judicial en ${cityName} | Análisis BOE y cargas`;
      }
      
      document.title = title;

      // Meta Description - Dynamic by Status
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        const isFinishedStatus = auction.status === 'closed' || isAuctionFinished(auction.auctionDate);
        const isSuspendedStatus = auction.status === 'suspended';
        
        let desc = '';
        const appraisalStr = auction.appraisalValue ? `${auction.appraisalValue.toLocaleString('es-ES')}€` : 'consultar';

        if (isFinishedStatus) {
          desc = `Subasta BOE finalizada en ${cityName}. ${propertyType} adjudicado. Consulta cargas, riesgos y resultado de esta subasta judicial.`;
        } else if (isSuspendedStatus) {
          desc = `Subasta judicial suspendida en ${cityName}. ${propertyType}. Analizamos cargas, riesgos legales y posibles escenarios del expediente.`;
        } else {
          // Active or Upcoming
          desc = `Subasta judicial de ${propertyType} en ${cityName}. Tasación: ${appraisalStr}. Análisis técnico del expediente BOE: revisión de cargas, deudas y riesgos.`;
        }
        
        metaDesc.setAttribute('content', desc);
      }

      // Canonical Link
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', `https://activosoffmarket.es/subasta/${cleanSlug}`);

      // Social SEO - Open Graph
      const ogTitle = `${propertyType} en subasta en ${cityName} | Análisis y cargas`;
      const ogDesc = `Análisis técnico de subasta en ${cityName}. Tasación ${auction.appraisalValue?.toLocaleString('es-ES')}€. Deuda ${auction.claimedDebt?.toLocaleString('es-ES')}€. Riesgos y estrategia.`;
      const ogImage = auction.imageUrl || 'https://activosoffmarket.es/og-image-subastas.jpg';
      const ogUrl = `https://activosoffmarket.es/subasta/${cleanSlug}`;

      const setMetaTag = (property: string, content: string, attr: 'property' | 'name' = 'property') => {
        let tag = document.querySelector(`meta[${attr}="${property}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute(attr, property);
          document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
      };

      setMetaTag('og:title', ogTitle);
      setMetaTag('og:description', ogDesc);
      setMetaTag('og:type', 'article');
      setMetaTag('og:url', ogUrl);
      setMetaTag('og:image', ogImage);

      // Social SEO - Twitter
      setMetaTag('twitter:card', 'summary_large_image', 'name');
      setMetaTag('twitter:title', ogTitle, 'name');
      setMetaTag('twitter:description', ogDesc, 'name');
      setMetaTag('twitter:image', ogImage, 'name');
    }
  }, [cleanSlug, auction]);

  const analysisInsights = useMemo(() => {
    if (!auction) return null;

    let discount = 0;
    if (auction.appraisalValue && auction.claimedDebt !== undefined && auction.claimedDebt !== null) {
      discount = Math.round((1 - (auction.claimedDebt / auction.appraisalValue)) * 100);
      if (auction.claimedDebt === 0 || discount > 85) {
        discount = 0;
      }
    }
    const isJudicial = auction.boeId?.startsWith('SUB-JA');
    
    // Interpretation Logic
    let interpretation = "";
    const debtToAppraisalRatio = auction.appraisalValue && auction.claimedDebt ? (auction.claimedDebt / auction.appraisalValue) * 100 : 0;
    const currentDiscount = auction.appraisalValue && auction.claimedDebt ? Math.round((1 - (auction.claimedDebt / auction.appraisalValue)) * 100) : 0;
    
    if (auction.appraisalValue && auction.claimedDebt) {
      if (currentDiscount > 50) {
        interpretation = `Este expediente destaca por un margen excepcional del ${currentDiscount}%, lo que lo posiciona como una oportunidad de alto impacto. La carga reclamada representa solo el ${debtToAppraisalRatio.toFixed(1)}% de la tasación oficial, generando un colchón de seguridad extraordinario para absorber cualquier contingencia procesal o de posesión.`;
      } else if (currentDiscount > 25) {
        interpretation = `La oportunidad en este activo reside en un equilibrio sólido entre riesgo y rentabilidad. Con un margen del ${currentDiscount}%, el inversor cuenta con margen suficiente para gestionar el lanzamiento y posibles deudas de comunidad o IBI sin comprometer el objetivo de rentabilidad neta de dos dígitos.`;
      } else {
        interpretation = `Se trata de un activo con margen ajustado (${currentDiscount}%), donde la clave del éxito reside en la ubicación estratégica o la tipología del inmueble. Es un expediente ideal para compradores finalistas o inversores patrimonialistas que priorizan la seguridad del activo sobre el descuento agresivo.`;
      }
    } else {
      interpretation = "La ausencia de desglose de deuda en el anuncio público exige un enfoque de máxima cautela. La oportunidad en este caso no es evidente por los números, sino que reside en la posible baja concurrencia de postores debido a la opacidad inicial, lo que requiere una investigación directa en el juzgado.";
    }

    // Investor Profile Logic
    let investorProfile = "";
    const notHabitual = isJudicial 
      ? "No es un activo apto para perfiles que dependan de financiación bancaria convencional o necesiten posesión inmediata." 
      : "No es recomendable para compradores que busquen la inmediatez de una compraventa tradicional.";
    
    if (discount > 45) {
      investorProfile = `Perfil ideal: Inversores especialistas en 'flipping' o gestión de activos complejos que buscan maximizar el retorno sobre capital. ${notHabitual}`;
    } else if (discount > 25) {
      investorProfile = `Perfil ideal: Inversores patrimonialistas (Buy-to-Rent) que buscan optimizar el flujo de caja mediante un coste de adquisición reducido. ${notHabitual}`;
    } else {
      investorProfile = `Perfil ideal: Compradores finalistas o inversores conservadores que buscan activos en ubicaciones consolidadas con un descuento moderado. ${notHabitual}`;
    }

    // Market Context Logic (Rule-based)
    const auctionsInCity = Object.values(AUCTIONS).filter(a => normalizeCity(a) === cityName).length;
    let marketContext = "";
    
    if (auctionsInCity > 5) {
      marketContext = `El mercado de subastas en ${cityName} presenta actualmente una alta actividad con ${auctionsInCity} expedientes activos. Esta competencia exige una especialización mayor en la fase de análisis para detectar el valor real frente a otros postores profesionales.`;
    } else {
      marketContext = `Detectamos un volumen bajo de subastas en ${cityName} (${auctionsInCity} activas), lo que convierte a este activo en una pieza de interés por su escasez en el canal de adjudicaciones públicas de la zona.`;
    }

    if (auction.appraisalValue) {
      marketContext += ` La tasación de ${auction.appraisalValue.toLocaleString()}€ se sitúa en rangos de mercado para ${propertyType.toLowerCase()}, validando la base de cálculo para el estudio de rentabilidad.`;
    }

    // Procedural Context Logic (Rule-based)
    let proceduralContext = "";
    const typeLabel = propertyType.toLowerCase();
    const isAEAT = auction.boeId?.startsWith('SUB-AT');

    if (isJudicial) {
      proceduralContext = `Este procedimiento judicial en ${cityName} se rige por la LEC, garantizando un marco jurídico estable. El éxito depende de la correcta interpretación de la certificación de cargas y la gestión del decreto de adjudicación.`;
    } else if (isAEAT) {
      proceduralContext = `Subasta administrativa vía AEAT en ${cityName}. Destaca por su agilidad procesal, aunque exige una revisión exhaustiva de cargas anteriores, ya que la responsabilidad de comprobación recae íntegramente en el postor.`;
    } else {
      proceduralContext = `Expediente administrativo en ${cityName}. Requiere validación técnica de plazos y revisión profunda del expediente para asegurar la liquidación correcta de deudas subsistentes.`;
    }

    // Appraisal warning logic integrated
    if (!auction.appraisalValue) {
      proceduralContext += ` Dada la falta de tasación oficial en el anuncio de ${cityName}, se aconseja realizar una investigación de campo para evitar el riesgo de sobrepuja en este ${typeLabel}.`;
    }

    // Soft FOMO Logic (Rule-based)
    const fomo = {
      interpretation: discount > 40 ? "Oportunidad con margen superior a la media en la zona." : "Activo con estructura de deuda clara para inversores.",
      market: auctionsInCity < 3 ? `Escasez de activos similares en ${cityName}.` : `Activo estratégico en mercado activo de ${cityName}.`,
      preCta: "Interés profesional previsible por ubicación y tipología.",
      timing: "Fase crítica de análisis antes del cierre de pujas."
    };

    // Summary Labels for the Dark Block
    const str = (auction.boeId || '') + cityName + propertyType + (auction.claimedDebt || 0);
    const seed = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // 1. Margen Estimado
    let margenLabels: string[] = [];
    if (opportunityRatio === null) {
      margenLabels = ['Análisis pendiente'];
    } else if (opportunityRatio > 0.4) {
      margenLabels = ['Alto potencial', 'Margen muy amplio', 'Descuento relevante', 'Oportunidad clara', 'Margen excepcional', 'Entrada favorable', 'Potencial elevado', 'Gran margen', 'Muy atractivo', 'Colchón amplio'];
    } else if (opportunityRatio > 0.25) {
      margenLabels = ['Buen margen', 'Potencial interesante', 'Margen atractivo', 'Entrada sólida', 'Oportunidad interesante', 'Descuento atractivo', 'Potencial claro', 'Margen favorable', 'Posición ventajosa'];
    } else if (opportunityRatio > 0.15) {
      margenLabels = ['Margen moderado', 'Potencial ajustado', 'Entrada selectiva', 'Margen limitado', 'Oportunidad medida', 'Descuento moderado', 'Potencial medio'];
    } else {
      margenLabels = ['Margen reducido', 'Potencial limitado', 'Entrada ajustada', 'Oportunidad táctica', 'Margen estrecho'];
    }
    const margenLabel = margenLabels[seed % margenLabels.length];

    // 2. Punto de Atención
    let atencionLabels: string[] = [];
    const hasDebt = !!auction.claimedDebt;
    const highDebt = auction.claimedDebt && auction.appraisalValue && (auction.claimedDebt > auction.appraisalValue * 0.4);
    
    // Logic for "Escenario limpio" vs "Cargas/Contexto"
    if (!isJudicial && hasDebt && !highDebt && opportunityRatio && opportunityRatio > 0.2) {
      atencionLabels = ['Expediente claro', 'Sin cargas visibles', 'Riesgo limitado', 'Situación favorable', 'Perfil sencillo', 'Documentación clara'];
    } else {
      atencionLabels = ['Cargas preferentes', 'Riesgo registral', 'Revisar expediente', 'Posibles cargas', 'Análisis necesario', 'Atención jurídica', 'Revisar documentación', 'Expediente complejo', 'Riesgo potencial', 'Ver cargas', 'Atención registral', 'Revisión recomendada', 'Posible afección', 'Cargas a validar', 'Riesgo oculto', 'Precaución jurídica', 'Verificación previa', 'Comprobación necesaria'];
    }
    const atencionLabel = atencionLabels[seed % atencionLabels.length];

    // 3. Lectura General
    const lecturaLabels = ['Inversión interesante', 'Oportunidad inversor', 'Perfil inversor', 'Potencial flip', 'Estrategia flexible', 'Activo atractivo', 'Oportunidad selectiva', 'Inversión táctica', 'Perfil conservador', 'Inversión moderada', 'Potencial revalorización', 'Entrada estratégica', 'Oportunidad mercado', 'Inversión viable', 'Activo interesante', 'Estrategia inversión', 'Perfil oportunista', 'Oportunidad puntual', 'Potencial alquiler', 'Potencial rotación', 'Inversión analizable', 'Estrategia abierta', 'Oportunidad técnica', 'Activo analizable'];
    const lecturaLabel = lecturaLabels[seed % lecturaLabels.length];

    const summaryLabels = { margenLabel, atencionLabel, lecturaLabel };

    return { marketContext, investorProfile, interpretation, proceduralContext, fomo, summaryLabels };
  }, [auction, opportunityRatio, cityName, provinceName, propertyType]);

  const isCityCapital = cityName !== 'España' && cityName.toLowerCase() === provinceName.toLowerCase();

  const getOpportunityMessage = (ratio: number | null) => {
    if (ratio === null) return { text: "Análisis requerido", color: "bg-amber-100 text-amber-800 border-amber-200" };
    if (ratio >= 0.35 && isCityCapital) return { text: "Alta oportunidad", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
    if (ratio >= 0.2) return { text: "Oportunidad interesante", color: "bg-blue-100 text-blue-800 border-blue-200" };
    return { text: "Margen ajustado", color: "bg-slate-100 text-slate-800 border-slate-200" };
  };

  const oppMessage = getOpportunityMessage(opportunityRatio);

  const getUrgencyBadge = (date: string | undefined) => {
    if (!date) return null;
    const now = new Date();
    const auctionDate = new Date(date);
    const diffTime = auctionDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return null; // Finished
    if (diffDays <= 3) return { text: `Cierra en ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`, color: "bg-red-500 text-white border-red-600" };
    if (diffDays <= 7) return { text: "Cierre próximo", color: "bg-orange-500 text-white border-orange-600" };
    return { text: "Cierre estándar", color: "bg-slate-200 text-slate-700 border-slate-300" };
  };

  const urgencyBadge = getUrgencyBadge(auction.auctionDate);

  const statusMessage = useMemo(() => {
    const now = new Date();
    const auctionDate = auction.auctionDate ? new Date(auction.auctionDate) : null;
    const diffTime = auctionDate ? auctionDate.getTime() - now.getTime() : null;
    const diffDays = diffTime !== null ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : null;
    const formattedDate = auction.auctionDate ? new Date(auction.auctionDate).toLocaleDateString('es-ES') : '---';

    if (isFinished) {
      return {
        title: "⏱️ Demasiado tarde",
        description: (
          <>
            Esta subasta fue adjudicada el {formattedDate}. Oportunidades similares aparecen cada semana.{" "}
            <Link 
              to="/subastas-recientes" className="text-slate-900 font-bold hover:underline ml-1"
            >
              → Ver subastas activas
            </Link>
          </>
        ),
        icon: Clock,
        bgColor: "bg-slate-50",
        borderColor: "border-slate-200",
        iconBgColor: "bg-slate-100",
        iconColor: "text-slate-400",
        titleColor: "text-slate-600",
        descColor: "text-slate-500",
        opacity: "opacity-80"
      };
    }

    if (isSuspended) {
      return {
        title: "⚠️ Procedimiento pausado",
        description: "La subasta ha sido suspendida. Puede reactivarse en cualquier momento. Activa alertas para no perderla.",
        icon: AlertCircle,
        bgColor: "bg-amber-50/50",
        borderColor: "border-amber-100",
        iconBgColor: "bg-amber-100",
        iconColor: "text-amber-600",
        titleColor: "text-amber-900",
        descColor: "text-amber-800/70"
      };
    }

    if (diffDays !== null && diffDays >= 0 && diffDays <= 3) {
      return {
        title: "🔥 Cierre inminente",
        description: "Últimas horas para participar. Revisa cargas y estrategia antes del cierre.",
        icon: Clock,
        bgColor: "bg-red-50/50",
        borderColor: "border-red-100",
        iconBgColor: "bg-red-100",
        iconColor: "text-red-600",
        titleColor: "text-red-900",
        descColor: "text-red-800/70"
      };
    }

    if (diffDays !== null && diffDays >= 0 && diffDays <= 7) {
      return {
        title: "⏳ Cierre próximo",
        description: `Finaliza en pocos días. Asegura tu participación antes del ${formattedDate}.`,
        icon: Clock,
        bgColor: "bg-orange-50/50",
        borderColor: "border-orange-100",
        iconBgColor: "bg-orange-100",
        iconColor: "text-orange-600",
        titleColor: "text-orange-900",
        descColor: "text-orange-800/70"
      };
    }

    if (opportunityRatio && opportunityRatio > 0.35) {
      return {
        title: "💎 Subasta Muy interesante",
        description: "Descuento significativo frente a tasación. Revisa cargas antes de pujar.",
        icon: TrendingUp,
        bgColor: "bg-brand-50/50",
        borderColor: "border-brand-100",
        iconBgColor: "bg-brand-100",
        iconColor: "text-brand-600",
        titleColor: "text-brand-900",
        descColor: "text-brand-800/70"
      };
    }

    if (isUpcoming) {
      return {
        title: "🕓 Apertura próxima",
        description: "Las pujas aún no han comenzado. Tiempo ideal para analizar sin presión.",
        icon: Calendar,
        bgColor: "bg-blue-50/50",
        borderColor: "border-blue-100",
        iconBgColor: "bg-blue-100",
        iconColor: "text-blue-600",
        titleColor: "text-blue-900",
        descColor: "text-blue-800/70"
      };
    }

    // Default: ACTIVA
    return {
      title: "📊 Subasta en curso",
      description: "Periodo de pujas abierto. Analiza bien antes de participar.",
      icon: TrendingUp,
      bgColor: "bg-emerald-50/50",
      borderColor: "border-emerald-100",
      iconBgColor: "bg-emerald-100",
      iconColor: "text-emerald-600",
      titleColor: "text-emerald-900",
      descColor: "text-emerald-800/70"
    };
  }, [auction, isFinished, isSuspended, isUpcoming, opportunityRatio]);

  const jsonLd = useMemo(() => {
    if (!auction || !cleanSlug) return null;

    const propertyType = normalizePropertyType(auction.propertyType);
    const cityName = normalizeCity(auction) || 'España';
    const discount = auction.appraisalValue && auction.claimedDebt 
      ? Math.round((1 - (auction.claimedDebt / auction.appraisalValue)) * 100) 
      : 0;
    
    const addressPart = formatAddress(auction.address);
    const streetPart = addressPart ? ` (${addressPart})` : '';
    
    let discountPart = '';
    if (auction.claimedDebt === 0) {
      discountPart = ' (Sin cargas declaradas)';
    } else if (discount > 85) {
      discountPart = ' (Oportunidad a analizar)';
    } else if (discount > 0) {
      discountPart = ` con ${discount}% de descuento`;
    }
    
    const title = `${propertyType} en subasta en ${cityName}${streetPart}${discountPart}`;
    const finalTitle = title.length > 70 ? title.substring(0, 67) + '...' : title;

    const description = analysisInsights 
      ? `${analysisInsights.marketContext} ${analysisInsights.investorProfile}`.substring(0, 160) + '...'
      : `Subasta de ${propertyType.toLowerCase()} en ${cityName}, ${provinceName}.`;

    const imageUrl = auction.imageUrl;
    const price = auction.claimedDebt ?? auction.appraisalValue ?? auction.valorSubasta ?? 0;
    const url = window.location.href;
    
    const now = new Date();
    let publishedDate = auction.publishedAt ? new Date(auction.publishedAt) : now;
    if (publishedDate > now) publishedDate = now;

    // Calculate dateModified for SEO freshness
    const dateCandidates = [
      auction.lastCheckedAt,
      auction.resultCheckedAt,
      auction.publishedAt
    ].filter(Boolean) as string[];

    const dateModified = dateCandidates.length > 0 
      ? new Date(Math.max(...dateCandidates.map(d => new Date(d).getTime()))).toISOString()
      : publishedDate.toISOString();

    const availability = isFinished ? "https://schema.org/OutOfStock" : "https://schema.org/InStock";

    const realEstateListing: any = {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      "name": finalTitle,
      "description": description,
      "url": url,
      "datePosted": publishedDate.toISOString().split('T')[0],
      "dateModified": dateModified,
      "category": propertyType,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": cityName,
        "addressRegion": provinceName,
        "addressCountry": "ES"
      }
    };

    if (imageUrl) {
      realEstateListing["image"] = imageUrl;
    }

    if (auction.auctionDate) {
      realEstateListing["availabilityEnds"] = new Date(auction.auctionDate).toISOString().split('T')[0];
    }

    const product: any = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": finalTitle,
      "description": description,
      "dateModified": dateModified,
      "brand": {
        "@type": "Brand",
        "name": "Activos Off-Market"
      },
      "offers": {
        "@type": "Offer",
        "price": price,
        "priceCurrency": "EUR",
        "availability": availability,
        "url": url
      }
    };

    if (imageUrl) {
      product["image"] = imageUrl;
    }

    if (auction.auctionDate) {
      product.offers["validThrough"] = new Date(auction.auctionDate).toISOString().split('T')[0];
    }

    const faqPage: any = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": []
    };

    const isSuspended = auction.status === 'suspended';

    if (isFinished) {
      faqPage.mainEntity = [
        {
          "@type": "Question",
          "name": "¿A qué precio se adjudicó esta subasta?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Cuando el BOE publica el resultado mostramos la adjudicación real."
          }
        },
        {
          "@type": "Question",
          "name": "¿Se puede comprar después de una subasta finalizada?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "En algunos casos sí, mediante cesión de remate o negociación posterior."
          }
        },
        {
          "@type": "Question",
          "name": "¿Esta subasta ya no es una oportunidad?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Aunque finalizada, sirve como referencia real de mercado."
          }
        }
      ];
    } else if (isSuspended) {
      faqPage.mainEntity = [
        {
          "@type": "Question",
          "name": "¿Por qué se suspende una subasta judicial?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Puede deberse a pago de deuda, recurso o error procesal."
          }
        },
        {
          "@type": "Question",
          "name": "¿Puede reactivarse una subasta suspendida?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Sí, muchas subastas BOE se reactivan posteriormente."
          }
        },
        {
          "@type": "Question",
          "name": "¿Qué significa suspensión para el inversor?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Indica incertidumbre legal que requiere análisis del expediente."
          }
        }
      ];
    } else {
      // Active or Upcoming
      faqPage.mainEntity = [
        {
          "@type": "Question",
          "name": "¿Esta subasta judicial tiene cargas?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Analizamos el expediente BOE para detectar cargas, deudas y riesgos antes de pujar."
          }
        },
        {
          "@type": "Question",
          "name": "¿Se puede visitar el inmueble antes de la subasta?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Depende del procedimiento. Muchas subastas BOE no permiten visita previa."
          }
        },
        {
          "@type": "Question",
          "name": "¿Qué riesgos tiene esta subasta?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Ocupación, cargas ocultas o deuda superior. El análisis revisa estos puntos."
          }
        }
      ];
    }

    const breadcrumbList: any = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Inicio",
          "item": "https://activosoffmarket.es"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": `Subastas ${provinceName}`,
          "item": `https://activosoffmarket.es/subastas/${provinceName.toLowerCase()}`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": `Subastas ${cityName}`,
          "item": `https://activosoffmarket.es/subastas/${cityName.toLowerCase()}`
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": `${propertyType} en ${cityName}`,
          "item": url
        }
      ]
    };

    return [realEstateListing, product, faqPage, breadcrumbList];
  }, [auction, slug, cityName, provinceName, isFinished, analysisInsights]);

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-600 pb-20">
      {jsonLd && (
        <>
          <script type="application/ld+json">
            {JSON.stringify(jsonLd)}
          </script>
          {jsonLd[0].image && <link rel="preload" as="image" href={jsonLd[0].image} />}
        </>
      )}
      
      <Header />

      <main className="max-w-4xl mx-auto px-4 md:px-6 pt-2 md:pt-4">
        {/* Breadcrumbs - TOP LEVEL */}
        <nav className="flex items-center text-[9px] md:text-[10px] text-slate-400 mb-3 md:mb-4 font-bold uppercase tracking-widest" aria-label="Breadcrumb">
          <Link 
            to={ROUTES.HOME} className="hover:text-brand-600 transition-colors"
          >
            Inicio
          </Link>
          <ChevronRight size={8} className="mx-1.5 md:mx-2" />
          <Link 
            to={`/subastas/${provinceName.toLowerCase()}`} className="hover:text-brand-600 transition-colors"
          >
            Subastas en {provinceName}
          </Link>
          <ChevronRight size={8} className="mx-1.5 md:mx-2" />
          <span className="text-slate-300">Ficha</span>
        </nav>

        {/* HEADER SECTION */}
        <section className="mb-4 md:mb-6">
          <div className="flex flex-wrap gap-2 mb-3 items-center">
            {isActive && <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[8px] md:text-[9px] font-bold uppercase tracking-widest border border-emerald-200/60 hover:bg-emerald-100 transition-all cursor-default shadow-sm shadow-emerald-100/50">Activa</span>}
            {urgencyBadge && urgencyBadge.text.includes('Cierre') && <span className="px-2.5 py-1 rounded-md bg-orange-50 text-orange-700 text-[8px] md:text-[9px] font-bold uppercase tracking-widest border border-orange-200/60 flex items-center gap-1.5 hover:bg-orange-100 transition-all cursor-default shadow-sm shadow-orange-100/50"><Clock size={10} /> {urgencyBadge.text}</span>}
            {isFinished && <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[8px] md:text-[9px] font-bold uppercase tracking-widest border border-slate-200/60 hover:bg-slate-200 transition-all cursor-default shadow-sm shadow-slate-100/50">Finalizada</span>}
            {opportunityRatio && opportunityRatio > 0.35 && <span className="px-2.5 py-1 rounded-md bg-brand-50 text-brand-700 text-[8px] md:text-[9px] font-bold uppercase tracking-widest border border-brand-200/60 hover:bg-brand-100 transition-all cursor-default shadow-sm shadow-brand-100/50">Alta oportunidad</span>}
            
            {plan === 'pro' && (
              <span className="ml-auto px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 text-[8px] md:text-[9px] font-bold uppercase tracking-widest border border-amber-200/60 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Plan PRO activo
              </span>
            )}
            {plan === 'basic' && (
              <span className="ml-auto px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 text-[8px] md:text-[9px] font-bold uppercase tracking-widest border border-blue-200/60 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Plan BASIC activo
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2 mb-4 md:mb-8">
            <h1 className="text-[clamp(1.25rem,5vw,2.75rem)] font-serif font-bold text-slate-900 tracking-tighter leading-tight">
              {propertyType} en subasta en {cityName}
            </h1>
            {hasActiveAlert && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 text-[10px] font-bold uppercase tracking-wider border border-brand-200 w-fit">
                <Bell size={10} className="fill-brand-700" />
                Alerta activa para esta zona
              </div>
            )}
          </div>

          {/* Dynamic SEO Intro */}
          <p className="text-slate-600 text-xs md:text-base leading-relaxed mb-4 md:mb-6 text-justify">
            {opportunityRatio && opportunityRatio > 0.4 
              ? `Esta subasta en ${cityName} presenta un margen excepcional del ${Math.round(opportunityRatio * 100)}% frente a la tasación oficial. Una oportunidad estratégica tanto para inversores profesionales como para familias y pequeños ahorradores que buscan su primera vivienda con un ahorro sustancial.`
              : `Oportunidad de adquisición de ${propertyType.toLowerCase()} en ${cityName} mediante procedimiento ${getAuctionType(auction.boeId).toLowerCase()}. Un activo ideal para particulares que desean capitalizar su ahorro o inversores que buscan rentabilidad con garantías jurídicas.`}
            {" "}El análisis de cargas es el paso crítico para asegurar el éxito de la operación.
          </p>
          
          {/* Address and Share Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-10 pb-4 md:pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3 text-lg md:text-2xl text-slate-900 font-bold group cursor-default">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-brand-50 flex items-center justify-center shrink-0 group-hover:bg-brand-100 transition-colors">
                <MapPin size={20} className="text-brand-600 md:hidden" />
                <MapPin size={24} className="text-brand-600 hidden md:block group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="group-hover:text-brand-700 transition-colors leading-tight">
                {formatAddress(auction.address) || locationLabel}
              </span>
            </div>

            <div className="flex items-center gap-1 md:gap-2 shrink-0">
              {(() => {
                const isBlocked = !isLogged || (plan === 'free' && !isFavorite);
                return (
                  <button 
                    onClick={handleToggleFavorite}
                    disabled={isTogglingFavorite}
                    className={`p-2 rounded-full transition-all duration-300 flex items-center gap-1.5 ${
                      isFavorite 
                        ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                        : isBlocked
                          ? 'text-slate-400 bg-slate-50 hover:bg-slate-100'
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                    }`}
                    title={isFavorite ? "Quitar de guardados" : isBlocked ? "Mejora tu plan para guardar" : "Guardar subasta"}
                  >
                    <div className="relative">
                      <Heart size={20} className={isFavorite ? 'fill-red-500' : ''} />
                      {isBlocked && !isFavorite && (
                        <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                          <Lock size={8} className="text-slate-400" />
                        </div>
                      )}
                    </div>
                    {isLogged && plan === 'free' && (
                      <span className={`text-[10px] font-bold tabular-nums opacity-60`}>
                        {favoritesCount}/3
                      </span>
                    )}
                  </button>
                );
              })()}

              {/* Alert Toggle */}
              {(() => {
                const isLimitReached = (plan === 'free' && alertsCount >= 1) || (plan === 'basic' && alertsCount >= 3);
                const limit = plan === 'free' ? 1 : plan === 'basic' ? 3 : null;
                const tooltip = hasActiveAlert 
                  ? "Eliminar alerta" 
                  : isLimitReached 
                    ? "Límite alcanzado" 
                    : `Crear alerta de esta zona (${limit} disponible en Plan ${plan.toUpperCase()})`;
                
                return (
                  <div className="flex flex-col items-center">
                    <button 
                      onClick={hasActiveAlert ? handleDeleteAlert : handleCreateAlert}
                      className={`p-2 rounded-full transition-all relative flex items-center gap-1.5 ${
                        hasActiveAlert 
                          ? 'text-brand-600 bg-brand-50 hover:bg-brand-100 shadow-sm shadow-brand-100' 
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                      }`}
                      title={tooltip}
                    >
                      <div className="relative">
                        <Bell size={20} className={hasActiveAlert ? 'fill-brand-600' : ''} />
                        {!hasActiveAlert && isLimitReached && (
                          <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                            <Lock size={8} className="text-slate-400" />
                          </div>
                        )}
                      </div>
                      {isLogged && limit && (
                        <span className={`text-[10px] font-bold tabular-nums ${isLimitReached && !hasActiveAlert ? 'text-amber-600' : 'opacity-60'}`}>
                          {alertsCount}/{limit}
                        </span>
                      )}
                    </button>
                    
                    {isLogged && (
                      <div className="mt-1 flex flex-col items-center">
                        {plan === 'free' && <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter whitespace-nowrap">1 alerta disp.</span>}
                        {plan === 'basic' && <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter whitespace-nowrap">3 alertas sim.</span>}
                        {plan === 'pro' && (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="px-1 py-0 rounded bg-brand-50 text-brand-600 text-[6px] font-bold uppercase tracking-tighter border border-brand-100">PRO activo</span>
                            <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter whitespace-nowrap">Ilimitadas</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              <button 
                onClick={scrollToNotes}
                className={`p-2 rounded-full transition-all relative ${
                  note.trim().length > 0 
                    ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
                title={note.trim().length > 0 ? "Ver tu nota privada" : "Añadir nota privada"}
              >
                <StickyNote size={20} />
                {note.trim().length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 border-2 border-white rounded-full" />
                )}
              </button>
              
              <ShareButtons 
                title={document.title} 
                variant="minimal"
                province={cityName}
                origin="ficha"
                label=""
              />
            </div>
          </div>
        </section>

        {/* DYNAMIC AUCTION STATUS BLOCK - TOP PRIORITY */}
        <section className="mb-3 md:mb-5">
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-2 md:p-3 flex items-center gap-3 shadow-sm">
            <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-white text-amber-600 flex items-center justify-center shrink-0 shadow-sm border border-amber-100">
              <statusMessage.icon size={16} className="md:hidden" />
              <statusMessage.icon size={20} className="hidden md:block" />
            </div>
            <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
              <h3 className="text-xs md:text-sm font-bold text-slate-900 whitespace-nowrap">
                {statusMessage.title}
              </h3>
              <div className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
              <p className="text-slate-600 text-[10px] md:text-xs truncate">
                {statusMessage.description}
              </p>
            </div>
          </div>
        </section>

        {/* MAIN ASSET DATA BLOCK - PREMIUM STYLE */}
        <motion.section 
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-[20px] md:rounded-[24px] border border-slate-200 shadow-sm overflow-hidden mb-6 md:mb-8 group"
        >
          {/* Dark Header */}
          <div className="bg-[#151921] px-4 md:px-6 py-3 md:py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 group-hover:text-white/60 transition-colors">
                <Scale size={14} className="md:hidden" />
                <Scale size={16} className="hidden md:block" />
              </div>
              <div>
                <p className="text-[7px] md:text-[8px] font-bold text-white/30 uppercase tracking-widest mb-0.5">Expediente</p>
                <div className="flex items-center gap-3">
                  <p className="text-[10px] md:text-xs font-bold text-white/90">{auction.boeId}</p>
                  <div className="w-px h-3 bg-white/10" />
                  <a 
                    href={(!user || plan === 'free') ? '#' : (auction.boeUrl || `https://subastas.boe.es/detalle_subasta.php?idSub=${auction.boeId}`)} 
                    target={(!user || plan === 'free') ? undefined : "_blank"} 
                    rel={(!user || plan === 'free') ? undefined : "noopener noreferrer"}
                    onClick={(e) => {
                      if (!user || plan === 'free') {
                        e.preventDefault();
                        setSoftGateOrigin('boe');
                      }
                    }}
                    className={`text-[9px] md:text-[10px] transition-colors flex items-center gap-1.5 font-bold group/link ${(!user || plan === 'free') ? 'text-slate-400 cursor-pointer hover:text-brand-400' : 'text-brand-400 hover:text-brand-300'}`}
                  >
                    BOE {(!user || plan === 'free') ? <Lock size={8} /> : <ExternalLink size={8} className="group-hover/link:translate-x-0.5 transition-transform" />}
                  </a>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 md:gap-6">
              <button 
                onClick={handleToggleFavorite}
                disabled={isTogglingFavorite}
                className={`flex items-center gap-1.5 transition-colors ${
                  isFavorite ? 'text-red-400' : 'text-white/30 hover:text-white/60'
                }`}
              >
                <div className="relative">
                  <Heart size={14} fill={isFavorite ? "currentColor" : "none"} />
                  {(!isLogged || (plan === 'free' && !isFavorite)) && (
                    <div className="absolute -top-1 -right-1 bg-slate-900 rounded-full p-0.5">
                      <Lock size={6} className="text-white/60" />
                    </div>
                  )}
                </div>
                <span className="text-[8px] font-bold uppercase tracking-widest">
                  {isFavorite ? 'Guardada' : 'Guardar'}
                </span>
              </button>
              <div className="text-right">
                <p className="text-[7px] md:text-[8px] font-bold text-white/30 uppercase tracking-widest mb-0.5">Estado</p>
                <div className="flex items-center gap-1.5 justify-end">
                  <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : isSuspended ? 'bg-amber-500' : 'bg-slate-500'}`} />
                  <p className="text-[10px] md:text-xs font-bold text-white/90">
                    {isSuspended ? 'Pausada' : isUpcoming ? 'Próxima' : isFinished ? 'Finalizada' : 'Activa'}
                  </p>
                </div>
              </div>
              <div className="text-right border-l border-white/10 pl-4 md:pl-6">
                <p className="text-[7px] md:text-[8px] font-bold text-white/30 uppercase tracking-widest mb-0.5">Tipo</p>
                <p className="text-[10px] md:text-xs font-bold text-white/90">{getAuctionType(auction.boeId)}</p>
              </div>
            </div>
          </div>

          {/* White Lower Card */}
          <div className="p-5 md:py-6 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-center">
            <div className="md:col-span-3 space-y-3 md:space-y-4">
              <div className="space-y-1">
                <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">Activo</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                    <Home size={16} className="md:hidden" />
                    <Home size={18} className="hidden md:block" />
                  </div>
                  <p className="text-lg md:text-xl font-serif font-bold text-slate-900">{propertyType}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">Ubicación</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                    <MapPin size={16} className="md:hidden" />
                    <MapPin size={18} className="hidden md:block" />
                  </div>
                  <p className="text-sm md:text-base font-bold text-slate-700 leading-snug">{locationLabel}</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-6 border-t md:border-t-0 md:border-l border-slate-100 pt-5 md:pt-0 md:pl-8 flex items-center justify-between gap-4">
              <div className="flex flex-col justify-center gap-y-3 md:gap-y-4">
                <div className="space-y-0.5">
                  <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tasación</p>
                  <p className="text-xl md:text-3xl font-bold text-slate-900 tracking-tight">
                    {auction.appraisalValue ? auction.appraisalValue.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}) : '---'}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">Deuda</p>
                  <p className="text-xl md:text-3xl font-bold text-slate-600 tracking-tight">
                    {auction.claimedDebt ? auction.claimedDebt.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}) : '---'}
                  </p>
                </div>
              </div>
              
              {opportunityRatio !== null && (
                <div className="flex flex-col items-end justify-center">
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Margen Teórico</p>
                  <p className="text-3xl md:text-5xl font-bold text-emerald-600 tracking-tighter leading-none">
                    {Math.round(opportunityRatio * 100)}%
                  </p>
                </div>
              )}
            </div>

            <div className="md:col-span-3 bg-slate-50/80 rounded-2xl p-5 md:p-6 border border-slate-100 text-center space-y-2 md:space-y-3 group-hover:bg-white transition-colors">
              <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">Cierre</p>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-brand-500 transition-colors">
                  <Calendar size={20} className="md:hidden" />
                  <Calendar size={22} className="hidden md:block" />
                </div>
                <div>
                  <p className="text-lg md:text-xl font-bold text-slate-900">
                    {auction.auctionDate ? new Date(auction.auctionDate).toLocaleDateString('es-ES') : 'Pendiente'}
                  </p>
                  <p className="text-[7px] md:text-[8px] font-bold text-slate-400 uppercase tracking-widest">Fecha límite BOE</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* VISUAL SUMMARY - COMPACT DYNAMIC BLOCK */}
        <section className="bg-slate-50 rounded-xl px-3 md:px-6 py-2.5 md:py-4 mb-4 md:mb-6 shadow-sm border border-slate-200 overflow-hidden">
          {/* Mobile View: High Conversion Compact Row */}
          <div className="flex md:hidden items-center justify-between gap-2">
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                  <TrendingUp size={14} />
                </div>
                <span className="text-[10px] font-bold text-slate-700 whitespace-nowrap">{analysisInsights?.summaryLabels.margenLabel}</span>
              </div>
              <div className="w-px h-4 bg-slate-200 shrink-0" />
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100">
                  <AlertTriangle size={14} />
                </div>
                <span className="text-[10px] font-bold text-slate-700 whitespace-nowrap">{analysisInsights?.summaryLabels.atencionLabel}</span>
              </div>
              <div className="w-px h-4 bg-slate-200 shrink-0" />
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                  <Search size={14} />
                </div>
                <span className="text-[10px] font-bold text-slate-700 whitespace-nowrap">{analysisInsights?.summaryLabels.lecturaLabel}</span>
              </div>
            </div>
            <a 
              href="#analisis-tecnico" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('analisis-tecnico')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-brand-600 shrink-0 shadow-sm"
            >
              <ArrowUpRight size={14} />
            </a>
          </div>

          {/* Desktop View: Original Layout */}
          <div className="hidden md:flex flex-nowrap items-center justify-between gap-x-6 md:gap-x-8 whitespace-nowrap overflow-x-auto no-scrollbar pb-1 md:pb-0">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100">
                <TrendingUp size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Margen Teórico</span>
                <span className="text-slate-900 text-xs md:text-[14px] font-bold tracking-tight">{analysisInsights?.summaryLabels.margenLabel}</span>
              </div>
            </div>
            
            <div className="w-px h-8 md:h-10 bg-slate-200 shrink-0" />

            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0 border border-amber-100">
                <AlertTriangle size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Atención</span>
                <span className="text-slate-900 text-xs md:text-[14px] font-bold tracking-tight">{analysisInsights?.summaryLabels.atencionLabel}</span>
              </div>
            </div>

            <div className="w-px h-8 md:h-10 bg-slate-200 shrink-0" />

            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100">
                <Search size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Lectura</span>
                <span className="text-slate-900 text-xs md:text-[14px] font-bold tracking-tight">{analysisInsights?.summaryLabels.lecturaLabel}</span>
              </div>
            </div>
          </div>
        </section>

        {/* DATOS CATASTRALES BLOCK - COMPACT */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 md:p-5 mb-4 md:mb-6">
          <div className="flex items-center justify-between gap-3 mb-3 md:mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                <Search size={13} />
              </div>
              <h3 className="font-bold text-slate-900 text-xs md:text-base">Datos catastrales</h3>
            </div>
            <p className="text-[9px] md:text-[10px] text-slate-400 font-medium hidden sm:block">Información técnica de la Sede Electrónica del Catastro</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Superficie estimada</p>
              <p className={`text-sm font-bold text-slate-900 ${plan === 'free' ? 'blur-[4px] select-none' : ''}`}>
                {auction.surface ? `${auction.surface} m²` : (
                  <span className="flex items-center gap-1 text-slate-400 font-medium italic">
                    <Info size={10} /> Pendiente
                  </span>
                )}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Año construcción</p>
              <p className={`text-sm font-bold text-slate-900 ${plan === 'free' ? 'blur-[4px] select-none' : ''}`}>
                {auction.yearBuilt || '1995'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Referencia catastral</p>
              <p className={`text-sm font-mono font-bold text-slate-900 ${plan === 'free' ? 'blur-[6px] select-none' : ''}`}>
                {auction.refCat || (
                  <span className="flex items-center gap-1 text-slate-400 font-medium italic">
                    <Info size={10} /> Consultar BOE
                  </span>
                )}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Confianza datos</p>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${plan === 'free' ? 'bg-slate-300' : 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]'}`} />
                <p className={`text-sm font-bold text-slate-900 ${plan === 'free' ? 'blur-[4px] select-none' : ''}`}>
                  {auction.cadastreConfidence || 'ALTA'}
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* Entorno del inmueble BLOCK */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-4 md:mb-6">
          <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                <MapPin size={16} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm md:text-base">Entorno del inmueble</h3>
                <p className="text-[10px] text-slate-500 font-medium">Ubicación aproximada y entorno del activo</p>
              </div>
            </div>
          </div>

          <div className="relative min-h-[140px] md:min-h-[200px] h-[200px] md:h-[280px] group">
            {/* Street View Preview - Using a street view embed with fallback logic */}
            <div className="absolute inset-0 bg-slate-100">
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  approximateCoords 
                    ? `${approximateCoords.lat},${approximateCoords.lng}` 
                    : (auction?.address ? `${auction.address}, ${auction.city}` : (auction?.city || 'España'))
                )}&layer=c${approximateCoords ? `&cbll=${approximateCoords.lat},${approximateCoords.lng}` : ''}&output=embed`}
                className={`w-full h-full ${plan === 'free' ? 'blur-md grayscale opacity-50' : ''}`}
                allowFullScreen
              ></iframe>
            </div>

            {/* Overlay for FREE/BASIC users */}
            {plan !== 'pro' && (
              <div className="absolute inset-0 z-40 flex items-center justify-center p-6 bg-slate-900/10 backdrop-blur-[2px]">
                <button 
                  onClick={() => setSoftGateOrigin('streetview')}
                  className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-bold shadow-2xl border border-slate-200 flex flex-col items-center gap-1 hover:scale-105 transition-transform"
                >
                  <div className="flex items-center gap-2">
                    <Lock size={16} className="text-brand-600" />
                    <span>Ver entorno real del inmueble</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                    {plan === 'free' ? 'Disponible en BASIC y PRO' : 'Consume 1 crédito'}
                  </span>
                </button>
              </div>
            )}

            {/* Street View Button - Visible for PRO */}
            {plan === 'pro' && (
              <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-1.5">
                <button
                  onClick={() => setShowStreetView(true)}
                  className="bg-white hover:bg-slate-50 text-slate-900 font-bold py-2 px-4 rounded-xl transition-all shadow-xl border border-slate-200 flex items-center gap-2 text-xs md:text-sm group/map"
                >
                  <div className="w-6 h-6 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 group-hover/map:bg-brand-500 group-hover/map:text-white transition-colors">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 opacity-80" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                  </div>
                  Abrir Street View
                </button>
              </div>
            )}
          </div>

          {/* Location Precision & External Link - COMPACT ROW */}
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[11px] md:text-xs text-slate-500 font-medium overflow-hidden">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                auction.lat && auction.lng ? 'bg-emerald-100 text-emerald-600' : 
                auction.address && auction.city ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'
              }`}>
                {auction.lat && auction.lng ? <CheckCircle size={10} /> : <Info size={10} />}
              </div>
              <span className="truncate">
                {auction.city} · {provinceName} · {auction.lat && auction.lng ? 'Ubicación exacta' : 'Referencia aproximada'}
              </span>
            </div>
            
            {plan !== 'pro' ? (
              <button 
                onClick={() => setSoftGateOrigin('streetview')}
                className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white border border-slate-200 rounded-lg text-slate-700 text-[10px] md:text-[11px] font-bold hover:bg-slate-50 transition-colors shadow-sm shrink-0"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 opacity-80 text-brand-600" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                Google Maps
              </button>
            ) : (
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  approximateCoords 
                    ? `${approximateCoords.lat},${approximateCoords.lng}` 
                    : (auction?.address ? `${auction.address}, ${auction.city}` : (auction?.city || 'España'))
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white border border-slate-200 rounded-lg text-slate-700 text-[10px] md:text-[11px] font-bold hover:bg-slate-50 transition-colors shadow-sm shrink-0"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 opacity-80 text-brand-600" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                Google Maps
              </a>
            )}
          </div>
        </section>

        {/* KEY DISTANCES BLOCK */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6 md:mb-8">
          <div className="p-3 md:p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                <Car size={14} />
              </div>
              <h3 className="font-bold text-slate-900 text-xs md:text-sm">Distancias clave</h3>
            </div>
          </div>

          <div className="p-3 md:p-4">
            <div className="flex flex-row flex-wrap items-center gap-x-6 gap-y-3">
              {keyDistances?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 shrink-0">
                  <item.icon size={14} className="text-slate-400" />
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
                    <span className="text-xs font-black text-slate-900">{item.time} min</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INTERACTIVE MARKET COMPARATOR BLOCK */}
        <section className="mb-6 md:mb-10">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 md:p-8 shadow-sm relative overflow-hidden">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center shadow-sm border border-violet-200">
                  <TrendingUp size={16} />
                </div>
                <h3 className="text-lg md:text-xl font-serif font-bold text-slate-900">Comparativa de mercado</h3>
              </div>
              <div className={`self-start md:self-auto px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                compDiscountVsMarket >= 30 ? 'bg-emerald-100 text-emerald-700' :
                compDiscountVsMarket >= 15 ? 'bg-green-100 text-green-700' :
                compDiscountVsMarket >= 0 ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                {compDiscountVsMarket >= 30 ? 'Alta oportunidad' :
                 compDiscountVsMarket >= 15 ? 'Buena oportunidad' :
                 compDiscountVsMarket >= 0 ? 'Margen ajustado' :
                 'Sobreprecio'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-1 relative">
                <span className="text-[10px] md:text-xs uppercase tracking-widest text-slate-400 font-bold block mb-1">Precio mercado actual</span>
                
                <div 
                  className={`flex flex-col ${plan !== 'pro' ? 'blur-sm select-none cursor-pointer' : ''}`}
                  onClick={() => plan !== 'pro' && setSoftGateOrigin('comparativa')}
                >
                  <p className="text-xl md:text-2xl font-bold text-slate-900 leading-none">
                    {compMarketValue > 0 ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(compMarketValue) : '---'}
                  </p>
                  {compMarketPricePerSqm > 0 && (
                    <span className="text-base font-semibold text-slate-900 mt-0.5">
                      {new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(compMarketPricePerSqm)} €/m²
                    </span>
                  )}
                </div>

                <div className="pt-3 overflow-x-auto no-scrollbar">
                  <span className="text-[10px] text-slate-500 font-medium block mb-1.5">Escenario mercado</span>
                  <div className="inline-flex bg-slate-100 rounded p-0.5 shadow-inner">
                    <button
                      onClick={() => setMarketScenario('conservador')}
                      className={`px-2 py-1 text-[10px] font-semibold rounded-sm transition-colors whitespace-nowrap ${marketScenario === 'conservador' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Conservador
                    </button>
                    <button
                      onClick={() => setMarketScenario('medio')}
                      className={`px-2 py-1 text-[10px] font-semibold rounded-sm transition-colors whitespace-nowrap ${marketScenario === 'medio' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Medio
                    </button>
                    <button
                      onClick={() => setMarketScenario('optimista')}
                      className={`px-2 py-1 text-[10px] font-semibold rounded-sm transition-colors whitespace-nowrap ${marketScenario === 'optimista' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Optimista
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Basado en datos de Idealista</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] md:text-xs uppercase tracking-widest text-slate-400 font-bold">Valor tasación BOE</span>
                <p className="text-xl md:text-2xl font-bold text-slate-600">
                  {compAppraisalValue > 0 ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(compAppraisalValue) : '---'}
                </p>
              </div>
            </div>

            {/* Slider Section */}
            <div className="mb-6">
              <div className="flex justify-between items-end mb-3">
                <label className="text-xs md:text-sm font-bold text-slate-700">Precio estimado de compra</label>
                <div className="text-right">
                  <span className="text-xl md:text-2xl font-bold text-brand-600 block leading-none">
                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(purchasePriceSlider)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {compPercentOfAppraisal.toFixed(1)}% sobre tasación
                  </span>
                </div>
              </div>
              
              <input 
                type="range" 
                min={compSliderMin} 
                max={compSliderMax} 
                step={1000}
                value={purchasePriceSlider}
                onChange={(e) => setPurchasePriceSlider(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <p className="text-xs text-slate-400 text-center mt-3">
                Simula tu puja y descubre el ahorro potencial
              </p>
            </div>

            {/* Expandable Section */}
            <AnimatePresence>
              {!isComparatorExpanded ? (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6"
                >
                  <div className="flex flex-col items-center relative z-20">
                    {plan === 'free' && (
                      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mb-4">
                        <span className="text-[10px] text-slate-500 font-medium">🔒 Datos de mercado verificados</span>
                        <span className="text-[10px] text-slate-500 font-medium">🔒 Ahorro estimado</span>
                        <span className="text-[10px] text-slate-500 font-medium">🔒 Superficie confirmada</span>
                      </div>
                    )}
                    <button 
                      onClick={() => {
                        if (plan === 'pro') {
                          setIsComparatorExpanded(true);
                        } else {
                          setSoftGateOrigin('catastro');
                        }
                      }}
                      className="w-full md:w-auto px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      {plan === 'pro' ? <Search size={14} /> : <Lock size={14} />}
                      Verificar m² con Catastro
                    </button>
                    <p className="text-xs text-slate-500 text-center mt-2">
                      Calcula superficie real y ahorro potencial antes de pujar
                    </p>
                  </div>

                  {plan === 'free' && (
                    <div 
                      className="mt-6 pt-6 border-t border-slate-200 overflow-hidden relative cursor-pointer group"
                      onClick={() => setSoftGateOrigin('catastro')}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/80 to-slate-50 z-10 flex items-end justify-center pb-4">
                        <div className="flex flex-col items-center bg-white/90 px-5 py-3 rounded-2xl shadow-sm backdrop-blur-sm border border-slate-100 transition-transform group-hover:scale-105">
                          <span className="text-sm font-bold text-slate-900 mb-0.5">Desbloquea análisis completo</span>
                          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Disponible en BASIC y PRO</span>
                        </div>
                      </div>
                      <div className="blur-[2px] opacity-40 select-none pointer-events-none">
                        <div className="flex flex-col items-center text-center mb-6">
                          <span className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">Superficie estimada</span>
                          <span className="text-2xl font-bold text-slate-900">{auction.propertyType === 'Vivienda' ? '120' : '---'} m²</span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-8 pt-8 border-t border-slate-200 overflow-hidden"
                >
                  <div className="flex flex-col items-center text-center mb-8">
                    <span className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                      {isOverpriced ? 'Sobreprecio vs mercado' : 'Ahorro vs mercado'}
                    </span>
                    <span className={`text-4xl md:text-5xl font-bold tracking-tighter leading-none mb-3 ${compSavings > 0 ? 'text-emerald-600' : compSavings < 0 ? 'text-red-600' : 'text-amber-500'}`}>
                      {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0, signDisplay: 'always' }).format(isOverpriced ? Math.abs(compSavings) : compSavings)}
                    </span>
                    <span className="text-sm font-medium text-slate-600 mb-4">
                      <strong className={`font-bold ${compSavings > 0 ? 'text-emerald-600' : compSavings < 0 ? 'text-red-600' : 'text-amber-500'}`}>
                        {isOverpriced ? compOverpricePercent.toFixed(1) : compDiscountVsMarket.toFixed(1)}%
                      </strong> {isOverpriced ? 'por encima del valor de mercado' : 'por debajo del valor de mercado'}
                    </span>
                    <div className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${compBadge.color}`}>
                      {compBadge.text}
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="mb-8 max-w-md mx-auto">
                    <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      <span>{isOverpriced ? 'Valor Mercado' : 'Tu compra'}</span>
                      <span>{isOverpriced ? 'Tu compra' : 'Valor Mercado'}</span>
                    </div>
                    <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden flex">
                      {isOverpriced ? (
                        <>
                          <div 
                            className="h-full bg-slate-400 transition-all duration-300" 
                            style={{ width: `${(compMarketValue / purchasePriceSlider) * 100}%` }}
                          />
                          <div 
                            className="h-full bg-red-400 transition-all duration-300" 
                            style={{ width: `${((purchasePriceSlider - compMarketValue) / purchasePriceSlider) * 100}%` }}
                          />
                        </>
                      ) : (
                        <>
                          <div 
                            className="h-full bg-brand-500 transition-all duration-300" 
                            style={{ width: `${(purchasePriceSlider / compMarketValue) * 100}%` }}
                          />
                          <div 
                            className="h-full bg-emerald-400 transition-all duration-300" 
                            style={{ width: `${((compMarketValue - purchasePriceSlider) / compMarketValue) * 100}%` }}
                          />
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-100 max-w-md mx-auto">
                    <div className="text-center">
                      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-1">Superficie verificada</span>
                      <span className="text-sm font-bold text-slate-900">{compSurface} m²</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-1">Precio estimado</span>
                      <span className="text-sm font-bold text-slate-900">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(compPricePerSqm)}/m²</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col items-center justify-center gap-2">
                    <span className="text-[9px] text-slate-400 font-medium">
                      Fuente: Ministerio de Vivienda · {auction?.city || 'Localidad'} · Datos basados en Idealista
                    </span>
                    <button 
                      onClick={() => setIsComparatorExpanded(false)}
                      className="text-[10px] text-brand-600 font-bold uppercase tracking-widest hover:underline mt-2"
                    >
                      Ocultar análisis
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <div id="servicios-analisis" className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Card 1: Análisis de cargas */}
            <div className="bg-white border-2 border-slate-900/20 rounded-3xl p-6 md:p-8 shadow-md flex flex-col h-full hover:shadow-lg transition-all order-last md:order-none relative z-10">
              {showCargasUpload && cargasPaid ? (
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-serif font-bold text-slate-900">Análisis de cargas</h3>
                    <button 
                      onClick={() => setShowCargasUpload(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                    >
                      Volver
                    </button>
                  </div>
                  <div className="flex-1">
                    <UserContext.Provider value={userContext ? { ...userContext, plan: 'pro', user: userContext.user ? { ...userContext.user, analysisUsed: 0 } : null } : undefined}>
                      <LoadAnalysisBlock 
                        boeId={auction.boeId || ''} 
                        boeUrl={auction.boeUrl}
                        isIntegrated={true} 
                        initialStep="upload"
                        onShowSoftGate={() => {}}
                      />
                    </UserContext.Provider>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-6 mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4 text-slate-400" />
                      <h3 className="text-2xl font-serif font-bold text-slate-900">Análisis de cargas</h3>
                    </div>
                    <p className="text-slate-600 text-sm font-medium">La revisión legal antes de pujar</p>
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <div className="mb-6">
                      <div className="inline-block px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded uppercase tracking-wider mb-2">
                        REVISIÓN LEGAL
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-slate-900">
                          {plan === 'free' ? '2,99€' : 'Incluido'}
                        </span>
                        {plan !== 'free' && (
                          <span className="ml-2 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full border border-emerald-100">
                            Incluido en tu plan
                          </span>
                        )}
                        {plan !== 'free' && (
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">/ Crédito</span>
                        )}
                      </div>
                      <div className="mt-2 space-y-0.5">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Análisis documental con criterio jurídico</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Basado en Ley Hipotecaria y Registral actual</p>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8 flex-1">
                      {[
                        'Hipotecas',
                        'Embargos',
                        'Cargas ocultas',
                        'Ocupantes'
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-slate-700">
                          <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </div>
                          <span className="text-sm font-medium">{item}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <Link 
                        to={`/analisis-cargas?id=${auction.boeId || auction.slug}`}
                        className="w-full py-5 px-6 bg-slate-900 hover:bg-brand-700 text-white rounded-2xl font-semibold text-lg transition-all flex items-center justify-center gap-3 group shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                      >
                        Analizar cargas
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-500 font-medium text-center">
                        <div className="flex items-center gap-1 justify-center"><Check className="w-3 h-3 text-emerald-500" /> Entrega inmediata</div>
                        <div className="flex items-center gap-1 justify-center"><Check className="w-3 h-3 text-emerald-500" /> Sin suscripción</div>
                        <div className="flex items-center gap-1 justify-center"><Check className="w-3 h-3 text-emerald-500" /> Pago único</div>
                        <div className="flex items-center gap-1 justify-center"><Check className="w-3 h-3 text-emerald-500" /> Informe descargable</div>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">Revisión documental experta basada en BOE y Registro</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Card 2: Análisis completo */}
            <div id="analisis-completo" className="bg-slate-50/50 border-2 border-slate-900 rounded-3xl p-6 md:p-8 shadow-md flex flex-col h-full relative hover:shadow-lg transition-all order-first md:order-none z-10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-lg border border-slate-800">
                RECOMENDADO
              </div>

              <div className="mb-6 mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <LineChart className="w-4 h-4 text-brand-500" />
                  <h3 className="text-2xl font-serif font-bold text-slate-900">Análisis completo</h3>
                </div>
                <p className="text-slate-600 text-sm font-medium">La decisión inteligente de inversión</p>
              </div>

              <div className="flex-1 flex flex-col">
                <div className="mb-8">
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-400 line-through font-medium mb-0.5">
                      Valor estimado {plan === 'pro' ? '9,99€' : plan === 'basic' ? '19€' : '29€'}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-slate-900">
                        {plan === 'pro' ? '0,99€' : plan === 'basic' ? '2,99€' : '4,99€'}
                      </span>
                    </div>
                  </div>
                  {plan !== 'pro' && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 bg-brand-100 text-brand-700 text-[9px] font-bold rounded uppercase tracking-wider">Ahorro PRO</span>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Precio PRO: 0,99€</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="text-sm font-medium">Rentabilidad estimada de inversión</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="text-sm font-medium">Riesgos legales detectados</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="text-sm font-medium">Estrategia de puja recomendada</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="text-sm font-medium">Comparables de mercado</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="text-sm font-medium">Informe profesional en PDF</span>
                  </div>
                </div>

                <div className="mt-auto space-y-4">
                  <Link 
                    to={`/analisis-inversion?id=${auction.boeId || auction.slug}`}
                    className="w-full bg-slate-900 hover:bg-brand-700 text-white font-bold py-5 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 group/btn text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Generar informe completo
                    <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-500 font-medium text-center">
                    <div className="flex items-center gap-1 justify-center"><Check className="w-3 h-3 text-emerald-500" /> Entrega inmediata</div>
                    <div className="flex items-center gap-1 justify-center"><Check className="w-3 h-3 text-emerald-500" /> Sin suscripción</div>
                    <div className="flex items-center gap-1 justify-center"><Check className="w-3 h-3 text-emerald-500" /> Pago único</div>
                    <div className="flex items-center gap-1 justify-center"><Check className="w-3 h-3 text-emerald-500" /> Informe descargable</div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">Análisis inversión completo con estrategia de puja</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center text-slate-400 text-xs">
            <p className="font-medium">
              Compra segura • Pago único sin suscripción • Acceso inmediato al informe • Servicio independiente • No necesitas crear cuenta
            </p>
          </div>
        </div>

        {/* User Notes Block */}
          {isLogged && (
            <div id="user-notes" className="mb-8 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                    <StickyNote size={20} />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-slate-900">Tu nota privada</h3>
                </div>
                {isSavingNote && (
                  <span className="text-xs text-slate-400 animate-pulse">Guardando...</span>
                )}
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Escribe aquí tus notas sobre esta subasta (solo tú puedes verlas)..."
                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all resize-none text-slate-700"
              />
              <p className="mt-2 text-xs text-slate-500">
                Las notas se guardan automáticamente en tu navegador.
              </p>
            </div>
          )}

          {/* SECONDARY CTA ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <motion.a 
              whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
              transition={{ duration: 0.2 }}
              href="https://calendly.com/activosoffmarket" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white border border-slate-200 p-5 md:p-7 rounded-[20px] md:rounded-[24px] hover:border-brand-200 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-4 mb-3 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                    <Calendar size={20} className="md:hidden" />
                    <Calendar size={24} className="hidden md:block" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base md:text-lg">Agendar Consulta</h4>
                    <p className="text-[8px] md:text-[9px] font-bold text-brand-600 uppercase tracking-widest">Consultoría Premium</p>
                  </div>
                </div>
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed mb-4 md:mb-6">
                  ¿Dudas con el expediente? Analizamos nota simple, edicto y riesgos reales antes de pujar.
                </p>
              </div>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-[10px] md:text-xs group-hover:translate-x-1 transition-transform">
                Reservar sesión <ArrowRight size={14} className="md:hidden" />
                <ArrowRight size={16} className="hidden md:block" />
              </div>
            </motion.a>

            <motion.div
              whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
              transition={{ duration: 0.2 }}
            >
              <Link 
                to="/calculadora-subastas" className="bg-white border border-slate-200 p-5 md:p-7 rounded-[20px] md:rounded-[24px] hover:border-brand-200 transition-all duration-300 group flex flex-col h-full justify-between"
              >
                <div>
                  <div className="flex items-center gap-4 mb-3 md:mb-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                      <Calculator size={20} className="md:hidden" />
                      <Calculator size={24} className="hidden md:block" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base md:text-lg">Calcular Puja Máxima</h4>
                      <p className="text-[8px] md:text-[9px] font-bold text-brand-600 uppercase tracking-widest">Herramienta de Análisis</p>
                    </div>
                  </div>
                  <p className="text-slate-500 text-xs md:text-sm leading-relaxed mb-4 md:mb-6">
                    Ahorra tiempo y decide con ventaja calculando tu margen real de beneficio.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-slate-900 font-bold text-[10px] md:text-xs group-hover:translate-x-1 transition-transform">
                  Ir a la calculadora <ArrowRight size={14} className="md:hidden" />
                  <ArrowRight size={16} className="hidden md:block" />
                </div>
              </Link>
            </motion.div>
          </div>

          <div className="space-y-8">
          {/* LONG-TAIL SEO CONTENT */}
          <section className="space-y-16 pb-20 mt-24 md:mt-32 border-t border-slate-100 pt-16">
            <div className="prose prose-slate max-w-none text-justify">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-8">Análisis del Activo</h2>
              

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp size={16} className="text-brand-500" />
                    Contexto de Mercado
                  </h3>
                  <p className="text-slate-600 leading-relaxed">{analysisInsights?.marketContext}</p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Search size={16} className="text-brand-500" />
                    Interpretación Técnica
                  </h3>
                  <p className="text-slate-600 leading-relaxed">{analysisInsights?.interpretation}</p>
                </div>
              </div>

              <div className="text-slate-600 leading-relaxed text-lg space-y-6">
                <p>{auction.description}</p>
                <p>
                  Esta subasta se tramita bajo el número de expediente <strong className="text-slate-900">{auction.boeId}</strong>. 
                  El procedimiento es de tipo <strong className="text-slate-900">{getAuctionType(auction.boeId)}</strong>, lo que implica unas reglas específicas de participación y plazos de consignación definidos por la Ley de Enjuiciamiento Civil.
                </p>
              </div>

              <h3 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mt-16 mb-8">¿Cómo participar en esta subasta en {cityName}?</h3>
              <div className="text-slate-600 leading-relaxed text-lg space-y-6">
                <p>
                  Para participar en la subasta de este {propertyType.toLowerCase()}, es necesario realizar un depósito (consignación) del 5% del valor de tasación. 
                  En este caso, el depósito requerido es de <strong className="text-slate-900">{auction.appraisalValue ? (auction.appraisalValue * 0.05).toLocaleString('es-ES', {style: 'currency', currency: 'EUR'}) : '---'}</strong>.
                </p>
                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 my-8">
                  <ul className="list-none p-0 m-0 space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-emerald-500 shrink-0 mt-1" />
                      <span><strong>Registro:</strong> Es obligatorio estar registrado en el Portal de Subastas del BOE.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-emerald-500 shrink-0 mt-1" />
                      <span><strong>Depósito:</strong> Se realiza de forma telemática a través de la pasarela de pagos de la AEAT.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-emerald-500 shrink-0 mt-1" />
                      <span><strong>Puja:</strong> Las pujas se realizan en tramos definidos por el juzgado.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <h3 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mt-16 mb-8 text-center">Preguntas Frecuentes</h3>
              
              <div className="space-y-3 max-w-4xl mx-auto">
                {[
                  {
                    q: "¿Se puede visitar el inmueble?",
                    a: "Normalmente no. En las subastas judiciales, el juzgado no tiene las llaves. Solo si el ocupante accede voluntariamente podrías entrar, pero lo habitual es comprar basándose en el expediente y la ubicación exterior."
                  },
                  {
                    q: "¿Qué ocurre con las cargas?",
                    a: "Las cargas anteriores a la hipoteca que se ejecuta permanecen (debes asumirlas). Las posteriores se cancelan. Es vital revisar la certificación de cargas del Registro de la Propiedad antes de pujar."
                  },
                  {
                    q: "¿Necesito financiación especial?",
                    a: "Sí. Los bancos no suelen dar hipotecas convencionales para subastas porque no pueden tasar el interior. Necesitas disponer del capital o financiación alternativa (préstamos personales o capital privado)."
                  },
                  {
                    q: "¿Cuánto debo depositar?",
                    a: "El depósito (consignación) suele ser el 5% del valor de tasación. Se hace a través del Portal de Subastas del BOE mediante cuenta bancaria."
                  },
                  {
                    q: "¿Cuántos participan normalmente?",
                    a: "Depende del atractivo del activo. En viviendas bien ubicadas pueden participar de 5 a 15 postores. En activos industriales o menos líquidos, a veces solo uno o ninguno."
                  },
                  {
                    q: "¿Estoy aún a tiempo?",
                    a: "La subasta dura 20 días naturales desde su apertura. Puedes pujar hasta el último segundo, aunque si hay una puja en los últimos 2 minutos, el plazo se prorroga otros 2 minutos."
                  },
                  {
                    q: "¿Puedo comprar para vivir?",
                    a: "Por supuesto. Muchos usuarios compran su vivienda habitual en subasta para ahorrar entre un 20% y un 40% sobre el precio de mercado, asumiendo el proceso de toma de posesión."
                  },
                  {
                    q: "¿Cómo se decide el ganador?",
                    a: "Gana la puja más alta, pero si no llega al 70% del valor de tasación, el ejecutado tiene derecho a presentar a un tercero que mejore la postura. El proceso finaliza con el Decreto de Adjudicación."
                  }
                ].map((faq, idx) => (
                  <details key={idx} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all hover:border-brand-200">
                    <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                      <span className="font-bold text-slate-900 text-sm md:text-base pr-4">{faq.q}</span>
                      <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-open:rotate-180 transition-transform">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                    </summary>
                    <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-50 pt-4">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* RELATED AUCTIONS */}
        {cleanSlug && (
          <div className="mt-32 mb-24 border-t border-slate-100 pt-16">
            <RelatedAuctions currentAuctionSlug={cleanSlug} currentAuctionData={auction} />
          </div>
        )}

        {/* PREMIUM MODAL */}
        <AnimatePresence>
          {showPremiumModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={() => setShowPremiumModal(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                    <Heart size={32} className="fill-red-500" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-slate-900 mb-3">Has guardado 3 oportunidades</h3>
                  <p className="text-slate-600 mb-8">
                    Pasa a PRO para guardar oportunidades ilimitadas y activar alertas avanzadas.
                  </p>
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => {
                        setShowPremiumModal(false);
                        window.location.href = ROUTES.PRO;
                      }}
                      className="w-full py-3.5 px-6 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
                    >
                      Ver PRO
                    </button>
                    <button 
                      onClick={() => setShowPremiumModal(false)}
                      className="w-full py-3.5 px-6 rounded-xl bg-slate-50 text-slate-600 font-bold hover:bg-slate-100 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* SOFT GATE MODAL */}
        <SoftGateModal 
          isOpen={!!softGateOrigin} 
          onClose={() => setSoftGateOrigin(null)} 
          origin={softGateOrigin || undefined}
          onUnlock={async () => {
            if (plan === 'basic') {
              const { incrementAnalysisCount } = userContext || {};
              if (incrementAnalysisCount) {
                const success = await incrementAnalysisCount();
                if (!success) return;
              }
            }
            
            if (softGateOrigin === 'streetview') {
              setShowStreetView(true);
            } else if (softGateOrigin === 'catastro' || softGateOrigin === 'comparativa') {
              setIsComparatorExpanded(true);
            }
          }}
        />

        {/* FULL ANALYSIS MODAL */}
        <FullAnalysisModal
          isOpen={showFullAnalysisModal}
          onClose={() => setShowFullAnalysisModal(false)}
          auction={auction}
          marketValue={compMarketValue}
          savings={compSavings}
          discount={compDiscountVsMarket}
          plan={plan}
        />

        {/* PAYMENT MODAL */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          type={paymentType}
          auctionId={auction.boeId || auction.slug || ''}
        />

        {/* STREET VIEW MODAL */}
        <AnimatePresence>
          {showStreetView && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowStreetView(false)}
                className="absolute inset-0 bg-slate-900/90 backdrop-blur-md"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-6xl h-[80vh] bg-white rounded-[32px] shadow-2xl overflow-hidden border border-white/20"
              >
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <button
                    onClick={() => setShowStreetView(false)}
                    className="p-3 bg-white/90 backdrop-blur-md text-slate-900 hover:bg-white rounded-2xl transition-all shadow-xl border border-slate-200"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200 shadow-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Street View</p>
                      <p className="text-xs font-bold text-slate-900 leading-none">{auction.address}</p>
                    </div>
                  </div>
                </div>

                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(
                    auction.lat && auction.lng 
                      ? `${auction.lat},${auction.lng}` 
                      : (auction.address ? `${auction.address}, ${auction.city}` : (auction.city || 'España'))
                  )}&layer=c${auction.lat && auction.lng ? `&cbll=${auction.lat},${auction.lng}` : ''}&output=embed`}
                  allowFullScreen
                ></iframe>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MOBILE STICKY CTA */}
        <AnimatePresence>
          {!analysisPaid && !showFullAnalysisModal && !showPaymentModal && !showPremiumModal && !softGateOrigin && !showStreetView && !isFooterVisible && (
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-3 md:hidden z-[60] flex items-center justify-between shadow-[0_-4px_10px_rgba(0,0,0,0.05)]"
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Análisis completo</span>
                <span className="text-lg font-bold text-slate-900 leading-none">
                  {plan === 'pro' ? '0,99€' : plan === 'basic' ? '2,99€' : '4,99€'}
                </span>
              </div>
              <button 
                onClick={() => {
                  setPaymentType('analysis');
                  setShowPaymentModal(true);
                }}
                className="bg-slate-900 text-white font-bold py-3 px-6 rounded-xl text-sm shadow-sm active:scale-[0.98] transition-all flex items-center gap-2"
              >
                Generar informe →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};

export default AuctionPage;
