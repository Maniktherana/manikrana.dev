import { Icon, type IconProps } from "@/components/icons/icon";

export function RecordRingIcon(props: IconProps) {
  return (
    <Icon viewBox="0 0 32 32" {...props}>
      <circle
        cx="16"
        cy="16"
        r="13.75"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeOpacity="0.45"
      />
      <circle cx="16" cy="16" r="6" />
    </Icon>
  );
}
