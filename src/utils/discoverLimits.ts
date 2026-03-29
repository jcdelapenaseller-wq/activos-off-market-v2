import { AUCTIONS, AuctionData } from '../data/auctions';
import { isAuctionFinished } from './auctionHelpers';
import { normalizeProvince, normalizePropertyType } from './auctionNormalizer';

const PRIORITY_PROVINCES = [
  'Madrid',
  'Barcelona',
  'Valencia',
  'Sevilla',
  'Málaga',
  'Alicante',
  'Murcia'
];

const MIN_AUCTIONS_FOR_QUALITY = 5;

export interface ProvinceStats {
  province: string;
  totalActive: number;
  hasVivienda: boolean;
  totalCount: number;
  maxOpportunityScore: number;
}

/**
 * Checks if a province meets the criteria for Discover generation.
 */
export const isProvinceEligible = (province: string, auctions: Record<string, AuctionData>): boolean => {
  const normalizedTarget = normalizeProvince(province).toLowerCase();
  
  const provinceAuctions = Object.values(auctions).filter(a => {
    const p = normalizeProvince(a.province || a.city).toLowerCase();
    return p === normalizedTarget || p.includes(normalizedTarget) || normalizedTarget.includes(p);
  });

  const activeAuctions = provinceAuctions.filter(a => !isAuctionFinished(a.auctionDate));
  
  // 1. No generar si subastas activas = 0
  if (activeAuctions.length === 0) return false;

  // 2. No generar si solo 1 subasta (total)
  if (provinceAuctions.length <= 1) return false;

  // 3. No generar si todas opportunityScore < 25
  const hasGoodOpportunity = activeAuctions.some(a => (a.opportunityScore || 0) >= 25);
  if (!hasGoodOpportunity) return false;

  const hasVivienda = activeAuctions.some(a => {
    const type = normalizePropertyType(a.propertyType);
    return type === 'Piso' || type === 'Chalet';
  });

  // 4. hasVivienda (existing rule)
  return hasVivienda;
};

/**
 * Determines if an article is considered "High Quality" for Google News/Discover.
 */
export const isHighQualityProvinceArticle = (province: string, auctions: Record<string, AuctionData>): boolean => {
  const normalizedTarget = normalizeProvince(province).toLowerCase();
  
  const provinceAuctions = Object.values(auctions).filter(a => {
    const p = normalizeProvince(a.province || a.city).toLowerCase();
    return p === normalizedTarget || p.includes(normalizedTarget) || normalizedTarget.includes(p);
  });

  const activeAuctions = provinceAuctions.filter(a => !isAuctionFinished(a.auctionDate));
  const isPriority = PRIORITY_PROVINCES.some(p => normalizeProvince(p).toLowerCase() === normalizedTarget);
  
  // High quality if:
  // - Priority province
  // - OR >= 5 active auctions
  return isPriority || activeAuctions.length >= MIN_AUCTIONS_FOR_QUALITY;
};

/**
 * Gets the list of 5 provinces allowed for today.
 */
export const getAllowedProvincesForToday = (): string[] => {
  // 1. Group auctions by province and check eligibility
  const provincesMap = new Map<string, ProvinceStats>();
  
  Object.values(AUCTIONS).forEach(a => {
    const p = normalizeProvince(a.province || a.city);
    if (!p) return;
    
    if (!provincesMap.has(p)) {
      provincesMap.set(p, { province: p, totalActive: 0, hasVivienda: false, totalCount: 0, maxOpportunityScore: 0 });
    }
    
    const stats = provincesMap.get(p)!;
    stats.totalCount += 1;
    
    if (!isAuctionFinished(a.auctionDate)) {
      stats.totalActive += 1;
      const score = a.opportunityScore || 0;
      if (score > stats.maxOpportunityScore) stats.maxOpportunityScore = score;
      
      const type = normalizePropertyType(a.propertyType);
      if (type === 'Piso' || type === 'Chalet') {
        stats.hasVivienda = true;
      }
    }
  });

  const allEligibleStats = Array.from(provincesMap.values())
    .filter(s => 
      s.totalActive > 0 && 
      s.totalCount > 1 && 
      s.hasVivienda && 
      s.maxOpportunityScore >= 25
    );

  if (allEligibleStats.length === 0) return [];

  // 2. Separate priority and high-volume from others
  const highQualityEligible = allEligibleStats.filter(s => {
    const isPriority = PRIORITY_PROVINCES.some(p => normalizeProvince(p).toLowerCase() === normalizeProvince(s.province).toLowerCase());
    return isPriority || s.totalActive >= MIN_AUCTIONS_FOR_QUALITY;
  }).map(s => s.province);
  
  const othersEligible = allEligibleStats.filter(s => {
    const isPriority = PRIORITY_PROVINCES.some(p => normalizeProvince(p).toLowerCase() === normalizeProvince(s.province).toLowerCase());
    return !isPriority && s.totalActive < MIN_AUCTIONS_FOR_QUALITY;
  }).map(s => s.province);

  // 3. Deterministic rotation based on date
  const now = new Date();
  const dayIndex = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
  
  const rotate = (arr: string[], count: number, seed: number) => {
    if (arr.length === 0) return [];
    const result: string[] = [];
    for (let i = 0; i < Math.min(count, arr.length); i++) {
      const idx = (seed + i) % arr.length;
      result.push(arr[idx]);
    }
    return result;
  };

  // Pick up to 5 from high quality (Priority + >=5 auctions)
  const selectedHighQuality = rotate(highQualityEligible, 5, dayIndex);
  
  // If we need more, pick from others
  const remainingCount = 5 - selectedHighQuality.length;
  const selectedOthers = remainingCount > 0 ? rotate(othersEligible, remainingCount, dayIndex) : [];

  return [...selectedHighQuality, ...selectedOthers];
};
