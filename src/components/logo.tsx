import * as React from 'react';

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-10 0 230 50"
      width="180"
      height="41.67"
      {...props}
    >
      <defs>
        <linearGradient id="geniusGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <g>
        <path
          d="M40 12 C 25 12, 15 20, 15 25 C 15 30, 25 38, 40 38"
          strokeWidth="4"
          stroke="hsl(var(--primary))"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M30 25 h -12"
          strokeWidth="4"
          stroke="hsl(var(--primary))"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="37" cy="15" r="3" fill="hsl(var(--accent))" />

        <text
          x="53"
          y="35"
          fontFamily="'Space Grotesk', sans-serif"
          fontSize="30"
          fontWeight="bold"
          fill="hsl(var(--primary))"
        >
          Spec
          <tspan fill="url(#geniusGradient)">Genius</tspan>
        </text>
      </g>
    </svg>
  );

export default Logo;
