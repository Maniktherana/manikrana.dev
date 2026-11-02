import { Icon, type IconProps } from "@/components/icons/icon";

export function DisplayBoldIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M5.25 4h13.5a2.5 2.5 0 0 1 2.5 2.5v7.5a2.5 2.5 0 0 1-2.5 2.5H5.25a2.5 2.5 0 0 1-2.5-2.5V6.5A2.5 2.5 0 0 1 5.25 4ZM12 16.5v3.5M8 20h8"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Icon>
  );
}
