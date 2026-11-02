import { Icon, type IconProps } from "@/components/icons/icon";

export function DownloadBoldIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M12 4.5v10M7.5 10.5 12 15l4.5-4.5M5.5 19.5h13"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}
