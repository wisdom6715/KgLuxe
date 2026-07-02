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
    "dresses-gowns",
    "kimonos-boubou",
    "kaftans-abayas",
    "jumpsuits-skirts",
    "tops-blouses",
    "trousers",
  ],
  men: [
    "agbada-sequined",
    "tailoring-native",
    "shirts-trousers",
    "footwear",
    "jackets",
  ],
  fabrics: [
    "Ankara",
    "Lace",
    "George",
    "Chiffon",
    "Organza",
    "Silk",
    "Adire",
    "Aso Oke",
    "Velvet",
  ],
  accessories: ["handbags", "jewellery", "shades"],
  occasion: ["wedding-bridal", "family-matching"],
  children: ["boy", "girls", "footwear"],
};

export const SIZES = ["SM", "M", "L", "XL", "XXL"] as const;
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
  imageUrl: string;
  imagePath: string; // storage path, kept so we can delete the file later
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Shape used while building the create-product form, before it becomes a
// Firestore document (no id/sku/imagePath yet — those are generated on submit).
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