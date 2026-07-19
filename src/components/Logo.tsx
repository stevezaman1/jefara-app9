import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 32 }) => {
  return (
    <svg
      id="jefara-logo"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`fill-current ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon points="55.06,17.16 71.48,17.16 63.52,36.87 47.10,36.87" />
      <polygon points="75.58,17.16 92.00,17.16 84.04,36.87 67.62,36.87" />
      <polygon points="45.77,40.15 62.19,40.15 54.23,59.85 37.81,59.85" />
      <polygon points="66.29,40.15 82.71,40.15 74.75,59.85 58.33,59.85" />
      <polygon points="15.96,63.13 32.38,63.13 24.42,82.84 8.00,82.84" />
      <polygon points="36.48,63.13 52.90,63.13 44.94,82.84 28.52,82.84" />
      <polygon points="57.01,63.13 73.43,63.13 65.47,82.84 49.05,82.84" />
    </svg>
  );
};
