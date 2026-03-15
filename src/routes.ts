import { RouteObject } from 'react-router-dom';
import { createElement } from 'react';
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
import AnalyzeAuctionGuide from './components/AnalyzeAuctionGuide';
import AuctionDynamicPage from './components/AuctionDynamicPage';
import CityAuctionsPage from './components/CityAuctionsPage';
import AuctionExampleReport from './components/AuctionExampleReport';
import AuctionExamplesIndex from './components/AuctionExamplesIndex';
import CityPropertyAuctions from './components/CityPropertyAuctions';
import ZonePropertyAuctions from './components/ZonePropertyAuctions';
import ZoneAuctions from './components/ZoneAuctions';
import StreetAuctions from './components/StreetAuctions';
import OpportunityAuctions from './components/OpportunityAuctions';
import RecentAuctions from './components/RecentAuctions';
import HighDiscountAuctions from './components/HighDiscountAuctions';
import DiscoverCityArticles from './components/DiscoverCityArticles';
import AuctionDiscoverArticle from './components/AuctionDiscoverArticle';
import DiscoverArticlesIndex from './components/DiscoverArticlesIndex';
import NeighborhoodInvestmentAnalysis from './components/NeighborhoodInvestmentAnalysis';
import CityInvestmentAnalysis from './components/CityInvestmentAnalysis';
import Legal from './components/Legal';
import BestAuctionsByCity from './components/BestAuctionsByCity';

export const ROUTES = {
  HOME: '/',
  ABOUT: '/quien-soy',
  SUBASTAS_BOE: '/subastas-boe',
  RECENT_AUCTIONS: '/subastas-recientes',
  HIGH_DISCOUNT: '/subastas-descuento-50',
  GUIDE_INDEX: '/indice-guia-subastas',
  GUIDE_PILLAR: '/subastas-judiciales-espana',
  ANALYSIS: '/como-analizar-subasta-judicial-paso-a-paso',
  GLOSSARY: '/glosario-subastas',
  COMPARISON: '/subasta-judicial-vs-aeat-diferencias',
  DEPOSIT: '/deposito-subasta-judicial-5-por-ciento',
  RULE_70: '/regla-70-subasta-judicial',
  OCCUPIED: '/vivienda-ocupada-subasta-judicial',
  CHARGES: '/cargas-subasta-judicial',
  VISIT: '/visitar-piso-subasta',
  ERRORS: '/errores-subasta-judicial',
  ASSIGNMENT: '/cesion-de-remate-subasta-judicial',
  EMPTY: '/que-pasa-si-nadie-puja-subasta-judicial',
  WORTH_IT: '/merecen-pena-subastas-boe',
  CALCULATOR: '/calculadora-subastas',
  PROFITABILITY: '/como-calcular-rentabilidad-subasta-judicial',
  PROFITABILITY_CALC_GUIDE: '/calculadora-rentabilidad-subastas',
  HOW_MUCH_TO_PAY: '/cuanto-pagar-subasta-judicial',
  MAX_BID: '/calcular-puja-maxima-subasta',
  CALCULAR_PUJA: '/calcular-puja-subasta-judicial',
  PUJA_MAXIMA_BOE: '/puja-maxima-subasta-judicial',
  RENTABILIDAD_JUDICIAL: '/rentabilidad-subasta-judicial',
  CUANTO_PUJAR_BOE: '/cuanto-pujar-subasta-boe',
  CALCULAR_PUJA_CITY: '/calcular-puja-subasta/:city',
  RENTABILIDAD_CITY: '/rentabilidad-subasta/:city',
  CUANTO_PUJAR_CITY: '/cuanto-pujar-subasta/:city',
  ANALIZAR_CITY: '/analizar-subasta/:city',
  SUBASTAS_EN_CITY: '/subastas-en/:city',
  MADRID: '/subastas-madrid',
  BARCELONA: '/subastas-barcelona',
  VALENCIA: '/subastas-valencia',
  SEVILLA: '/subastas-sevilla',
  EXAMPLES_INDEX: '/ejemplos-subastas',
  EXAMPLE_REPORT: '/ejemplo-subasta/:slug',
  NOTICIAS_SUBASTAS_INDEX: '/noticias-subastas',
  NOTICIAS_SUBASTAS_CITY: '/noticias-subastas/:city',
  NOTICIAS_SUBASTAS: '/noticias-subastas/:slug',
  CITY_PROPERTY: '/subastas/:city/:propertyType',
  ZONE_PROPERTY_CITY: '/subastas-:propertyType-:city-:zone',
  STREET: '/subastas/:city/:zone/:street',
  CITY_OPPORTUNITIES: '/subastas/:city/oportunidades',
  ZONE: '/subastas/:city/:zone',
  BEST_AUCTIONS_CITY: '/mejores-subastas/:city',
  INVERSION_CITY: '/inversion/:city',
  INVERSION_CITY_ZONE: '/inversion/:city/:zone',
  LEGAL: '/aviso-legal',
  PRIVACY: '/politica-privacidad',
  COOKIES: '/politica-cookies',
  TERMS: '/terminos-y-condiciones',
  CONTACT: '/contacto',
};

