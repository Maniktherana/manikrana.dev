import { Icon, type IconProps } from "@/components/icons/icon";

export function PlayBoldIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M7 4.6V19.4L19.8 12Z"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinejoin="round"
      />
    </Icon>
  );
}
