import React from 'react';
import { RouteObject, Navigate, useParams, useLocation } from 'react-router-dom';
import { createElement } from 'react';
import { ROUTES } from './constants/routes';
export { ROUTES };

// Redirect components to handle dynamic params
const RedirectCity = ({ to }: { to: string }) => {
  const { city } = useParams();
  const location = useLocation();
  return createElement(Navigate, { to: to.replace(':city', city || '') + location.search + location.hash, replace: true });
};

const RedirectSlug = ({ to }: { to: string }) => {
  const { slug } = useParams();
  const location = useLocation();
  return createElement(Navigate, { to: to.replace(':slug', slug || '') + location.search + location.hash, replace: true });
};

const RedirectProvince = ({ to }: { to: string }) => {
  const { province } = useParams();
  const location = useLocation();
  return createElement(Navigate, { to: to.replace(':province', province || '') + location.search + location.hash, replace: true });
};

const RedirectCityZone = ({ to }: { to: string }) => {
  const { city, zone } = useParams();
  const location = useLocation();
  return createElement(Navigate, { to: to.replace(':city', city || '').replace(':zone', zone || '') + location.search + location.hash, replace: true });
};

const RedirectStatic = ({ to }: { to: string }) => {
  const location = useLocation();
  return createElement(Navigate, { to: to + location.search + location.hash, replace: true });
};

import Home from './components/Home';
import About from './components/About';
import SubastasBOEPage from './components/SubastasBOEPage';
import GuidePillar from './components/GuidePillar';
import AuctionGuideIndex from './components/AuctionGuideIndex';
import AuctionAnalysisGuide from './components/AuctionAnalysisGuide';
import AuctionGlossary from './components/AuctionGlossary';
import AuctionComparisonGuide from './components/AuctionComparisonGuide';
import AuctionDepositGuide from './components/AuctionDepositGuide';
import Auction70RuleGuide from './components/Auction70RuleGuide';
import OccupiedHousingGuide from './components/OccupiedHousingGuide';
import AuctionChargesGuide from './components/AuctionChargesGuide';
import AuctionVisitGuide from './components/AuctionVisitGuide';
import AuctionErrorsGuide from './components/AuctionErrorsGuide';
import AuctionAssignmentGuide from './components/AuctionAssignmentGuide';
import AuctionCalculator from './components/AuctionCalculator';
import NotFound from './components/NotFound';
import AuctionEmptyGuide from './components/AuctionEmptyGuide';
import AuctionWorthItGuide from './components/AuctionWorthItGuide';
import AuctionProfitabilityGuide from './components/AuctionProfitabilityGuide';
import AuctionProfitabilityCalculatorGuide from './components/AuctionProfitabilityCalculatorGuide';
import AuctionHowMuchToPayGuide from './components/AuctionHowMuchToPayGuide';
import AuctionMaxBidGuide from './components/AuctionMaxBidGuide';
import CalculateBidGuide from './components/CalculateBidGuide';
import AuctionMadridGuide from './components/AuctionMadridGuide';
import AuctionBarcelonaGuide from './components/AuctionBarcelonaGuide';
import AuctionValenciaGuide from './components/AuctionValenciaGuide';
import AuctionSevillaGuide from './components/AuctionSevillaGuide';
import AuctionExamplesIndex from './components/AuctionExamplesIndex';
import CityPropertyAuctions from './components/CityPropertyAuctions';
import ZonePropertyAuctions from './components/ZonePropertyAuctions';
import ZoneAuctions from './components/ZoneAuctions';
import StreetAuctions from './components/StreetAuctions';
import OpportunityAuctions from './components/OpportunityAuctions';
import RecentAuctions from './components/RecentAuctions';
import HistoricalAuctions from './components/HistoricalAuctions';
import HighDiscountAuctions from './components/HighDiscountAuctions';
import DiscoverProvinceArticle from './components/DiscoverProvinceArticle';
import DiscoverAuctionArticle from './components/DiscoverAuctionArticle';
import DiscoverReportArticle from './components/DiscoverReportArticle';
import DiscoverArticlesIndex from './components/DiscoverArticlesIndex';
import DiscoverReportsIndex from './components/DiscoverReportsIndex';
import ProvinceHub from './components/ProvinceHub';
import ErrorBoundary from './components/ErrorBoundary';
const AuctionPage = React.lazy(() => import('./components/AuctionPage'));
const AnalysisPage = React.lazy(() => import('./pages/AnalysisPage'));
import AuctionCalculatorPage from './components/AuctionCalculatorPage';
import Legal from './components/Legal';
import AdminTracking from './components/AdminTracking';
import ChecklistPage from './components/ChecklistPage';
import AlertForm from './components/AlertForm';
import AlertSuccessPage from './components/AlertSuccessPage';
import SavedAuctionsPage from './components/SavedAuctionsPage';
import AccountPage from './components/AccountPage';
import ProPage from './components/ProPage';
import SuccessPage from './components/SuccessPage';
import CancelPage from './components/CancelPage';
import LoginPage from './components/LoginPage';
const AnalisisCargasPage = React.lazy(() => import('./components/AnalisisCargasPage'));
const AnalisisInversionPage = React.lazy(() => import('./components/AnalisisInversionPage'));
const AnalizarSubastaHub = React.lazy(() => import('./components/AnalizarSubastaHub'));

