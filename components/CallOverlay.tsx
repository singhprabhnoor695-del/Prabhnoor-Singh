
import React, { useEffect, useState } from 'react';
import { Contact } from '../types';

interface CallOverlayProps {
  contact: Contact;
  type: 'voice' | 'video';
  onEnd: () => void;
}

const CallOverlay: React.FC<CallOverlayProps> = ({ contact, type, onEnd }) => {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center text-white p-6">
      {type === 'video' && (
        <div className="absolute inset-0 z-0 opacity-40">
           <img src={contact.avatar} className="w-full h-full object-cover blur-2xl scale-110" alt="bg" />
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-8">
          <img src={contact.avatar} alt={contact.name} className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white/20 shadow-2xl object-cover" />
          {type === 'video' && (
            <div className="absolute -bottom-2 -right-2 w-24 h-32 bg-gray-800 rounded-lg border-2 border-white/30 overflow-hidden shadow-lg">
               <div className="w-full h-full bg-indigo-900 flex items-center justify-center">
                  <i className="fas fa-user text-white/50"></i>
               </div>
            </div>
          )}
        </div>
        
        <h2 className="text-3xl font-bold mb-2">{contact.name}</h2>
        <p className="text-indigo-300 font-medium mb-1">{type === 'voice' ? 'Voice Call' : 'Video Call'}</p>
        <p className="text-lg font-mono opacity-80">{formatTime(duration)}</p>
      </div>

      <div className="relative z-10 mt-auto mb-12 flex gap-8 items-center">
        <button className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
          <i className="fas fa-microphone-slash text-xl"></i>
        </button>
        <button className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
          <i className="fas fa-volume-up text-xl"></i>
        </button>
        {type === 'video' && (
          <button className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
            <i className="fas fa-video-slash text-xl"></i>
          </button>
        )}
        <button 
          onClick={onEnd}
          className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-all shadow-lg active:scale-95"
        >
          <i className="fas fa-phone-slash text-2xl rotate-[135deg]"></i>
        </button>
      </div>
    </div>
  );
};

export default CallOverlay;
