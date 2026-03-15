import React, { useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';

const NeighborhoodInvestmentAnalysis: React.FC = () => {
  const { city, zone } = useParams<{ city: string; zone: string }>();
  
  const filteredAuctions = useMemo(() => 
    Object.values(AUCTIONS).filter(a => 
      a.city?.toLowerCase() === city?.toLowerCase() && 
      a.zone?.toLowerCase() === zone?.toLowerCase()
    ),
    [city, zone]
  );

  const metrics = useMemo(() => {
    const count = filteredAuctions.length;
    if (count === 0) return { count: 0, avgDiscount: 0, avgPriceM2: 0 };
    
    const totalDiscount = filteredAuctions.reduce((acc, a) => {
        if (!a.appraisalValue || !a.claimedDebt) return acc;
        return acc + Math.round((1 - a.claimedDebt / a.appraisalValue) * 100);
    }, 0);
    
    const totalM2 = filteredAuctions.reduce((acc, a) => acc + (a.surface || 0), 0);
    const totalPrice = filteredAuctions.reduce((acc, a) => acc + (a.appraisalValue || 0), 0);
    
    return {
        count,
        avgDiscount: Math.round(totalDiscount / count),
        avgPriceM2: totalM2 > 0 ? Math.round(totalPrice / totalM2) : 0
    };
  }, [filteredAuctions]);

  useEffect(() => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify({
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "headline": `¿Es buen momento para invertir en ${zone} (${city})?`,
          "description": `Análisis de oportunidades de inversión en subastas en ${zone}, ${city}.`,
          "author": { "@type": "Person", "name": "José Carlos de la Peña" }
      });
      document.head.appendChild(script);
      return () => { document.head.removeChild(script); };
  }, [city, zone]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 prose prose-slate">
        <h1 className="text-4xl font-bold mb-6">¿Es buen momento para invertir en {zone} ({city})?</h1>
        <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop" alt="Inversión inmobiliaria" className="w-full rounded-2xl mb-8" />
        
        <h2 className="text-2xl font-bold mb-4">Qué está pasando con las subastas en esta zona</h2>
        <p className="mb-4">
            {metrics.count > 4 ? "El volumen de subastas en esta zona está creciendo, lo que indica un mercado dinámico." : "El mercado en esta zona se mantiene estable."}
        </p>

        <h2 className="text-2xl font-bold mb-4">Descuentos medios detectados</h2>
        <p className="mb-4">
            {metrics.avgDiscount > 35 ? "Estamos detectando descuentos agresivos en esta zona, ideales para inversores." : "Los descuentos se mantienen en rangos habituales."}
        </p>

        <h2 className="text-2xl font-bold mb-4">Activos disponibles ahora</h2>
        {filteredAuctions.length > 0 ? (
            filteredAuctions.map(a => <div key={a.slug || a.boeId} className="p-4 border rounded mb-2">{a.propertyType} - {a.zone}</div>)
        ) : (
            <p>No hay subastas activas en esta zona actualmente.</p>
        )}
    </div>
  );
};
export default NeighborhoodInvestmentAnalysis;
