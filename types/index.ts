export interface NavItem {
  label: string;
  href: string;
}

export interface Category {
  id: string;
  label: string;
  image: string;
  tag: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  tag: string;
  badge?: string;
}

export interface SubHeroCard {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  image: string;
  bgColor: string;
}

export interface FooterColumn {
  heading: string;
  links: { label: string; href: string }[];
}
