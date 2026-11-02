import { Icon, type IconProps } from "@/components/icons/icon";

export function BedBoldIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7C4 5.34315 5.34315 4 7 4H11V9H4V7Z" />
      <path d="M13 9V4H17C18.6569 4 20 5.34315 20 7V9H13Z" />
      <path d="M19 11C20.6569 11 22 12.3431 22 14V16C22 17.1046 21.1046 18 20 18V19C20 19.5523 19.5523 20 19 20C18.4477 20 18 19.5523 18 19V18H6V19C6 19.5523 5.55228 20 5 20C4.44772 20 4 19.5523 4 19V18C2.89543 18 2 17.1046 2 16V14C2 12.3431 3.34315 11 5 11H19Z" />
    </Icon>
  );
}
