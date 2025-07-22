import * as React from 'react';

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 200 50"
    width="150"
    height="37.5"
    {...props}
  >
    <text
      x="10"
      y="35"
      fontFamily="'Space Grotesk', sans-serif"
      fontSize="30"
      fontWeight="bold"
      fill="hsl(var(--primary))"
    >
      Spectacle
      <tspan fill="hsl(var(--accent))">API</tspan>
    </text>
  </svg>
);

export default Logo;
