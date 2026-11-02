import { Icon, type IconProps } from "@/components/icons/icon";

export function ChevronUpDownBoldIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M7 9.5 12 4.5 17 9.5M7 14.5 12 19.5 17 14.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}
