import React from 'react';

interface FlagstarLogoProps {
  className?: string;
  light?: boolean;
  showText?: boolean;
  textSize?: string;
}

export const FlagstarLogo: React.FC<FlagstarLogoProps> = ({ 
  className = 'h-8 w-8', 
  light = false, 
  showText = true,
  textSize = 'text-2xl'
}) => {
  return (
    <div className={`flex items-center gap-3 select-none`}>
      {/* Dynamic Star Motif SVG */}
      <svg 
        className={`${className} filter drop-shadow-[0_2px_4px_rgba(255,158,27,0.15)]`} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Star (North Star - Orange/Yellow Gradient) */}
        <path 
          d="M50 5 L63.5 35.5 L95 38.2 L70.5 59.3 L78.5 90 L50 73.5 L21.5 90 L29.5 59.3 L5 38.2 L36.5 35.5 Z" 
          fill="url(#flagstarStarGradient)" 
        />
        {/* Inner Star (Customer Centricity - White or light cutout) */}
        <path 
          d="M50 28 L55.5 40.5 L69 41.5 L58.5 50.5 L62 63.5 L50 56.5 L38 63.5 L41.5 50.5 L31 41.5 L44.5 40.5 Z" 
          fill={light ? '#004B5C' : '#FFFFFF'} 
          className="transition-colors duration-300"
        />
        
        <defs>
          <linearGradient id="flagstarStarGradient" x1="5" y1="5" x2="95" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFA000" />
            <stop offset="40%" stopColor="#FF7A00" />
            <stop offset="100%" stopColor="#FF3D00" />
          </linearGradient>
        </defs>
      </svg>
      
      {showText && (
        <span 
          className={`font-black tracking-tight lowercase font-sans transition-colors duration-300 ${
            light ? 'text-white' : 'text-flagstar-teal'
          } ${textSize}`}
        >
          flagstar
          <span className="font-light text-[9px] align-super ml-0.5 opacity-80">®</span>
        </span>
      )}
    </div>
  );
};

export default FlagstarLogo;