export const routes: RouteObject[] = [
  {
    path: ROUTES.HOME,
    element: createElement(Home),
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
    element: createElement(CalculateBidGuide),
  },
  {
    path: ROUTES.RENTABILIDAD_CITY,
    element: createElement(CalculateBidGuide),
  },
  {
    path: ROUTES.CUANTO_PUJAR_CITY,
    element: createElement(CalculateBidGuide),
  },
  {
    path: ROUTES.ANALIZAR_CITY,
    element: createElement(AnalyzeAuctionGuide),
  },
  {
    path: '/rentabilidad-subasta/:slug',
    element: createElement(AuctionDynamicPage),
  },
  {
    path: '/calcular-puja-subasta/:slug',
    element: createElement(AuctionDynamicPage),
  },
  {
    path: '/analizar-subasta/:slug',
    element: createElement(AuctionDynamicPage),
  },
  {
    path: '/subastas-en/:city',
    element: createElement(CityAuctionsPage),
  },
  {
    path: ROUTES.MADRID,
    element: createElement(AuctionMadridGuide),
  },
  {
    path: ROUTES.BARCELONA,
    element: createElement(AuctionBarcelonaGuide),
  },
  {
    path: ROUTES.VALENCIA,
    element: createElement(AuctionValenciaGuide),
  },
  {
    path: ROUTES.SEVILLA,
    element: createElement(AuctionSevillaGuide),
  },
  {
    path: ROUTES.EXAMPLES_INDEX,
    element: createElement(AuctionExamplesIndex),
  },
  {
    path: ROUTES.EXAMPLE_REPORT,
    element: createElement(AuctionExampleReport),
  },
  {
    path: ROUTES.NOTICIAS_SUBASTAS_INDEX,
    element: createElement(DiscoverArticlesIndex),
  },
  {
    path: '/noticias-subastas/madrid',
    element: createElement(DiscoverCityArticles),
  },
  {
    path: '/noticias-subastas/barcelona',
    element: createElement(DiscoverCityArticles),
  },
  {
    path: '/noticias-subastas/valencia',
    element: createElement(DiscoverCityArticles),
  },
  {
    path: '/noticias-subastas/sevilla',
    element: createElement(DiscoverCityArticles),
  },
  {
    path: ROUTES.NOTICIAS_SUBASTAS,
    element: createElement(AuctionDiscoverArticle),
  },
  {
    path: ROUTES.STREET,
    element: createElement(StreetAuctions),
  },
  {
    path: ROUTES.CITY_OPPORTUNITIES,
    element: createElement(OpportunityAuctions),
  },
  {
    path: ROUTES.ZONE,
    element: createElement(ZoneAuctions),
  },
  {
    path: ROUTES.ZONE_PROPERTY_CITY,
    element: createElement(ZonePropertyAuctions),
  },
  {
    path: ROUTES.BEST_AUCTIONS_CITY,
    element: createElement(BestAuctionsByCity),
  },
  {
    path: ROUTES.INVERSION_CITY,
    element: createElement(CityInvestmentAnalysis),
  },
  {
    path: ROUTES.INVERSION_CITY_ZONE,
    element: createElement(NeighborhoodInvestmentAnalysis),
  },
  {
    path: ROUTES.CITY_PROPERTY,
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
    path: '*',
    element: createElement(NotFound),
  }
];
