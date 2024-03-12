import { IconProps } from "./IconsProps";

export const OsFilterIcon = ({ size = 45, ...props }: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 45 45"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="22.5" cy="22.5" r="22.5" fill="#1B64A8" />
    </svg>
  );
};