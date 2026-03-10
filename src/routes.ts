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
import AuctionHowMuchToPayGuide from './components/AuctionHowMuchToPayGuide';
import AuctionMaxBidGuide from './components/AuctionMaxBidGuide';
import AuctionMadridGuide from './components/AuctionMadridGuide';
import Legal from './components/Legal';

export const ROUTES = {
  HOME: '/',
  ABOUT: '/quien-soy',
  SUBASTAS_BOE: '/subastas-boe',
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
  HOW_MUCH_TO_PAY: '/cuanto-pagar-subasta-judicial',
  MAX_BID: '/calcular-puja-maxima-subasta',
  MADRID: '/subastas-madrid',
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
    path: ROUTES.HOW_MUCH_TO_PAY,
    element: createElement(AuctionHowMuchToPayGuide),
  },
  {
    path: ROUTES.MAX_BID,
    element: createElement(AuctionMaxBidGuide),
  },
  {
    path: ROUTES.MADRID,
    element: createElement(AuctionMadridGuide),
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
