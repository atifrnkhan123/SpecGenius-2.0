import * as React from 'react';

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="165"
      height="37.5"
      {...props}
    >
      <defs>
        <linearGradient id="geniusGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path
        d="M35 12 C 20 12, 10 20, 10 25 C 10 30, 20 38, 35 38"
        strokeWidth="4"
        stroke="hsl(var(--primary))"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M25 25 h -12"
        strokeWidth="4"
        stroke="hsl(var(--primary))"
        fill="none"
        strokeLinecap="round"
      />
       <circle cx="32" cy="15" r="3" fill="hsl(var(--accent))" />

      <text
        x="48"
        y="35"
        fontFamily="'Space Grotesk', sans-serif"
        fontSize="30"
        fontWeight="bold"
        fill="hsl(var(--primary))"
      >
        Spec
        <tspan fill="url(#geniusGradient)">Genius</tspan>
      </text>
    </svg>
  );

export default Logo;

    