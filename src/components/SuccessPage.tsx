import React, { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { toast } from 'sonner';

const SuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { isLogged, updatePlan, isLoading } = useUser();
  const hasProcessed = useRef(false);

  useEffect(() => {
    const processSubscription = async () => {
      if (isLoading) return;
      if (hasProcessed.current) return;
      
      const plan = searchParams.get('plan');
      
      if (isLogged && plan && (plan === 'basic' || plan === 'pro')) {
        hasProcessed.current = true;
        try {
          await updatePlan(plan as 'basic' | 'pro');
          toast.success(`Plan ${plan.toUpperCase()} activado correctamente`);
        } catch (error) {
          console.error('Error updating plan:', error);
          toast.error('Hubo un problema al actualizar tu plan.');
        }
      }
    };

    processSubscription();
  }, [isLogged, isLoading, searchParams, updatePlan]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} />
        </div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-4">
          Plan activado correctamente
        </h1>
        <p className="text-slate-600 mb-8">
          Ya puedes analizar subastas sin límites y acceder a todas las herramientas
        </p>
        <div className="flex flex-col gap-3">
          <Link 
            to="/"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition-colors"
          >
            Ver subastas <ArrowRight size={18} />
          </Link>
          <Link 
            to="/pro"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
          >
            Ir a mi plan
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
