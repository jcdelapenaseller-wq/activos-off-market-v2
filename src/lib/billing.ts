export type PlanTier = 'basic' | 'pro';
export type BillingCycle = 'monthly' | 'quarterly' | 'yearly';

const PAYMENT_LINKS: Record<PlanTier, Record<BillingCycle, string>> = {
  basic: {
    monthly: 'https://buy.stripe.com/28E3cxeCXdKpfOlep2djO05',
    quarterly: 'https://buy.stripe.com/00w4gB3Yj9u96dL80EdjO07',
    yearly: 'https://buy.stripe.com/9B600l0M79u9cC9cgUdjO06',
  },
  pro: {
    monthly: 'https://buy.stripe.com/fZu4gB0M7fSxeKh6WAdjO0b',
    quarterly: 'https://buy.stripe.com/9B6dRbfH1cGl1Xv6WAdjO0a',
    yearly: 'https://buy.stripe.com/00w6oJcuPdKpgSpbcQdjO09',
  }
};

export const startCheckout = async (plan: PlanTier, cycle: BillingCycle) => {
  const paymentLink = PAYMENT_LINKS[plan][cycle];
  console.log(`Redirecting to Stripe checkout for ${plan} (${cycle})`);
  
  // Redirect directly to the Stripe Payment Link
  window.location.href = paymentLink;
};
