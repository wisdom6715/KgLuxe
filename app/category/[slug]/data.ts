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
        id: "dresses",
        label: "Dresses",
        image: "/images/gown.png",
        row: 1,
        span: 7,
        labelPosition: "overlay",
        cta: "EXPLORE",
        href: "/products/dresses",
        heightClass: "h-[420px] md:h-[480px]",
      },
      {
        id: "kaftans-boubou",
        label: "Kaftans & Boubou",
        image: "/category/kaftan-boubou.webp",
        row: 1,
        span: 5,
        href: "/products/kaftans-boubou",
        heightClass: "h-[420px] md:h-[480px]",
      },
      {
        id: "modest-wear",
        label: "Modest Wear",
        image: "/images/abaya.png",
        row: 2,
        span: 4,
        href: "/products/abayas",
      },
      {
        id: "ready-to-wear",
        label: "Ready To Wear",
        image: "/category/ready.webp",
        row: 2,
        span: 4,
        href: "/products/abayas",
      },
      {
        id: "couture",
        label: "Couture",
        image: "/category/couture.jpg",
        row: 2,
        span: 4,
        href: "/products/abayas",
      },
      {
        id: "african-heritage",
        label: "African Heritage",
        image: "/images/family.png",
        row: 2,
        span: 4,
        href: "/products/abayas",
      },
      {
        id: "mother-daughter",
        label: "Mother & Daughter",
        image: "/category/mother-daughter.jpg",
        row: 2,
        span: 4,
        href: "/products/trousers",
      },
      {
        id: "trousers",
        label: "Trousers & Sets",
        image: "/images/trouser.png",
        row: 2,
        span: 4,
        href: "/products/trousers",
      },
      {
        id: "two-piece-set",
        label: "Two Piece Set",
        image: "/category/blouse.webp",
        row: 2,
        span: 4,
        href: "/products/shirt-blouses",
      }
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
        image: "/category/shirt-trouser.jpg",
        row: 1,
        span: 6,
        href: "/products/shirt-trouser",
        heightClass: "h-[420px] md:h-[480px]",
      },
      {
        id: "african-heritage",
        label: "African Heritage",
        image: "/images/senator.png",
        row: 2,
        span: 4,
        href: "/products/african-heritage"
      },
      {
        id: "casual-luxe",
        label: "Casual Luxe",
        image: "/category/casual.jpg",
        row: 2,
        span: 4,
        href: "/products/casual-luxe",
      },
      {
        id: "formal-wear",
        label: "Formal Wear",
        image: "/category/formal.jpg",
        row: 1,
        span: 6,
        href: "/products/formal-wear",
        heightClass: "h-[420px] md:h-[480px]",
      },
      {
        id: "accessories",
        label: "Accessories",
        image: "/images/men-shoes.png",
        row: 2,
        span: 4,
        href: "/products/accessories",
      },
      {
        id: "father-son",
        label: "Father and Son",
        image: "/category/father-son.jpg",
        row: 2,
        span: 4,
        href: "/products/father-son",
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
        { label: "Baby", href: "/products/baby" },
        { label: "bag", href: "/products/bag" },
        { label: "family-matching", href: "/products/family-matching" },
        { label: "special-occasion", href: "/products/special-occassion" },
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
      "Luxury Lace",
      "Brocade and Jacquard",
      "Silk and Satin",
      "Linen and Cotton",
      "Luxury Organza",
      "Exclusive Print",
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
        id: "bags",
        label: "Bags",
        image: "/images/accessories.png",
        row: 1,
        span: 12,
        href: "/products/bags",
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
        id: "heels",
        label: "Heels",
        image: "/images/women-heels.png",
        row: 2,
        span: 6,
        href: "/products/jewellery",
        heightClass: "h-[460px] md:h-[560px]",
      },
      {
        id: "scarves-and-shawls",
        label: "Scarves and Shawls",
        image: "/category/scarves.webp",
        row: 2,
        span: 6,
        href: "/products/jewellery",
        heightClass: "h-[460px] md:h-[560px]",
      },
      {
        id: "headwraps",
        label: "Headwraps",
        image: "/category/headwraps.jpg",
        row: 2,
        span: 6,
        href: "/products/headwraps",
        heightClass: "h-[460px] md:h-[560px]",
      },
      {
        id: "belt",
        label: "Belt",
        image: "/category/belt.jpg",
        row: 2,
        span: 6,
        href: "/products/belt",
        heightClass: "h-[460px] md:h-[560px]",
      }
    ],
  },
  {
    slug: "occasion",
    title: "Occasion",
    meta: "",
    type: "feature",
    blocks: [
      {
        id: "bridal",
        label: "Wedding and Bridal",
        image: "/images/wedding.jpg",
        row: 1,
        span: 6,
        href: "/products/bridal",
        heightClass: "h-[460px] md:h-[560px]",
      },
      {
        id: "family-matching",
        label: "Family and Events",
        image: "/images/family.png",
        row: 1,
        span: 6,
        href: "/products/family-matching",
        heightClass: "h-[460px] md:h-[560px]",
      }
    ],
  },
];