import React from 'react';

const MultiplyIcon = ({ className = "w-8 h-8", ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    {...props}
    aria-label="Multiplication"
  >
    <path
      fillRule="evenodd"
      d="M12 10.586l6.293-6.293a1 1 0 111.414 1.414L13.414 12l6.293 6.293a1 1 0 11-1.414 1.414L12 13.414l-6.293 6.293a1 1 0 01-1.414-1.414L10.586 12 4.293 5.707a1 1 0 011.414-1.414L12 10.586z"
      clipRule="evenodd"
    />
  </svg>
);

export default MultiplyIcon;
