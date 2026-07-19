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

export interface CheckoutItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  imageUrl: string;
  size: string | null;
  color: string | null;
  quantity: number;
}