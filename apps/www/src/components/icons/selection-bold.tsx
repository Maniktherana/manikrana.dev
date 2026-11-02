import { Icon, type IconProps } from "@/components/icons/icon";

export function SelectionBoldIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect
        x={3.5}
        y={5}
        width={17}
        height={14}
        rx={2.5}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeDasharray="3.2 3"
        strokeLinecap="round"
      />
    </Icon>
  );
}
