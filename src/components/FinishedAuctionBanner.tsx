import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { ROUTES } from '../constants/routes';

interface FinishedAuctionBannerProps {
  auctionDate?: string;
}

const FinishedAuctionBanner: React.FC<FinishedAuctionBannerProps> = ({ auctionDate }) => {
  const formattedDate = auctionDate ? new Date(auctionDate).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : 'recientemente';

  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg shadow-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Clock className="h-6 w-6 text-amber-500" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1 md:flex md:justify-between md:items-center">
          <div>
            <h3 className="text-sm font-bold text-amber-800">
              ⏱️ Demasiado tarde.
            </h3>
            <div className="mt-1 text-sm text-amber-700">
              <p>
                Esta subasta fue adjudicada el {formattedDate}. Oportunidades similares aparecen cada semana.
              </p>
            </div>
          </div>
          <div className="mt-3 md:mt-0 md:ml-6">
            <Link
              to={ROUTES.RECENT_AUCTIONS} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
            >
              Ver subastas activas
              <ArrowRight className="ml-2 -mr-1 h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinishedAuctionBanner;
