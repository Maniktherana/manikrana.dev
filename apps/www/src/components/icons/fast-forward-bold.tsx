import { Icon, type IconProps } from "@/components/icons/icon";

export function FastForwardBoldIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M12.6 5.6V18.4L21.6 12ZM3.4 5.6V18.4L12.4 12Z"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinejoin="round"
      />
    </Icon>
  );
}
