import { Icon, type IconProps } from "@/components/icons/icon";

export function WifiBoldIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M2.433 10.445A12.875 12.875 0 0 1 21.567 10.445M6.891 14.46A6.875 6.875 0 0 1 17.109 14.46"
        fill="none"
        stroke="currentColor"
        strokeWidth={3.25}
        strokeLinecap="round"
      />
      <circle cx={12} cy={19.06} r={2.5} />
    </Icon>
  );
}
