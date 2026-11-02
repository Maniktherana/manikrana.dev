import { Icon, type IconProps } from "@/components/icons/icon";

export function SunBoldIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx={12} cy={12} r={4.25} />
      <path
        d="M12 2.75v2M12 19.25v2M2.75 12h2M19.25 12h2M5.46 5.46l1.41 1.41M17.13 17.13l1.41 1.41M5.46 18.54l1.41-1.41M17.13 6.87l1.41-1.41"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Icon>
  );
}
