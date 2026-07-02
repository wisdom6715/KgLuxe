// /category/[slug]/data.ts

export interface CategoryBlock {
  id: string;
  label: string;
  image: string;
  row: number; // groups tiles into rows
  span: number; // md+ column width out of 12
  labelPosition?: "below" | "overlay"; // default "below"
  cta?: string; // overlay button text, only used with labelPosition "overlay"
  href?: string;
  heightClass?: string; // optional Tailwind height override
}

export interface TextPanelLink {
  label: string;
  href: string;
}

export interface CategoryTextPanel {
  image: string;
  imageLabel: string;
  title: string;
  description: string;
  links: TextPanelLink[];
}

export type SectionType = "grid" | "text-panel" | "pill-grid" | "feature";

export interface CategoryData {
  slug: string;
  title: string;
  meta: string;
  type: SectionType;
  blocks?: CategoryBlock[]; // used by "grid" and "feature"
  textPanel?: CategoryTextPanel; // used by "text-panel"
  pills?: string[]; // used by "pill-grid"
}


export const categories: CategoryData[] = [
  {
    slug: "women",
    title: "Women",
    meta: "10 CATEGORIES",
    type: "grid",
    blocks: [
      {
        id: "dresses-gowns",
        label: "Dresses & Gowns",
        image: "/images/gown.png",
        row: 1,
        span: 7,
        labelPosition: "overlay",
        cta: "EXPLORE",
        href: "/products/dresses-gowns",
        heightClass: "h-[420px] md:h-[480px]",
      },
      {
        id: "kaftans-abayas",
        label: "Kaftans & Abayas",
        image: "/images/abaya.png",
        row: 1,
        span: 5,
        href: "/products/kaftans-abayas",
        heightClass: "h-[420px] md:h-[480px]",
      },
      {
        id: "kimonos-boubou",
        label: "Abayas & Modest Wear",
        image: "/images/women-heels.png",
        row: 2,
        span: 4,
        href: "/products/kimonos-boubou",
      },
      {
        id: "trousers",
        label: "Trousers & Sets",
        image: "/images/trouser.png",
        row: 2,
        span: 4,
        href: "/products/trousers-sets",
      },
      {
        id: "tops-blouses",
        label: "Tops & Blouses",
        image: "/images/kimono.png",
        row: 2,
        span: 4,
        href: "/products/tops-blouses",
      },
      {
        id: "jumpsuits-skirts",
        label: "Jumpsuits & Skirts",
        image: "/images/kimono.png",
        row: 2,
        span: 4,
        href: "/products/jumpsuits-skirts",
      },
    ],
  },
  {
    slug: "men",
    title: "Men",
    meta: "08 CATEGORIES",
    type: "grid",
    blocks: [
      {
        id: "shirts-trousers",
        label: "Shirts & Trousers",
        image: "/images/men.png",
        row: 1,
        span: 6,
        href: "/products/shirts-trousers",
        heightClass: "h-[420px] md:h-[480px]",
      },
      {
        id: "agbada-sequined",
        label: "Agbada & Sequined Wear",
        image: "/images/agbada.png",
        row: 2,
        span: 4,
        href: "/products/agbada-sequined"
      },
      {
        id: "tailoring-native",
        label: "Tailoring & Native Sets",
        image: "/images/senator.png",
        row: 1,
        span: 6,
        href: "/products/tailoring-native",
        heightClass: "h-[420px] md:h-[480px]",
      },
      {
        id: "jackets",
        label: "Jackets",
        image: "/images/men-jacket.jpg",
        row: 2,
        span: 4,
        href: "/products/jackets",
      },
      {
        id: "footwear",
        label: "Footwear",
        image: "/images/men-shoes.png",
        row: 2,
        span: 4,
        href: "/products/footwear",
      },
    ],
  },
  {
    slug: "children",
    title: "Children",
    meta: "GIRLS, BOYS & FOOTWEAR",
    type: "text-panel",
    textPanel: {
      image: "/images/children.png",
      imageLabel: "The Young Collection",
      title: "Matching Sets",
      description:
        "Explore our Father & Son and Mother & Daughter signature collections.",
      links: [
        { label: "Girls", href: "/products/girls" },
        { label: "Boys", href: "/products/boys" },
        { label: "Footwear", href: "/products/children-footwear" },
      ],
    },
  },
  {
    slug: "fabrics",
    title: "Fabrics",
    meta: "TEXTILES & TRADITIONS",
    type: "pill-grid",
    pills: [
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
  },
  {
    slug: "accessories",
    title: "Accessories",
    meta: "",
    type: "grid",
    blocks: [
      {
        id: "handbags",
        label: "Statement Handbags",
        image: "/images/bags.png",
        row: 1,
        span: 12,
        href: "/products/handbags",
        heightClass: "h-[460px] md:h-[560px]",
      },
      {
        id: "jewellery",
        label: "Statement Jewellery",
        image: "/images/jewellery.jpg",
        row: 2,
        span: 6,
        href: "/products/jewellery",
        heightClass: "h-[460px] md:h-[560px]",
      },
      {
        id: "shades",
        label: "Shades",
        image: "/images/shades.png",
        row: 2,
        span: 6,
        href: "/products/shades",
        heightClass: "h-[460px] md:h-[560px]",
      },
    ],
  },
  {
    slug: "occasion",
    title: "Occasion",
    meta: "",
    type: "feature",
    blocks: [
      {
        id: "wedding-bridal",
        label: "Wedding and Bridal",
        image: "/images/wedding.jpg",
        row: 1,
        span: 6,
        href: "/products/tailored-suiting",
        heightClass: "h-[460px] md:h-[560px]",
      },
      {
        id: "Family & Events",
        label: "Family and Events",
        image: "/images/family.png",
        row: 1,
        span: 6,
        href: "/products/tailored-suiting",
        heightClass: "h-[460px] md:h-[560px]",
      },
    ],
  },
];