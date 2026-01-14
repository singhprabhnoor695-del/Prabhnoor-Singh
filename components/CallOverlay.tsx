
import React, { useEffect, useState, useRef } from 'react';
import { Contact } from '../types';

interface CallOverlayProps {
  contact: Contact;
  type: 'voice' | 'video';
  onEnd: () => void;
}

const CallOverlay: React.FC<CallOverlayProps> = ({ contact, type, onEnd }) => {
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setDuration(d => d + 1), 1000);
    
    // Initialize real media stream
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: type === 'video',
          audio: true
        });
        streamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Failed to access media devices:", err);
      }
    };

    startMedia();

    return () => {
      clearInterval(timer);
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, [type]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => t.enabled = isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current && type === 'video') {
      streamRef.current.getVideoTracks().forEach(t => t.enabled = isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#0a0a0c] flex flex-col items-center justify-center text-white overflow-hidden">
      {/* Remote View (Simulation for demo) */}
      <div className="absolute inset-0 z-0">
         <img src={contact.avatar} className="w-full h-full object-cover blur-3xl opacity-30 scale-125" alt="bg" />
         <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
               <img src={contact.avatar} className="w-40 h-40 md:w-64 md:h-64 rounded-full border-8 border-white/10 shadow-[0_0_100px_rgba(255,255,255,0.1)] object-cover animate-pulse" alt="remote" />
               <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-indigo-500 px-6 py-2 rounded-full border-4 border-black font-black uppercase text-xs shadow-[4px_4px_0px_#000]">
                  {contact.status === 'online' ? 'Connected' : 'Ringing...'}
               </div>
            </div>
         </div>
      </div>

      {/* Local Video Preview (Real Stream) */}
      {type === 'video' && (
        <div className="absolute top-6 right-6 md:top-12 md:right-12 w-32 h-44 md:w-48 md:h-64 bg-black border-4 border-white/20 rounded-3xl overflow-hidden shadow-2xl z-20">
          <video 
            ref={localVideoRef} 
            autoPlay 
            muted 
            playsInline 
            className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
          />
          {isVideoOff && (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <i className="fas fa-video-slash text-2xl text-white/20"></i>
            </div>
          )}
        </div>
      )}

      {/* Call Info Header */}
      <div className="relative z-10 flex flex-col items-center mt-20 md:mt-0">
        <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-2 drop-shadow-lg">{contact.name}</h2>
        <div className="flex items-center gap-3">
           <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></div>
           </div>
           <p className="text-lg font-mono font-bold text-indigo-300 drop-shadow-md">{formatTime(duration)}</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="relative z-10 mt-auto mb-16 flex flex-wrap justify-center gap-4 md:gap-8 items-center px-6">
        <button 
          onClick={toggleMute}
          className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-black flex items-center justify-center transition-all shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-none ${isMuted ? 'bg-red-500 text-white' : 'bg-white text-black'}`}
        >
          <i className={`fas ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'} text-xl`}></i>
        </button>

        {type === 'video' && (
          <button 
            onClick={toggleVideo}
            className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-black flex items-center justify-center transition-all shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-none ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white text-black'}`}
          >
            <i className={`fas ${isVideoOff ? 'fa-video-slash' : 'fa-video'} text-xl`}></i>
          </button>
        )}

        <button 
          onClick={onEnd}
          className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-red-600 border-4 border-black flex items-center justify-center hover:bg-red-700 transition-all shadow-[6px_6px_0px_#000] active:translate-y-1 active:shadow-none group"
        >
          <i className="fas fa-phone-slash text-3xl text-white rotate-[135deg] group-hover:scale-110 transition-transform"></i>
        </button>

        <button className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white border-4 border-black text-black flex items-center justify-center shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-none">
          <i className="fas fa-th text-xl"></i>
        </button>
      </div>

      <p className="mb-8 font-black text-[10px] uppercase tracking-[0.3em] opacity-40">End-to-End Encrypted via Connectifyr</p>
    </div>
  );
};

export default CallOverlay;
