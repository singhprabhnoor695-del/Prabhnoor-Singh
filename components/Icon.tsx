
import React from 'react';

/**
 * Connectifyr Icon Component
 * A high-contrast, anime-inspired logo representing speed and connection.
 * Features a stylized paper plane merging into a 'C' shape.
 */
export const ConnectifyrIcon: React.FC<{ className?: string, hideShadow?: boolean }> = ({ 
  className = "w-16 h-16", 
  hideShadow = false 
}) => {
  return (
    <div className={`relative inline-block ${className} no-select group`}>
      {/* Neo-Brutalism Offset Shadow (The black block behind) */}
      {!hideShadow && (
        <div className="absolute inset-0 bg-black rounded-[22%] translate-x-1.5 translate-y-1.5 transition-transform group-hover:translate-x-2 group-hover:translate-y-2"></div>
      )}
      
      {/* Main Logo Container */}
      <div className="relative w-full h-full bg-pink-500 border-[3.5px] border-black rounded-[22%] flex items-center justify-center overflow-hidden transition-transform group-active:translate-x-1 group-active:translate-y-1">
        
        {/* Dynamic Background Elements (Anime Sparkles/Glow) */}
        <div className="absolute -top-1/4 -right-1/4 w-full h-full bg-white/15 rounded-full blur-xl"></div>
        <div className="absolute -bottom-4 -left-4 w-3/4 h-3/4 bg-yellow-300/20 rounded-full blur-xl"></div>
        
        {/* The Core Icon (Stylized Paper Plane Hybrid) */}
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          className="w-[65%] h-[65%] text-white drop-shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Plane Body */}
          <path 
            d="M22 2L2 10L10 14L14 22L22 2Z" 
            fill="white"
            stroke="white" 
            strokeWidth="1" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          {/* Internal Detail Line */}
          <path 
            d="M10 14L22 2" 
            stroke="black" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </svg>
        
        {/* Anime Speed Lines (White highlights for motion effect) */}
        <div className="absolute top-[20%] left-[10%] w-[35%] h-[4%] bg-white/60 rounded-full rotate-[-5deg]"></div>
        <div className="absolute top-[35%] left-[8%] w-[20%] h-[4%] bg-white/40 rounded-full rotate-[-5deg]"></div>
        
        {/* Bottom Right Decorative Signature Dot */}
        <div className="absolute bottom-2 right-2 w-2 h-2 bg-yellow-300 border-[1.5px] border-black rounded-full shadow-[1px_1px_0px_#000]"></div>
      </div>
    </div>
  );
};

export default ConnectifyrIcon;
