import React from 'react';

const DivideIcon = ({ className = "w-8 h-8", ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    {...props}
    aria-label="Division"
  >
    <circle cx="12" cy="6" r="1.75" />
    <circle cx="12" cy="18" r="1.75" />
    <path fillRule="evenodd" d="M4 12a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H4.75A.75.75 0 014 12z" clipRule="evenodd" />
  </svg>
);

export default DivideIcon;
