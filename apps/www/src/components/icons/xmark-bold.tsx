import { Icon, type IconProps } from "@/components/icons/icon";

export function XmarkBoldIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
      />
    </Icon>
  );
}
