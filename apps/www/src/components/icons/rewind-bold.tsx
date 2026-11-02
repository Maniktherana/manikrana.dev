import { Icon, type IconProps } from "@/components/icons/icon";

export function RewindBoldIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M11.4 5.6V18.4L2.4 12ZM20.6 5.6V18.4L11.6 12Z"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinejoin="round"
      />
    </Icon>
  );
}
