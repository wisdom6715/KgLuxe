export interface User {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  avatarUrl?: string;
}

export interface Order {
  id: string;
  productName: string;
  orderNumber: string;
  date: string;
  status: "Purchased" | "Sold" | "Swapped" | "Repaired";
  price: number;
  imageUrl?: string;
}

export interface Address {
  id: string;
  label: string;
  phone_number: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  inStock: boolean;
}
