import type { NavItem, Category, Product, SubHeroCard, FooterColumn } from "@/types";

export const navItems: NavItem[] = [
  { label: "Shop", href: "#" },
  { label: "About", href: "#" },
  { label: "FAQs", href: "#" },
];

export const subNavItems: NavItem[] = [
  { label: "All", href: "/products/all" },
  { label: "Women", href: "/category/women" },
  { label: "Men", href: "/category/men" },
  { label: "Children", href: "/category/children" },
  { label: "Fabrics", href: "/category/fabrics" },
  { label: "Accessories", href: "/category/accessories" },
  { label: "Occasion", href: "/category/occasion" },
  { label: "Custom", href: "/category/custom-wear" },
];

export const hero = {
  title: "Summer Arrival of Outfit",
  subtitle: "Discover quality fashion that reflects your style and makes everyday enjoyable.",
  ctaLabel: "Explore Product",
  image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1400&q=80",
};

export const subHeroCards: SubHeroCard[] = [
  {
    id: "sh-1",
    title: "Where dreams",
    subtitle: "meet couture",
    ctaLabel: "Shop Now",
    image: "/images/men-welcome.png",
    bgColor: "#EDE8E0",
  },
  {
    id: "sh-2",
    title: "Enchanting styles",
    subtitle: "for every women",
    ctaLabel: "Shop Now",
    image: "/images/women-welcome.jpg",
    bgColor: "#E8E8E8",
  },
];

export const categoryTabs = ["All", "Women","Men", "Children"];

export const categories: Category[] = [
  {
    id: "cat-1",
    label: "Shoes",
    image: "/images/footwear.png",
    tag: "SHOES",
  },
  {
    id: "cat-2",
    label: "Accessories",
    image: "/images/jewellery.jpg",
    tag: "ACCESSORIES",
  },
  {
    id: "cat-3",
    label: "Bags",
    image: "/images/accessories.png",
    tag: "BAG",
  },
  {
    id: "cat-4",
    label: "men",
    image: "/images/men-category.png",
    tag: "Men",
  },
];

export const productTabs = ["All", "Shorts", "Jackets", "Shoes", "T-Shirt"];

export const products: Product[] = [
  {
    id: "p-1",
    name: "Cloud Knit Sweatshirt",
    price: 185,
    image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80",
    category: "Apparel",
    tag: "APPAREL",
  },
  {
    id: "p-2",
    name: "The Horizon Timepiece",
    price: 450,
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80",
    category: "Accessories",
    tag: "ACCESSORIES",
  },
  {
    id: "p-3",
    name: "Tailored Summer Shorts",
    price: 120,
    image: "https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=600&q=80",
    category: "Apparel",
    tag: "APPAREL",
  },
  {
    id: "p-4",
    name: "Linen Blazer",
    price: 320,
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80",
    category: "Jackets",
    tag: "JACKETS",
    badge: "NEW",
  },
  {
    id: "p-5",
    name: "Minimalist Leather Derby",
    price: 210,
    image: "https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?w=600&q=80",
    category: "Shoes",
    tag: "SHOES",
  },
  {
    id: "p-6",
    name: "Essential Crew Tee",
    price: 65,
    image: "https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=600&q=80",
    category: "T-Shirt",
    tag: "T-SHIRT",
  },
];

export const footerColumns: FooterColumn[] = [
  {
    heading: "Explore",
    links: [
      { label: "New Arrivals", href: "#" },
      { label: "Men's Collection", href: "#" },
      { label: "Women's Collection", href: "#" },
      { label: "Accessories", href: "#" },
    ],
  },
  {
    heading: "Help",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Shipping & Returns", href: "#" },
      { label: "Contact Us", href: "#" },
    ],
  },
];
