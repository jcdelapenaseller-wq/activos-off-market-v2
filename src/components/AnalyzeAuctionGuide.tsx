import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ROUTES } from '../routes';
import ConversionBlock from './ConversionBlock';
import { Calculator, Gavel, Home, TrendingUp, AlertTriangle, FileText } from 'lucide-react';

const AnalyzeAuctionGuide: React.FC = () => {
  const { city } = useParams();
  const cityName = city ? city.charAt(0).toUpperCase() + city.slice(1) : 'España';

  useEffect(() => {
    document.title = `Cómo analizar una subasta inmobiliaria en ${cityName} | Activos Off-Market`;
    window.scrollTo(0, 0);
  }, [cityName]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 prose prose-slate">
      <h1>Cómo analizar una subasta inmobiliaria en {cityName}</h1>
      <p className="lead">
        Analizar una subasta en {cityName} requiere un enfoque metódico para identificar oportunidades reales y evitar riesgos ocultos. Sigue esta guía paso a paso.
      </p>

      <h2>Paso a paso: Análisis de subasta en {cityName}</h2>
      <ol>
        <li><strong>Revisión del expediente:</strong> Accede al portal del BOE y descarga toda la documentación.</li>
        <li><strong>Valoración de mercado:</strong> Compara precios de venta en barrios similares de {cityName}.</li>
        <li><strong>Análisis de cargas:</strong> Identifica hipotecas, embargos o deudas de comunidad.</li>
        <li><strong>Situación de ocupación:</strong> Verifica si el inmueble está ocupado y el coste de desalojo.</li>
      </ol>

      <h2>Factores clave</h2>
      <div className="grid md:grid-cols-2 gap-6 my-8">
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <FileText className="text-brand-600 mb-2" />
          <h3>Valor de tasación</h3>
          <p>Es la referencia, pero no el precio real de mercado en {cityName}.</p>
        </div>
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <AlertTriangle className="text-brand-600 mb-2" />
          <h3>Cargas</h3>
          <p>Las cargas registrales pueden hacer que la subasta deje de ser rentable.</p>
        </div>
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <Home className="text-brand-600 mb-2" />
          <h3>Ocupación</h3>
          <p>El coste y tiempo de desalojo es un factor crítico en {cityName}.</p>
        </div>
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <TrendingUp className="text-brand-600 mb-2" />
          <h3>Rentabilidad</h3>
          <p>Calcula el beneficio neto tras todos los gastos.</p>
        </div>
      </div>

      <h2>Ejemplo práctico</h2>
      <p>
        Si un piso en {cityName} tiene un valor de mercado de 200.000€, una deuda de 50.000€ y gastos de reforma de 20.000€, tu puja máxima debería ser mucho menor para asegurar rentabilidad.
      </p>

      <ConversionBlock />

      <h2>Enlaces de interés</h2>
      <ul className="list-none p-0">
        <li><Link to={`/subastas-${city}`} className="text-brand-700 hover:underline">Ver subastas en {cityName}</Link></li>
        <li><Link to={ROUTES.EXAMPLES_INDEX} className="text-brand-700 hover:underline">Ver ejemplos de subastas analizadas</Link></li>
        <li><Link to={`/calcular-puja-subasta/${city}`} className="text-brand-700 hover:underline">Calcular puja en {cityName}</Link></li>
        <li><Link to={ROUTES.CALCULATOR} className="text-brand-700 hover:underline">Ir a la calculadora de subastas</Link></li>
      </ul>
    </div>
  );
};

export default AnalyzeAuctionGuide;
