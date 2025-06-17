import React from 'react';

const MinusIcon = ({ className = "w-8 h-8", ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    {...props}
    aria-label="Subtraction"
  >
    <path
      fillRule="evenodd"
      d="M3.75 12a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75z"
      clipRule="evenodd"
    />
  </svg>
);

export default MinusIcon;
