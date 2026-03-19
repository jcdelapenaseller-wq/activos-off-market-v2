import { AUCTIONS } from './auctions';
import { getFilteredAuctions } from '../utils/auctionHelpers';

export const ACTIVE_AUCTIONS = getFilteredAuctions(AUCTIONS, 'active');
export const CLOSED_AUCTIONS = getFilteredAuctions(AUCTIONS, 'closed');
