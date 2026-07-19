export interface MeasurementPair {
  in: string;
  cm: string;
}

export interface FittedSize {
  size: string;
  uk: string;
  us: string;
  eu: string;
  bust: MeasurementPair;
  waist: MeasurementPair;
  hip: MeasurementPair;
  length: MeasurementPair;
}

export interface FreeSize {
  size: string;
  uk: string;
  bust: MeasurementPair;
  waist: MeasurementPair;
  hip: MeasurementPair;
}

export interface LengthOption {
  option: string;
  label: string;
  inches: string;
  cm: string;
}

export interface MeasureStep {
  number: string;
  title: string;
  description: string;
}

export type FeatureIcon = "gem" | "sparkles" | "ruler" | "tag" | "award";

export interface Feature {
  label: string;
  icon: FeatureIcon;
}

export const fittedSizes: FittedSize[] = [
  {
    size: "S",
    uk: "8 — 10",
    us: "4 — 6",
    eu: "36 — 38",
    bust: { in: "34-36", cm: "86-91" },
    waist: { in: "28-30", cm: "71-76" },
    hip: { in: "38-40", cm: "97-102" },
    length: { in: "56-58", cm: "142-147" },
  },
  {
    size: "M",
    uk: "12 — 14",
    us: "8 — 10",
    eu: "40 — 42",
    bust: { in: "38-40", cm: "97-102" },
    waist: { in: "32-34", cm: "81-86" },
    hip: { in: "42-44", cm: "107-112" },
    length: { in: "58-60", cm: "147-152" },
  },
  {
    size: "L",
    uk: "16 — 18",
    us: "12 — 14",
    eu: "44 — 46",
    bust: { in: "42-44", cm: "107-112" },
    waist: { in: "36-38", cm: "91-97" },
    hip: { in: "46-48", cm: "117-122" },
    length: { in: "60-62", cm: "152-157" },
  },
  {
    size: "XL",
    uk: "20",
    us: "16",
    eu: "48",
    bust: { in: "46-48", cm: "117-122" },
    waist: { in: "40-42", cm: "102-107" },
    hip: { in: "50-52", cm: "127-132" },
    length: { in: "62-64", cm: "157-163" },
  },
  {
    size: "XXL",
    uk: "22 — 24",
    us: "18 — 20",
    eu: "50 — 52",
    bust: { in: "50-52", cm: "127-132" },
    waist: { in: "44-46", cm: "112-117" },
    hip: { in: "54-56", cm: "137-142" },
    length: { in: "62-64", cm: "157-163" },
  },
];

export const freeSizes: FreeSize[] = [
  {
    size: "S",
    uk: "8 — 10",
    bust: { in: "42", cm: "107" },
    waist: { in: "36", cm: "91" },
    hip: { in: "44", cm: "112" },
  },
  {
    size: "M",
    uk: "12 — 14",
    bust: { in: "46", cm: "117" },
    waist: { in: "40", cm: "102" },
    hip: { in: "48", cm: "122" },
  },
  {
    size: "L",
    uk: "16 — 18",
    bust: { in: "50", cm: "127" },
    waist: { in: "44", cm: "112" },
    hip: { in: "52", cm: "132" },
  },
  {
    size: "XL",
    uk: "20",
    bust: { in: "54", cm: "137" },
    waist: { in: "48", cm: "122" },
    hip: { in: "56", cm: "142" },
  },
  {
    size: "XXL",
    uk: "22 — 24",
    bust: { in: "60", cm: "152" },
    waist: { in: "54", cm: "137" },
    hip: { in: "60", cm: "152" },
  },
];

export const lengthOptions: LengthOption[] = [
  { option: "Option 01", label: "Petite", inches: "54 — 56 in", cm: "137 — 142 cm" },
  { option: "Option 02", label: "Regular", inches: "58 — 60 in", cm: "147 — 152 cm" },
  { option: "Option 03", label: "Tall", inches: "62 — 64 in", cm: "157 — 163 cm" },
];

export const measureSteps: MeasureStep[] = [
  {
    number: "01",
    title: "Burst (Bust)",
    description:
      "Measure around the fullest part of your bust, keeping the tape straight across your back.",
  },
  {
    number: "02",
    title: "Waist",
    description:
      "Measure around the smallest part of your waist, typically just above the navel.",
  },
  {
    number: "03",
    title: "Hip",
    description:
      "Measure around the fullest part of your hips, making sure the tape is level.",
  },
  {
    number: "04",
    title: "Length",
    description:
      "Measure from your shoulder (or highest point) down to your desired length on the floor.",
  },
];

export const features: Feature[] = [
  { label: "Premium Quality", icon: "gem" },
  { label: "Timeless Elegance", icon: "sparkles" },
  { label: "Designed to Stand Apart", icon: "ruler" },
  { label: "Exclusive Style", icon: "tag" },
  { label: "Luxury Details", icon: "award" },
];