// lib/discount.ts
export interface Discount {
  id: string;
  percentage: number; // 0–100
  startDate: string;  // ISO date string "YYYY-MM-DD"
  endDate: string;    // ISO date string "YYYY-MM-DD"
  active: boolean;
}

export const DISCOUNT_DOC_ID = "current"; // single doc in "discounts" collection

/** Returns true if the discount is currently live */
export function isDiscountActive(d: Discount | null): boolean {
  if (!d || !d.active) return false;
  const now = new Date();
  const start = new Date(d.startDate);
  const end = new Date(d.endDate);
  end.setHours(23, 59, 59, 999); // inclusive end-of-day
  return now >= start && now <= end;
}

/** Apply discount to a price, returns the discounted price */
export function applyDiscount(price: number, discount: Discount | null): number {
  if (!discount || !isDiscountActive(discount)) return price;
  return parseFloat((price * (1 - discount.percentage / 100)).toFixed(2));
}