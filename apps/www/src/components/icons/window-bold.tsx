import { Icon, type IconProps } from "@/components/icons/icon";

export function WindowBoldIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M5.5 4.5h13a2.75 2.75 0 0 1 2.75 2.75v9.5a2.75 2.75 0 0 1-2.75 2.75h-13a2.75 2.75 0 0 1-2.75-2.75v-9.5A2.75 2.75 0 0 1 5.5 4.5ZM2.75 9h18.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Icon>
  );
}
