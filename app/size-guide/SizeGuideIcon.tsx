import type { SVGProps } from "react";
import type { FeatureIcon } from "./data";

type IconProps = SVGProps<SVGSVGElement>;

function GemIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} {...props}>
      <path d="M6 3h12l3 5-9 13L3 8Z" strokeLinejoin="round" />
      <path d="M3 8h18M8.5 3 6 8l6 13M15.5 3 18 8l-6 13" strokeLinejoin="round" />
    </svg>
  );
}

function SparklesIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} {...props}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2" strokeLinecap="round" />
      <path d="M12 8a4 4 0 0 0 4 4 4 4 0 0 0-4 4 4 4 0 0 0-4-4 4 4 0 0 0 4-4Z" strokeLinejoin="round" />
    </svg>
  );
}

function RulerIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} {...props}>
      <path d="m3 16 8-13 10 6-8 13Z" strokeLinejoin="round" />
      <path d="m9 5 2 3.4M12.5 8.5l2 3.4M6 10.5l2 3.4" strokeLinecap="round" />
    </svg>
  );
}

function TagIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} {...props}>
      <path
        d="M11.5 3.5H5A1.5 1.5 0 0 0 3.5 5v6.5a1.5 1.5 0 0 0 .44 1.06l9 9a1.5 1.5 0 0 0 2.12 0l6.94-6.94a1.5 1.5 0 0 0 0-2.12l-9-9A1.5 1.5 0 0 0 11.5 3.5Z"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="8" r="1.4" />
    </svg>
  );
}

function AwardIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} {...props}>
      <circle cx="12" cy="8.5" r="5.5" />
      <path d="m8 13.5-1.5 7L12 18l5.5 2.5-1.5-7" strokeLinejoin="round" />
    </svg>
  );
}

const registry: Record<FeatureIcon, (props: IconProps) => JSX.Element> = {
  gem: GemIcon,
  sparkles: SparklesIcon,
  ruler: RulerIcon,
  tag: TagIcon,
  award: AwardIcon,
};

export function FeatureGlyph({ icon, ...props }: { icon: FeatureIcon } & IconProps) {
  const Icon = registry[icon];
  return <Icon {...props} />;
}

export function TapeMeasureIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 6v2M17 8.5l-1.4 1.4M6.6 9.9 5.2 8.5M6 12h2M16 12h2M8.5 16l-1 1.7M16.5 16l1 1.7" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2.2" />
    </svg>
  );
}

export function HangerIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} {...props}>
      <path d="M12 4a1.8 1.8 0 1 1 1.8 1.8" strokeLinecap="round" />
      <path d="M12 5.8 3 12.5a1.4 1.4 0 0 0 .85 2.5h16.3a1.4 1.4 0 0 0 .85-2.5Z" strokeLinejoin="round" />
      <path d="M4 17.5h16" strokeLinecap="round" />
    </svg>
  );
}