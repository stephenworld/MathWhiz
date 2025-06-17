import React from 'react';

const StarIcon = ({ className = "w-6 h-6", filled = true, ...props }: React.SVGProps<SVGSVGElement> & { filled?: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke={filled ? "none" : "currentColor"}
    strokeWidth={filled ? 0 : 1.5}
    className={className}
    {...props}
    aria-label={filled ? "Filled Star" : "Empty Star"}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.479.038.674.65.317.999l-4.062 3.648a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.822.634l-4.723-2.85a.563.563 0 00-.65 0l-4.723 2.85a.562.562 0 01-.822-.634l1.285-5.385a.562.562 0 00-.182-.557l-4.062-3.648a.563.563 0 01.317-.999l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
    />
  </svg>
);

export default StarIcon;
