import * as React from 'react';

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 200 50"
    width="200"
    height="50"
    {...props}
  >
    <defs>
      <linearGradient id="geniusGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <text
      x="0"
      y="35"
      fontFamily="'Space Grotesk', sans-serif"
      fontSize="30"
      fontWeight="bold"
      fill="hsl(var(--primary))"
      textAnchor="start"
    >
      Spec<tspan fill="url(#geniusGradient)">Genius</tspan>
    </text>
  </svg>
);

export default Logo;
