import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { Calculator } from 'lucide-react';

const ConversionBlock: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 my-12 shadow-sm text-center">
      <h3 className="text-2xl font-bold text-slate-900 mb-4">Calcular la puja máxima para una subasta</h3>
      <p className="text-slate-600 mb-6 max-w-xl mx-auto">
        Si estás analizando una subasta inmobiliaria, puedes estimar la rentabilidad y calcular la puja máxima recomendada utilizando nuestra calculadora de subastas.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Link 
          to={ROUTES.CALCULATOR} className="bg-brand-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-brand-700 transition-all"
        >
          Calcular puja máxima
        </Link>
      </div>
      <div className="mt-6 text-sm text-slate-500">
        ¿Necesitas ayuda? Consulta nuestros <Link 
          to={ROUTES.EXAMPLES_INDEX} className="text-brand-600 font-medium hover:underline"
        >
          ejemplos de subastas analizadas
        </Link> o revisa nuestra <Link 
          to={ROUTES.GUIDE_INDEX} className="text-brand-600 font-medium hover:underline"
        >
          guía de subastas
        </Link>.
      </div>
    </div>
  );
};

export default ConversionBlock;
