// types/product.ts
import type { Timestamp } from "firebase/firestore";

export const CATEGORIES = [
  { value: "women", label: "Women" },
  { value: "men", label: "Men" },
  { value: "children", label: "Children" },
  { value: "fabrics", label: "Fabrics" },
  { value: "accessories", label: "Accessories" },
  { value: "occasion", label: "Bridal & Occasion Wear" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

export const SUBCATEGORIES: Record<CategoryValue, string[]> = {
  women: [
    "new-arrival",
    "ready-to-wear",
    "dresses",
    "couture",
    "african-heritage",
    "modest-wear",
    "kaftans-boubou",
    "two-piece-set",
    "mother-daughter",
  ],
  men: [
    "african-heritage",
    "modern-classics",
    "formal-wear",
    "casual-luxe",
    "accessories",
    "father-son",
  ],
  fabrics: [
    "ankara",
    "luxury-lace",
    "brocade-and-jacquard",
    "silk-and-satin",
    "linen-and-cotton",
    "luxury-organza",
    "exclusive-print",
    "aso-oke",
    "Velvet",
  ],
  accessories: ["jewellery", "heels", "shades", "scarves-and-shawls", "bags", "headwraps", "belt", "luxury-gift-shirts"],
  occasion: ["bridal", "family-matching", "party-wear-(aso-ebi)", "mother of the Bride", "Wedding Guest"],
  children: ["boy", "girls", "footwear", "baby", "family-matching", "bag", "special-occassion"],
};

export const SIZES = ["2-3", "4-5", "6-7", "8-9", "10-12", "SM", "M", "L", "XL", "XXL", "CUSTOM"] as const;
export type SizeValue = (typeof SIZES)[number];

// ─── Color swatches ───────────────────────────────────────────────────────────
// Maps the stored color NAME (used in Firestore/cart/filters) to a display HEX.
// Keep the keys identical to the strings in COLORS so lookups never miss.
export const COLOR_HEX_MAP: Record<string, string> = {
  Black: "#000000",
  Orange: "#FFA500",
  Pink: "#FFC0CB",
  "fuchsia pink": "#FF00FF",
  wine: "#722F37",
  "turquoise blue": "#40E0D0",
  "mint green": "#98FF98",
  Yellow: "#FFEB3B",
  Lavender: "#E6E6FA",
  lemonchiffon: "#FFFACD",
  ivory: "#FFFFF0",
  chocolate: "#7B3F00",
  khaki: "#C3B091",
  White: "#FFFFFF",
  Red: "#E53935",
  Green: "#2E7D32",
  Blue: "#1E5FBF",
  Gold: "#D4AF37",
  Silver: "#C0C0C0",
  Beige: "#F5F5DC",
  Navy: "#000080",
  Brown: "#795548",
  Maroon: "#800000",
  Cream: "#FFFDD0",
  Grey: "#808080",
};

export const COLORS = Object.keys(COLOR_HEX_MAP) as (keyof typeof COLOR_HEX_MAP)[];

export function getColorHex(colorName: string): string {
  return COLOR_HEX_MAP[colorName as keyof typeof COLOR_HEX_MAP] ?? "#D1D5DB";
}

export const LOW_STOCK_THRESHOLD = 15;
export const MAX_PRODUCT_IMAGES = 5;

// ─── Stock ────────────────────────────────────────────────────────────────────

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export function getStockStatus(stock: number): StockStatus {
  if (stock <= 0) return "out-of-stock";
  if (stock < LOW_STOCK_THRESHOLD) return "low-stock";
  return "in-stock";
}

// ─── Size-based pricing ───────────────────────────────────────────────────────

export interface SizePricing {
  sm: number | "";      // SM, M
  lxl: number | "";     // L, XL
  xxlCustom: number | ""; // XXL, CUSTOM
}

export const EMPTY_SIZE_PRICING: SizePricing = {
  sm: "",
  lxl: "",
  xxlCustom: "",
};

export function resolveSizePrice(
  product: Pick<Product, "price" | "sizePricing">,
  size: string
): number {
  const sp = product.sizePricing;
  if (!sp) return product.price;
  const s = size.toUpperCase();
  if ((s === "SM" || s === "M") && sp.sm !== "") return Number(sp.sm);
  if ((s === "L" || s === "XL") && sp.lxl !== "") return Number(sp.lxl);
  if ((s === "XXL" || s === "CUSTOM") && sp.xxlCustom !== "") return Number(sp.xxlCustom);
  return product.price;
}

// ─── Discount ─────────────────────────────────────────────────────────────────

export interface Discount {
  id: string;
  percentage: number; // 1–100
  startDate: string;  // "YYYY-MM-DD"
  endDate: string;    // "YYYY-MM-DD"
  active: boolean;
}

export const DISCOUNT_DOC_ID = "current";

export function isDiscountActive(d: Discount | null | undefined): boolean {
  if (!d || !d.active) return false;
  const now = new Date();
  const start = new Date(d.startDate);
  const end = new Date(d.endDate);
  end.setHours(23, 59, 59, 999);
  return now >= start && now <= end;
}

export function applyDiscount(price: number, d: Discount | null | undefined): number {
  if (!d || !isDiscountActive(d)) return price;
  return parseFloat((price * (1 - d.percentage / 100)).toFixed(2));
}

// ─── Product ──────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  sizes: string[];
  colors: string[];
  category: CategoryValue;
  subCategory: string;
  sku: string;
  /** Download URLs, in display order (first = cover image). Max 5. */
  imageUrls: string[];
  /** Firebase Storage paths, parallel to imageUrls — needed to delete files later. */
  imagePaths: string[];
  /** Optional per-tier pricing. Absent on older products — falls back to `price`. */
  sizePricing?: SizePricing;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// ─── Form state ───────────────────────────────────────────────────────────────

export interface ProductFormState {
  name: string;
  description: string;
  price: string;
  stock: string;
  sizes: string[];
  colors: string[];
  category: CategoryValue | "";
  subCategory: string;
  sizePricing: SizePricing;
}

export const EMPTY_PRODUCT_FORM: ProductFormState = {
  name: "",
  description: "",
  price: "",
  stock: "",
  sizes: [],
  colors: [],
  category: "",
  subCategory: "",
  sizePricing: EMPTY_SIZE_PRICING,
};

// ─── Cart item ────────────────────────────────────────────────────────────────

export interface CartItem {
  product_id: string;
  name: string;
  /** Effective price at add-time (after size tier + discount). Used for checkout. */
  price: number;
  /** Pre-discount, size-resolved price — for receipt display. */
  originalPrice: number;
  /** Discount % applied at add-time, or null if none was active. */
  discountApplied: number | null;
  imageUrl: string;
  stock: number;
  size: string | null;
  color: string | null;
  sizeMeasurements: Array<{ label: string; value: string }> | null;
  quantity: number;
  createdAt?: Timestamp;
}