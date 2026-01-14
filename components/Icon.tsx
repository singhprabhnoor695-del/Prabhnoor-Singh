
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
      {/* Neo-Brutalism Offset Shadow */}
      {!hideShadow && (
        <div className="absolute inset-0 bg-black rounded-[24%] translate-x-2 translate-y-2 transition-all group-hover:translate-x-3 group-hover:translate-y-3"></div>
      )}
      
      {/* Main Logo Container */}
      <div className="relative w-full h-full bg-[#6366f1] border-[4px] border-black rounded-[24%] flex items-center justify-center overflow-hidden transition-all group-active:translate-x-1 group-active:translate-y-1">
        
        {/* Dynamic Background Gradients */}
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-pink-400/30 rounded-full blur-2xl"></div>
        
        {/* The Core Icon (Stylized C-Plane Hybrid) */}
        <svg 
          viewBox="0 0 100 100" 
          className="w-[70%] h-[70%] drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stylized 'C' and Plane Body */}
          <path 
            d="M85 20 L20 45 L50 55 L55 85 L85 20" 
            fill="white"
            stroke="black" 
            strokeWidth="4" 
            strokeLinejoin="round" 
          />
          {/* Internal Movement Line */}
          <path 
            d="M50 55 L85 20" 
            stroke="black" 
            strokeWidth="5" 
            strokeLinecap="round" 
          />
          {/* Secondary Plane Wing (Fold) */}
          <path 
            d="M50 55 L55 85 L65 60 Z" 
            fill="#fbbf24"
            stroke="black"
            strokeWidth="2"
          />
        </svg>
        
        {/* Speed Lines */}
        <div className="absolute top-[15%] left-0 w-full h-full pointer-events-none overflow-hidden opacity-40">
           <div className="absolute top-0 left-0 w-8 h-[2px] bg-white rounded-full animate-[speed-line_1s_infinite_linear]"></div>
           <div className="absolute top-4 left-2 w-12 h-[2px] bg-white rounded-full animate-[speed-line_1.2s_infinite_linear_0.2s]"></div>
           <div className="absolute top-8 left-1 w-6 h-[2px] bg-white rounded-full animate-[speed-line_0.8s_infinite_linear_0.4s]"></div>
        </div>
        
        {/* Gloss Highlight */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent"></div>
      </div>

      <style>{`
        @keyframes speed-line {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(300%); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default ConnectifyrIcon;
