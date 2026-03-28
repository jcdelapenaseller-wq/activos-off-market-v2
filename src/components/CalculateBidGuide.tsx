import React, { useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import ConversionBlock from './ConversionBlock';

const CalculateBidGuide: React.FC = () => {
  const location = useLocation();
  const { city } = useParams();
  
  const getPageContent = () => {
    if (city) {
        const cityName = city.charAt(0).toUpperCase() + city.slice(1);
        
        if (location.pathname.startsWith('/rentabilidad-subasta/')) {
            return {
                title: `Rentabilidad en subastas en ${cityName}`,
                desc: `Guía para calcular la rentabilidad de subastas inmobiliarias en ${cityName}.`,
                explanation: `La rentabilidad en ${cityName} depende de la ubicación, el estado del inmueble y los costes de adquisición. Analizamos el mercado local para maximizar tu inversión.`,
                example: `Inversión total en ${cityName} de 200.000€ con venta final de 260.000€ genera un beneficio neto del 30%.`
            };
        }
        
        if (location.pathname.startsWith('/cuanto-pujar-subasta/')) {
            return {
                title: `Cuánto pujar en subastas en ${cityName}`,
                desc: `Guía para determinar cuánto pujar en subastas inmobiliarias en ${cityName}.`,
                explanation: `Saber cuánto pujar en ${cityName} requiere un análisis exhaustivo de las cargas registrales y la demanda de alquiler en la zona.`,
                example: `Si el valor de mercado en ${cityName} es 300.000€, una puja segura suele rondar los 210.000€ (70%).`
            };
        }

        return { 
          title: `Calcular la puja en una subasta inmobiliaria en ${cityName}`, 
          desc: `Guía para calcular la puja en subastas inmobiliarias en ${cityName}.`,
          explanation: `Calcular la puja en ${cityName} requiere conocer las particularidades del mercado local, como la demanda en barrios específicos y los costes de reforma.`,
          example: `En una subasta en ${cityName} con valor de mercado de 250.000€ y costes de 60.000€, tu puja máxima debería ser 190.000€.`
        };
    }

    switch (location.pathname) {
      case ROUTES.CALCULAR_PUJA:
        return { 
          title: "Cómo calcular la puja en una subasta judicial", 
          desc: "Aprende a calcular la puja correcta para tus inversiones en subastas judiciales.",
          explanation: "Calcular la puja es determinar el precio máximo de adjudicación que garantiza rentabilidad tras descontar impuestos (ITP), gastos de registro, notaría, reformas y posibles deudas.",
          example: "Si un inmueble vale 200.000€ en mercado y tiene 50.000€ en costes totales, tu puja máxima debería ser 150.000€ para cubrir gastos y obtener beneficio."
        };
      case ROUTES.PUJA_MAXIMA_BOE:
        return { 
          title: "Puja máxima en subasta BOE", 
          desc: "Descubre cómo determinar tu puja máxima en el portal del BOE.",
          explanation: "La puja máxima en subastas del BOE es el límite de seguridad que no debes superar para evitar una inversión ruinosa. Se basa en la regla del 70% y el análisis de cargas.",
          example: "Para un valor de tasación de 200.000€, la puja máxima segura según la regla del 70% sería 140.000€, siempre que no existan cargas prioritarias."
        };
      case ROUTES.RENTABILIDAD_JUDICIAL:
        return { 
          title: "Rentabilidad en subasta judicial", 
          desc: "Analiza la rentabilidad real de tus inversiones en subastas.",
          explanation: "La rentabilidad real no es solo la diferencia de precio. Debes considerar el tiempo de inmovilización del capital, el riesgo de ocupación y los costes de desalojo.",
          example: "Adjudicación 100.000€ + Gastos 20.000€ = 120.000€ inversión. Venta 160.000€. Beneficio 40.000€ (33% ROI)."
        };
      case ROUTES.CUANTO_PUJAR_BOE:
        return { 
          title: "Cuánto pujar en subasta BOE", 
          desc: "Guía para saber cuánto pujar en subastas del BOE.",
          explanation: "Saber cuánto pujar requiere conocer la deuda reclamada y las cargas registrales. Pujar demasiado alto elimina tu margen de beneficio.",
          example: "Si la deuda es 80.000€ y el valor de mercado es 150.000€, pujar por encima de 100.000€ reduce drásticamente tu margen."
        };
      default:
        return { title: "Guía de subastas", desc: "Información sobre subastas.", explanation: "", example: "" };
    }
  };

  const content = getPageContent();

  useEffect(() => {
    document.title = `${content.title} | Activos Off-Market`;
  }, [content.title]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 prose prose-slate">
      <h1>{content.title}</h1>
      <p>{content.desc}</p>
      
      <h2>¿Qué significa este concepto?</h2>
      <p>{content.explanation}</p>
      
      <h2>Ejemplo práctico</h2>
      <p>{content.example}</p>
      
      <ConversionBlock />

      <h2>FAQ</h2>
      <ul>
        <li>¿Cómo calcular la puja máxima? Restando costes al valor de mercado.</li>
        <li>¿Cuánto dinero necesito? Mínimo el 5% de consignación.</li>
      </ul>
      
      <nav className="mt-12 border-t pt-8">
        <Link 
          to={ROUTES.GUIDE_INDEX} className="text-brand-700"
        >
          Volver al índice de guías
        </Link>
      </nav>
    </div>
  );
};

export default CalculateBidGuide;
