import type { IconName } from "@/data/landingData";

interface FeatureIconProps {
  name: IconName;
}

export default function FeatureIcon({ name }: FeatureIconProps) {
  const paths: Record<IconName, React.ReactNode> = {
    organization: (
      <>
        <path d="M6 22V4C6 3.46957 6.21071 2.96086 6.58579 2.58579C6.96086 2.21071 7.46957 2 8 2H16C16.5304 2 17.0391 2.21071 17.4142 2.58579C17.7893 2.96086 18 3.46957 18 4V22H6Z"/>
        <path d="M6 12H4C3.46957 12 2.96086 12.2107 2.58579 12.5858C2.21071 12.9609 2 13.4696 2 14V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H6"/>
        <path d="M18 9H20C20.5304 9 21.0391 9.21071 21.4142 9.58579C21.7893 9.96086 22 10.4696 22 11V20C22 20.5304 21.7893 21.0391 21.4142 21.4142C21.0391 21.7893 20.5304 22 20 22H18"/>
        <path d="M10 6H14"/>
        <path d="M10 10H14"/>
        <path d="M10 14H14"/>
        <path d="M10 18H14"/>
      </>
    ),
    people: (
      <>
        <circle cx="9" cy="8" r="3"/>
        <path d="M3.5 19c.5-4 2.5-6 5.5-6s5 2 5.5 6"/>
        <circle cx="17" cy="9" r="2"/>
        <path d="M15.5 14.5c3 .2 4.5 1.8 5 4.5"/>
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
        <path d="M15 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V7L15 2Z"/>
        <path d="M14 2V6C14 6.53043 14.2107 7.03914 14.5858 7.41421C14.9609 7.78929 15.4696 8 16 8H20"/>
        <path d="M10 9H8"/>
        <path d="M16 13H8"/>
        <path d="M16 17H8"/>
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
