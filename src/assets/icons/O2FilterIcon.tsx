import { IconProps } from "./IconsProps";

export const O2FilterIcon = ({ size = 45, ...props }: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 45 45"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="22.5" cy="22.5" r="22.5" fill="#D9D9D9" />
      <path
        d="M21.9398 0.988493C10.354 0.988492 0.966121 10.6171 0.96612 22.5001C0.966119 34.3831 10.354 44.0117 21.9398 44.0117C22.0143 44.0117 22.0888 44.0117 22.1757 44.0117L22.1757 1.00123C22.1012 1.00123 22.0267 1.00123 21.9398 1.00123L21.9398 0.988493Z"
        fill="#455265"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M22.9124 0.0116672C35.1285 0.187881 45 10.1815 45 22.4936L45 22.5064C45 34.7391 35.2553 44.6832 23.1484 44.9837L23.1484 44.9894L22.8263 44.9894L21.8516 45L21.8516 44.9892C9.75747 44.9387 8.85035e-07 34.8764 1.96701e-06 22.5C3.04899e-06 10.1236 9.75747 0.0612495 21.8516 0.0107783L21.8516 -2.0237e-06L22.826 0.0105838L22.9124 0.0105839L22.9124 0.0116672ZM23.7904 43C34.5363 42.3737 43.0612 33.4316 43.0612 22.5064L43.0612 22.4936C43.0612 11.5684 34.5363 2.62631 23.7904 1.99996L23.7904 43ZM21.2096 1.97973L21.2096 43.0203C10.5131 42.6244 1.93878 33.6057 1.93878 22.5C1.93878 11.3943 10.5131 2.37557 21.2096 1.97973Z"
        fill="#455265"
      />
      <path
        d="M22.5 43C25.1921 43 27.8578 42.4698 30.345 41.4395C32.8322 40.4093 35.0921 38.8993 36.9957 36.9957C38.8993 35.0921 40.4093 32.8322 41.4395 30.345C42.4698 27.8578 43 25.1921 43 22.5C43 19.8079 42.4698 17.1422 41.4395 14.655C40.4093 12.1678 38.8993 9.90791 36.9957 8.00431C35.0921 6.10071 32.8322 4.59069 30.345 3.56047C27.8578 2.53025 25.1921 2 22.5 2L22.5 22.5L22.5 43Z"
        fill="white"
      />
    </svg>
  );
};