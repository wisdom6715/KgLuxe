// app/[product_id]/data.ts

export interface ProductData {
  id: string;
  breadcrumb: string[]; // e.g. ["Shop", "Dresses", "New Arrivals"]
  name: string;
  price: number; // major currency unit, e.g. 184000 for 
  currency: string; // ISO code, e.g. "USD"
  description: string;
  sizes: string[];
  mainImage: { src: string; alt: string };
  galleryImages: { src: string; alt: string }[]; // shown as a 2-up row below the main image
  details: string; // accordion: "Details & Composition"
  shipping: string; // accordion: "Shipping & Returns"
}

export const products: ProductData[] = [
  {
    id: "onari-dress",
    breadcrumb: ["Shop", "Dresses", "New Arrivals"],
    name: "Onari Dress",
    price: 184000,
    currency: "NGN",
    description:
      "An exploration of form and materiality. The Onari Dress features a structural silhouette rendered in our signature heavy-weight organic cotton. Designed with architectural seams that create a fluid yet defined shape, it bridges the gap between sculptural art and wearable utility.",
    sizes: ["S", "M", "L", "XL"],
    mainImage: {
      src: "/hero.png",
      alt: "Onari Dress — full length, front view",
    },
    galleryImages: [
      {
        src: "/hero.png",
        alt: "Onari Dress fabric close-up",
      },
      {
        src: "/hero.png",
        alt: "Onari Dress flat lay",
      },
    ],
    details:
      "100% heavy-weight organic cotton. Structural bodice with architectural seaming. Asymmetric tiered hem. Fully lined. Made in Italy.",
    shipping:
      "Free standard shipping on all orders. Delivered within 3–5 business days. Free returns within 30 days of delivery.",
  },
];