export const MetricHighlight = {
  container: "bg-blue-50 p-4 rounded-xl text-center",
  label: "text-sm text-blue-600",
  value: "text-2xl font-bold text-blue-900",
};

export const MetricPositive = {
  container: "bg-emerald-50 p-4 rounded-xl text-center",
  label: "text-sm text-emerald-600",
  value: "text-2xl font-bold text-emerald-900",
};

export const MetricNeutral = {
  container: "bg-slate-100 p-4 rounded-xl text-center",
  label: "text-sm text-slate-600",
  value: "text-2xl font-bold text-slate-900",
};

export const MetricWarning = {
  container: "bg-orange-50 p-4 rounded-xl text-center",
  label: "text-sm text-orange-600",
  value: "text-2xl font-bold text-orange-900",
};

export const MetricTag = "bg-slate-100 px-3 py-1 rounded-full text-sm border border-slate-200 text-slate-700 hover:bg-slate-200 inline-block";

export const themeClasses = {
  discount: {
    high: "text-emerald-600 font-bold",
    medium: "text-orange-600 font-bold",
    low: "text-slate-500 font-bold",
  }
};

export const getDiscountColor = (discount: number | null | undefined) => {
  if (discount === null || discount === undefined) return themeClasses.discount.low;
  if (discount > 40) return themeClasses.discount.high;
  if (discount >= 20) return themeClasses.discount.medium;
  return themeClasses.discount.low;
};
