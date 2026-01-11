
import React from 'react';

export const ConnectifyrIcon: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => {
  return (
    <div className={`relative ${className}`}>
      {/* Outer Glow/Border for Anime Look */}
      <div className="absolute inset-0 bg-black rounded-3xl translate-x-1 translate-y-1"></div>
      
      {/* Main Square Container */}
      <div className="relative w-full h-full bg-pink-500 border-[3px] border-black rounded-3xl flex items-center justify-center overflow-hidden">
        {/* Decorative Inner Circle */}
        <div className="absolute -top-4 -right-4 w-12 h-12 bg-white/20 rounded-full"></div>
        <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-yellow-300/40 rounded-full"></div>
        
        {/* The Paper Plane "C" Hybrid */}
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          className="w-2/3 h-2/3 text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M21.5 3L2.5 10.5L10 14L13.5 21.5L21.5 3Z" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          <path 
            d="M10 14L21.5 3" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </svg>
        
        {/* Speed Lines for Anime Effect */}
        <div className="absolute left-1 top-2 w-4 h-0.5 bg-white/40 rounded-full"></div>
        <div className="absolute left-2 top-4 w-6 h-0.5 bg-white/40 rounded-full"></div>
      </div>
    </div>
  );
};

export default ConnectifyrIcon;
