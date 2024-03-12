import { IconProps } from "./IconsProps";

export const ContrastFilterIcon = ({ size = 45, ...props }: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 45 45"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M44 22.5C44 34.3741 34.3741 44 22.5 44C10.6259 44 1 34.3741 1 22.5C1 10.6259 10.6259 1 22.5 1C34.3741 1 44 10.6259 44 22.5Z"
        fill="#455265"
        stroke="#455265"
        strokeWidth="2"
      />
      <path
        d="M22.5 2C25.1921 2 27.8578 2.53025 30.345 3.56047C32.8322 4.59069 35.0921 6.10071 36.9957 8.00431C38.8993 9.90791 40.4093 12.1678 41.4395 14.655C42.4698 17.1422 43 19.8079 43 22.5C43 25.1921 42.4698 27.8578 41.4395 30.345C40.4093 32.8322 38.8993 35.0921 36.9957 36.9957C35.0921 38.8993 32.8322 40.4093 30.345 41.4395C27.8578 42.4698 25.1921 43 22.5 43L22.5 22.5L22.5 2Z"
        fill="white"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M37 6H22V4H34.5L37 6Z"
        fill="#455265"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M37 39.3618H22V41.3618H34.5L37 39.3618Z"
        fill="#455265"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M43.0873 14.3618L22.0234 14.3618L22.0234 12.3618L42 12.3618L43.0873 14.3618Z"
        fill="#455265"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M43.0873 31L22.0234 31L22.0234 33L42 33L43.0873 31Z"
        fill="#455265"
      />
      <line
        x1="22.0234"
        y1="21.9785"
        x2="44.0447"
        y2="21.9785"
        stroke="#455265"
        strokeWidth="2"
      />
    </svg>
  );
};
