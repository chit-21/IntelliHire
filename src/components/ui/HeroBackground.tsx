import React from 'react';

interface HeroBackgroundProps {
  className?: string;
}

export const HeroBackground: React.FC<HeroBackgroundProps> = ({ className = '' }) => {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        version="1.1" 
        width="100%" 
        height="100%" 
        preserveAspectRatio="none" 
        viewBox="0 0 1920 1080"
        className="w-full h-full object-cover"
      >
        <g mask="url(#SvgjsMask2154)" fill="none">
          <rect width="1920" height="1080" x="0" y="0" fill="url(#SvgjsLinearGradient2155)"></rect>
          <path d="M1920 0L1585.24 0L1920 47.53z" fill="rgba(255, 255, 255, .1)"></path>
          <path d="M1585.24 0L1920 47.53L1920 333.69000000000005L715.42 0z" fill="rgba(255, 255, 255, .075)"></path>
          <path d="M715.4200000000001 0L1920 333.69000000000005L1920 595.8900000000001L272.2800000000001 0z" fill="rgba(255, 255, 255, .05)"></path>
          <path d="M272.2800000000002 0L1920 595.8900000000001L1920 708.1700000000001L132.6300000000002 0z" fill="rgba(255, 255, 255, .025)"></path>
          <path d="M0 1080L147.86 1080L0 736.36z" fill="rgba(0, 0, 0, .1)"></path>
          <path d="M0 736.36L147.86 1080L775.15 1080L0 561.65z" fill="rgba(0, 0, 0, .075)"></path>
          <path d="M0 561.65L775.15 1080L1073.08 1080L0 531.4599999999999z" fill="rgba(0, 0, 0, .05)"></path>
          <path d="M0 531.4599999999999L1073.08 1080L1515.05 1080L0 330.0899999999999z" fill="rgba(0, 0, 0, .025)"></path>
        </g>
        <defs>
          <mask id="SvgjsMask2154">
            <rect width="1920" height="1080" fill="#ffffff"></rect>
          </mask>
          <linearGradient 
            x1="10.94%" 
            y1="-19.44%" 
            x2="89.06%" 
            y2="119.44%" 
            gradientUnits="userSpaceOnUse" 
            id="SvgjsLinearGradient2155"
          >
            <stop stopColor="rgba(32, 138, 46, 1)" offset="0.45"></stop>
            <stop stopColor="rgba(42, 167, 86, 1)" offset="0.82"></stop>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default HeroBackground; 