import { IconProps } from "./IconsProps";

export const BwFilterIcon = ({ size = 45, ...props }: IconProps) => {
  return (
    <svg
      width="63"
      height={size}
      viewBox="0 0 63 45"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle
        cx="39.9258"
        cy="22.5"
        r="21.5"
        fill="white"
        stroke="#455265"
        strokeWidth="2"
      />
      <circle cx="22.5" cy="22.5" r="22.5" fill="#455265" />
    </svg>
  );
};