export const routes: RouteObject[] = [
  {
    path: ROUTES.SUCCESS,
    element: createElement(SuccessPage),
  },
  {
    path: ROUTES.CANCEL,
    element: createElement(CancelPage),
  },
  {
    path: ROUTES.ANALISIS_CARGAS,
    element: createElement(AnalisisCargasPage),
  },
  {
    path: ROUTES.ANALISIS_INVERSION,
    element: createElement(AnalisisInversionPage),
  },
  {
    path: ROUTES.ANALIZAR_SUBASTA,
    element: createElement(AnalizarSubastaHub),
  },
  {
    path: ROUTES.LOGIN,
    element: createElement(LoginPage),
  },
  {
    path: ROUTES.PRO,
    element: createElement(ProPage),
  },
  {
    path: ROUTES.PROVINCE_HUB,
    element: createElement(ProvinceHub),
  },
  {
    path: ROUTES.ANALISIS_SLUG,
    element: createElement(RedirectSlug, { to: ROUTES.AUCTION_PAGE }),
  },
  {
    path: ROUTES.AUCTION_PAGE,
    element: createElement(ErrorBoundary, null, createElement(AuctionPage)),
  },
  {
    path: ROUTES.CALCULATOR_SLUG,
    element: createElement(AuctionCalculatorPage),
  },
  {
    path: ROUTES.HOME,
    element: createElement(Home),
  },
  {
    path: '/quien-soy',
    element: createElement(RedirectStatic, { to: '/equipo' }),
  },
  {
    path: '/metodologia',
    element: createElement(RedirectStatic, { to: '/equipo' }),
  },
  {
    path: '/quienes-somos',
    element: createElement(RedirectStatic, { to: '/equipo' }),
  },
  {
    path: ROUTES.ABOUT,
    element: createElement(About),
  },
  {
    path: ROUTES.SUBASTAS_BOE,
    element: createElement(SubastasBOEPage),
  },
  {
    path: ROUTES.RECENT_AUCTIONS,
    element: createElement(RecentAuctions),
  },
  {
    path: ROUTES.HISTORICAL_AUCTIONS,
    element: createElement(HistoricalAuctions),
  },
  {
    path: ROUTES.HIGH_DISCOUNT,
    element: createElement(HighDiscountAuctions),
  },
  {
    path: ROUTES.GUIDE_INDEX,
    element: createElement(AuctionGuideIndex),
  },
  {
    path: ROUTES.GUIDE_PILLAR,
    element: createElement(GuidePillar),
  },
  {
    path: ROUTES.ANALYSIS,
    element: createElement(AuctionAnalysisGuide),
  },
  {
    path: ROUTES.GLOSSARY,
    element: createElement(AuctionGlossary),
  },
  {
    path: ROUTES.COMPARISON,
    element: createElement(AuctionComparisonGuide),
  },
  {
    path: ROUTES.DEPOSIT,
    element: createElement(AuctionDepositGuide),
  },
  {
    path: ROUTES.RULE_70,
    element: createElement(Auction70RuleGuide),
  },
  {
    path: ROUTES.OCCUPIED,
    element: createElement(OccupiedHousingGuide),
  },
  {
    path: ROUTES.CHARGES,
    element: createElement(AuctionChargesGuide),
  },
  {
    path: ROUTES.VISIT,
    element: createElement(AuctionVisitGuide),
  },
  {
    path: ROUTES.ERRORS,
    element: createElement(AuctionErrorsGuide),
  },
  {
    path: ROUTES.ASSIGNMENT,
    element: createElement(AuctionAssignmentGuide),
  },
  {
    path: ROUTES.CALCULATOR,
    element: createElement(AuctionCalculator),
  },
  {
    path: ROUTES.PROFITABILITY,
    element: createElement(AuctionProfitabilityGuide),
  },
  {
    path: ROUTES.PROFITABILITY_CALC_GUIDE,
    element: createElement(AuctionProfitabilityCalculatorGuide),
  },
  {
    path: ROUTES.HOW_MUCH_TO_PAY,
    element: createElement(AuctionHowMuchToPayGuide),
  },
  {
    path: ROUTES.MAX_BID,
    element: createElement(AuctionMaxBidGuide),
  },
  {
    path: ROUTES.CALCULAR_PUJA,
    element: createElement(CalculateBidGuide),
  },
  {
    path: ROUTES.PUJA_MAXIMA_BOE,
    element: createElement(CalculateBidGuide),
  },
  {
    path: ROUTES.RENTABILIDAD_JUDICIAL,
    element: createElement(CalculateBidGuide),
  },
  {
    path: ROUTES.CUANTO_PUJAR_BOE,
    element: createElement(CalculateBidGuide),
  },
  {
    path: ROUTES.CALCULAR_PUJA_CITY,
    element: createElement(RedirectCity, { to: '/subastas/:city' }),
  },
  {
    path: ROUTES.RENTABILIDAD_CITY,
    element: createElement(RedirectCity, { to: '/subastas/:city' }),
  },
  {
    path: ROUTES.CUANTO_PUJAR_CITY,
    element: createElement(RedirectCity, { to: '/subastas/:city' }),
  },
  {
    path: ROUTES.ANALIZAR_CITY,
    element: createElement(RedirectCity, { to: '/subastas/:city' }),
  },
  {
    path: '/rentabilidad-subasta/:slug',
    element: createElement(RedirectSlug, { to: '/subasta/:slug' }),
  },
  {
    path: '/calcular-puja-subasta/:slug',
    element: createElement(RedirectSlug, { to: '/subasta/:slug' }),
  },
  {
    path: '/analizar-subasta/:slug',
    element: createElement(RedirectSlug, { to: '/subasta/:slug' }),
  },
  {
    path: '/subastas-en/:city',
    element: createElement(RedirectCity, { to: '/subastas/:city' }),
  },
  {
    path: ROUTES.MADRID,
    element: createElement(RedirectStatic, { to: '/subastas/madrid' }),
  },
  {
    path: ROUTES.BARCELONA,
    element: createElement(RedirectStatic, { to: '/subastas/barcelona' }),
  },
  {
    path: ROUTES.VALENCIA,
    element: createElement(RedirectStatic, { to: '/subastas/valencia' }),
  },
  {
    path: ROUTES.SEVILLA,
    element: createElement(RedirectStatic, { to: '/subastas/sevilla' }),
  },
  {
    path: ROUTES.EXAMPLES_INDEX,
    element: createElement(AuctionExamplesIndex),
  },
  {
    path: ROUTES.EXAMPLE_REPORT,
    element: createElement(RedirectSlug, { to: '/subasta/:slug' }),
  },
  {
    path: ROUTES.NOTICIAS_SUBASTAS_INDEX,
    element: createElement(DiscoverArticlesIndex),
  },
  {
    path: '/noticias-subastas/provincia/:province/hoy',
    element: createElement(RedirectProvince, { to: '/noticias-subastas/provincia/:province' }),
  },
  {
    path: '/noticias-subastas/provincia/:province/oportunidades',
    element: createElement(RedirectProvince, { to: '/noticias-subastas/provincia/:province' }),
  },
  {
    path: '/noticias-subastas/provincia/:province/donde-invertir',
    element: createElement(RedirectProvince, { to: '/noticias-subastas/provincia/:province' }),
  },
  {
    path: '/noticias-subastas/provincia/:province',
    element: createElement(DiscoverProvinceArticle),
  },
  {
    path: '/noticias-subastas/madrid',
    element: createElement(RedirectStatic, { to: '/noticias-subastas/provincia/madrid' }),
  },
  {
    path: '/noticias-subastas/barcelona',
    element: createElement(RedirectStatic, { to: '/noticias-subastas/provincia/barcelona' }),
  },
  {
    path: '/noticias-subastas/valencia',
    element: createElement(RedirectStatic, { to: '/noticias-subastas/provincia/valencia' }),
  },
  {
    path: '/noticias-subastas/sevilla',
    element: createElement(RedirectStatic, { to: '/noticias-subastas/provincia/sevilla' }),
  },
  {
    path: ROUTES.NOTICIAS_SUBASTAS_ANALYSIS,
    element: createElement(DiscoverAuctionArticle),
  },
  {
    path: ROUTES.NOTICIAS_SUBASTAS_RESULT,
    element: createElement(DiscoverAuctionArticle),
  },
  {
    path: '/discover/reportajes/:slug',
    element: createElement(RedirectSlug, { to: '/analisis/:slug' }),
  },
  {
    path: ROUTES.DISCOVER_REPORT,
    element: createElement(DiscoverReportArticle),
  },
  {
    path: ROUTES.REPORTS_INDEX,
    element: createElement(DiscoverReportsIndex),
  },
  {
    path: ROUTES.NOTICIAS_SUBASTAS,
    element: createElement(RedirectSlug, { to: '/subasta/:slug' }),
  },
  {
    path: ROUTES.STREET,
    element: createElement(StreetAuctions),
  },
  {
    path: ROUTES.PROVINCE_OPPORTUNITIES,
    element: createElement(OpportunityAuctions),
  },
  {
    path: ROUTES.ZONE,
    element: createElement(ZoneAuctions),
  },
  {
    path: ROUTES.ZONE_PROPERTY_PROVINCE,
    element: createElement(ZonePropertyAuctions),
  },
  {
    path: ROUTES.BEST_AUCTIONS_CITY,
    element: createElement(RedirectCity, { to: '/subastas/:city' }),
  },
  {
    path: ROUTES.INVERSION_CITY,
    element: createElement(RedirectCity, { to: '/subastas/:city' }),
  },
  {
    path: ROUTES.INVERSION_CITY_ZONE,
    element: createElement(RedirectCityZone, { to: '/subastas/:city/:zone' }),
  },
  {
    path: ROUTES.PROVINCE_PROPERTY,
    element: createElement(CityPropertyAuctions),
  },
  {
    path: ROUTES.EMPTY,
    element: createElement(AuctionEmptyGuide),
  },
  {
    path: ROUTES.WORTH_IT,
    element: createElement(AuctionWorthItGuide),
  },
  {
    path: ROUTES.LEGAL,
    element: createElement(Legal, { type: 'aviso-legal' }),
  },
  {
    path: ROUTES.PRIVACY,
    element: createElement(Legal, { type: 'privacidad' }),
  },
  {
    path: ROUTES.COOKIES,
    element: createElement(Legal, { type: 'cookies' }),
  },
  {
    path: ROUTES.TERMS,
    element: createElement(Legal, { type: 'terminos' }),
  },
  {
    path: ROUTES.CONTACT,
    element: createElement(Legal, { type: 'contacto' }),
  },
  {
    path: ROUTES.ADMIN_TRACKING,
    element: createElement(AdminTracking),
  },
  {
    path: ROUTES.CHECKLIST,
    element: createElement(ChecklistPage),
  },
  {
    path: ROUTES.ALERTAS,
    element: createElement(AlertForm),
  },
  {
    path: ROUTES.ALERTA_CONFIRMADA,
    element: createElement(AlertSuccessPage),
  },
  {
    path: ROUTES.MIS_GUARDADOS,
    element: createElement(SavedAuctionsPage),
  },
  {
    path: ROUTES.MI_CUENTA,
    element: createElement(AccountPage),
  },
  {
    path: '*',
    element: createElement(NotFound),
  }
];
