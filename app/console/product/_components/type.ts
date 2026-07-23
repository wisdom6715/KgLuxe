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
    "dresses",
    "kimonos",
    "abayas",
    "kaftans-boubou",
    "jumpsuits",
    "shirt-blouses",
    "trousers",
    "skirts",
    "mother-daughter",
    "footwears"
  ],
  men: [
    "african-heritage",
    "modern-classics",
    "formal-wear",
    "casual-luxe",
    "accessories",
    "father-son"
  ],
  fabrics: [
    "ankara",
    "luxury-lace",
    "brocade-and-jacquard",
    "silk-and-akin",
    "linen-and-cotton",
    "luxury-organza",
    "exclusive-print",
    "aso-oke",
    "Velvet",
  ],
  accessories: ["jewellery", "shades", "scarves-and-shawls", "bags", "headwraps", "belt", "luxury-gift-shirts"],
  occasion: ["bridal", "family-matching", "party-wear-(aso-ebi)", "mother of the Bride", "Wedding Guest"],
  children: ["boy", "girls", "footwear", "baby", "family-matching", "bag", "special-occassion"],
};

export const SIZES = ["SM", "M", "L", "XL", "XXL", "CUSTOM"] as const;
export type SizeValue = (typeof SIZES)[number];

export const COLORS = [
  "Black",
  "White",
  "Red",
  "Green",
  "Blue",
  "Gold",
  "Silver",
  "Beige",
  "Navy",
  "Brown",
  "Maroon",
  "Cream",
  "Grey",
] as const;

export const LOW_STOCK_THRESHOLD = 15;
export const MAX_PRODUCT_IMAGES = 5;

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export function getStockStatus(stock: number): StockStatus {
  if (stock <= 0) return "out-of-stock";
  if (stock < LOW_STOCK_THRESHOLD) return "low-stock";
  return "in-stock";
}

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
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Shape used while building the create-product form, before it becomes a
// Firestore document (no id/sku/imagePaths yet — those are generated on submit).
export interface ProductFormState {
  name: string;
  description: string;
  price: string; // kept as string while editing, parsed to number on submit
  stock: string;
  sizes: string[];
  colors: string[];
  category: CategoryValue | "";
  subCategory: string;
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
};