import * as React from 'react';

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 220 50"
    width="165"
    height="37.5"
    {...props}
  >
    <defs>
      <linearGradient id="geniusGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path
      d="M10 40 C15 10, 35 10, 40 40"
      stroke="url(#geniusGradient)"
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
    />
     <path
      d="M12 25 h 26"
      stroke="hsl(var(--accent))"
      strokeWidth="3.5"
      fill="none"
      strokeLinecap="round"
    />
    <text
      x="50"
      y="35"
      fontFamily="'Space Grotesk', sans-serif"
      fontSize="30"
      fontWeight="bold"
      fill="hsl(var(--primary))"
    >
      Spec
      <tspan fill="hsl(var(--accent))">Genius</tspan>
    </text>
  </svg>
);

export default Logo;
