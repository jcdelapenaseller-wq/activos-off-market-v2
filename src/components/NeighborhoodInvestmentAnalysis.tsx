import React, { useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';
import { TrendingUp, DollarSign, MapPin, ChevronRight, Calculator, Info } from 'lucide-react';

const NeighborhoodInvestmentAnalysis: React.FC = () => {
  const { city, zone } = useParams<{ city: string; zone: string }>();
  
  const filteredAuctions = useMemo(() => 
    Object.values(AUCTIONS).filter(a => 
      a.city?.toLowerCase() === city?.toLowerCase() && 
      a.zone?.toLowerCase() === zone?.toLowerCase()
    ),
    [city, zone]
  );

  const latestUpdate = useMemo(() => {
    if (filteredAuctions.length === 0) return null;
    const dates = filteredAuctions.map(a => a.publishedAt ? new Date(a.publishedAt).getTime() : 0);
    return new Date(Math.max(...dates));
  }, [filteredAuctions]);

  const metrics = useMemo(() => {
    const count = filteredAuctions.length;
    if (count === 0) return { count: 0, avgDiscount: 0, avgPriceM2: 0, minAppraisal: 0, maxAppraisal: 0, predominantType: 'N/A' };
    
    const totalDiscount = filteredAuctions.reduce((acc, a) => {
        if (!a.appraisalValue || !a.claimedDebt) return acc;
        return acc + Math.round((1 - a.claimedDebt / a.appraisalValue) * 100);
    }, 0);
    
    const appraisals = filteredAuctions.map(a => a.appraisalValue).filter(v => typeof v === 'number') as number[];
    const minAppraisal = appraisals.length > 0 ? Math.min(...appraisals) : 0;
    const maxAppraisal = appraisals.length > 0 ? Math.max(...appraisals) : 0;
    
    const typeCounts: Record<string, number> = {};
    filteredAuctions.forEach(a => {
        const type = a.propertyType || 'Otros';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    const predominantType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Otros';

    const totalM2 = filteredAuctions.reduce((acc, a) => acc + (a.surface || 0), 0);
    const totalPrice = filteredAuctions.reduce((acc, a) => acc + (a.appraisalValue || 0), 0);
    
    return {
        count,
        avgDiscount: Math.round(totalDiscount / count),
        avgPriceM2: totalM2 > 0 ? Math.round(totalPrice / totalM2) : 0,
        minAppraisal,
        maxAppraisal,
        predominantType
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
        <h1 className="text-4xl font-bold mb-2">¿Es buen momento para invertir en {zone} ({city})?</h1>
        {latestUpdate && <p className="text-sm text-slate-500 mb-6">Actualizado el {latestUpdate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
        <div className="mb-6">
            <Link 
              to={`/subastas/${city}/${zone}`} 
              className="inline-flex items-center gap-2 text-brand-600 font-bold hover:text-brand-800 transition-colors"
            >
              🔎 Ver todas las subastas activas en {zone} →
            </Link>
        </div>
        <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop" alt="Inversión inmobiliaria" className="w-full rounded-2xl mb-8" />
        
        <p className="lead text-xl text-slate-600 mb-6">
            Analizar el mercado de subastas en <Link to={`/inversion/${city?.toLowerCase()}/${zone?.toLowerCase()}`} className="hover:underline text-brand-600">{zone}</Link> requiere una visión clara de los datos. En los últimos meses estamos detectando un aumento de subastas inmobiliarias en <Link to={`/inversion/${city?.toLowerCase()}/${zone?.toLowerCase()}`} className="hover:underline text-brand-600">{zone}</Link>. Esto suele indicar procesos de ajuste de mercado o activos que empiezan a salir con descuento.
        </p>
        <p className="text-lg text-slate-600 mb-8">
            <Link to={`/inversion/${city?.toLowerCase()}/${zone?.toLowerCase()}`} className="hover:underline text-brand-600">{zone ? zone.charAt(0).toUpperCase() + zone.slice(1) : 'Esta zona'}</Link> está empezando a concentrar varias subastas inmobiliarias. Para los inversores, entender dónde aparecen estas oportunidades puede ser tan importante como el propio descuento.
        </p>
        <p className="mb-6">
            Como inversor, entender la dinámica de esta zona es crucial para identificar oportunidades reales frente a activos que simplemente están sobrevalorados.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
            <div className="bg-slate-100 p-4 rounded-xl text-center"><p className="text-sm text-slate-500">Subastas</p><p className="text-2xl font-bold">{metrics.count}</p></div>
            <div className="bg-slate-100 p-4 rounded-xl text-center"><p className="text-sm text-slate-500">Descuento medio</p><p className="text-2xl font-bold">{metrics.avgDiscount}%</p></div>
            <div className="bg-slate-100 p-4 rounded-xl text-center"><p className="text-sm text-slate-500">Precio m²</p><p className="text-2xl font-bold">{metrics.avgPriceM2.toLocaleString('es-ES')}€</p></div>
            <div className="bg-slate-100 p-4 rounded-xl text-center"><p className="text-sm text-slate-500">Tipo principal</p><p className="text-2xl font-bold">{metrics.predominantType}</p></div>
        </div>

        <h2 className="text-2xl font-bold mb-4">Perfil de las oportunidades detectadas en {zone}</h2>
        <p className="mb-4">
            {metrics.count > 3 
                ? `El mercado en ${zone} está muy activo con ${metrics.count} subastas. Predominan los activos de tipo ${metrics.predominantType.toLowerCase()}, lo que sugiere un interés específico en este segmento.` 
                : `La actividad en ${zone} es moderada con ${metrics.count} subastas. Se observan principalmente activos de tipo ${metrics.predominantType.toLowerCase()}.`}
        </p>

        <h2 className="text-2xl font-bold mb-4">Rango de precios que se está viendo en {zone}</h2>
        <p className="mb-4">
            Los activos analizados presentan tasaciones que oscilan entre los {metrics.minAppraisal.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})} y los {metrics.maxAppraisal.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}. Este rango permite adaptar la estrategia de inversión a diferentes perfiles de capital.
        </p>

        <h2 className="text-2xl font-bold mb-4">Qué suelen analizar primero los inversores en {zone}</h2>
        <ul className="list-disc list-inside mb-8 text-slate-700">
            <li>Relación deuda / tasación</li>
            <li>Precio por m² frente al mercado</li>
            <li>Concentración de subastas en la zona</li>
            <li>Posibles cargas registrales</li>
        </ul>

        <h2 className="text-2xl font-bold mb-4">Subastas activas detectadas en {zone}</h2>
        {filteredAuctions.length > 0 ? (
            <div className="grid gap-4">
                {filteredAuctions.map(a => (
                    <div key={a.slug || a.boeId} className="p-6 border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-bold mt-0 mb-2">{a.propertyType} - {a.address}</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                            <p>Tasación: {a.appraisalValue?.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</p>
                            <p>Deuda: {a.claimedDebt?.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</p>
                            <p className="font-bold text-brand-700">Descuento: {a.appraisalValue && a.claimedDebt ? Math.round((1 - a.claimedDebt / a.appraisalValue) * 100) : 0}%</p>
                        </div>
                        <Link to={`/ejemplo-subasta/${a.slug}`} className="inline-block mt-4 text-brand-600 font-bold">Ver ficha →</Link>
                    </div>
                ))}
            </div>
        ) : (
            <p>No hay subastas activas en esta zona actualmente.</p>
        )}

        <div className="bg-sky-50 border border-sky-100 p-8 rounded-2xl mt-12 mb-8">
            <h3 className="text-sky-900 mt-0">¿Quieres recibir alertas?</h3>
            <p className="text-sky-800">📲 Si quieres recibir nuevas subastas detectadas en {zone} antes de que aparezcan en otros portales, puedes seguir el canal de alertas.</p>
            <a href="https://t.me/activosOffmarket" target="_blank" rel="noopener noreferrer" className="inline-block bg-sky-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-700 mt-4">Canal Telegram</a>
        </div>

        <h2 className="text-2xl font-bold mb-4">Qué señales suelen mirar los inversores antes de pujar</h2>
        <p className="mb-4">
            Los inversores experimentados en {zone} priorizan la validación de la situación posesoria del inmueble y el análisis de las cargas registrales. Es fundamental verificar si el activo está ocupado y qué deudas podrían subrogarse antes de realizar cualquier puja.
        </p>

        <div className="bg-slate-900 text-white p-8 rounded-2xl mt-12">
            <h3 className="text-white mt-0">¿Necesitas ayuda con tu inversión?</h3>
            <p className="text-slate-300">Revisa las oportunidades activas, utiliza nuestra calculadora de rentabilidad o solicita un análisis avanzado para tu próxima puja.</p>
            <div className="flex gap-4 mt-6">
                <Link to={`/subastas/${city}/${zone}`} className="bg-brand-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-700">Oportunidades</Link>
                <Link to="/calculadora-subastas" className="bg-white text-slate-900 font-bold py-2 px-4 rounded-lg hover:bg-slate-200">Calculadora</Link>
            </div>
        </div>
    </div>
  );
};
export default NeighborhoodInvestmentAnalysis;
