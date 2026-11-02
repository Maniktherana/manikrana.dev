import { Icon, type IconProps } from "@/components/icons/icon";

export function DotsHorizontalBoldIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </Icon>
  );
}
