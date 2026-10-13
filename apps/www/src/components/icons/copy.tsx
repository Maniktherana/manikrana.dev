import { Icon, type IconProps } from "@/components/icons/icon";

export function CopyIcon(props: IconProps) {
  return (
    <Icon viewBox="0 0 20 20" {...props}>
      <path
        d="M13 7h2c1.105 0 2 .895 2 2v6c0 1.105-.895 2-2 2H9c-1.105 0-2-.895-2-2v-2"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
      <rect
        x={3}
        y={3}
        width={10}
        height={10}
        rx={2}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </Icon>
  );
}
