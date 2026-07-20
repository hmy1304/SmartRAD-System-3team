import type { IconName } from "@/data/landingData";

interface FeatureIconProps {
  name: IconName;
}

export default function FeatureIcon({ name }: FeatureIconProps) {
  const paths: Record<IconName, React.ReactNode> = {
    organization: (
      <>
        <path d="M4 20h16" />
        <path d="M6 20V8l6-4 6 4v12" />
        <path d="M9 12h2v2H9zM13 12h2v2h-2zM9 16h2v2H9zM13 16h2v2h-2z" />
      </>
    ),
    people: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19c.5-4 2.5-6 5.5-6s5 2 5.5 6" />
        <circle cx="17" cy="9" r="2" />
        <path d="M15.5 14.5c3 .2 4.5 1.8 5 4.5" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v5l3 2" />
      </>
    ),
    welfare: (
      <>
        <path d="M7 4h10v16H7z" />
        <path d="M9 2h6v4H9zM10 10h4M10 14h4" />
      </>
    ),
  };

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
