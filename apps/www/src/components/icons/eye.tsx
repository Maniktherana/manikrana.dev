import { Icon, type IconProps } from "@/components/icons/icon";

export function EyeIcon(props: IconProps) {
  return (
    <Icon viewBox="0 0 20 20" {...props}>
      <path
        d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
      <circle cx={10} cy={10} r={2.5} />
    </Icon>
  );
}
