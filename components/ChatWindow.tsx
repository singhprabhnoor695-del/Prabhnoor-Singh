
import React, { useState, useRef, useEffect } from 'react';
import { Contact, Message } from '../types';

interface ChatWindowProps {
  contact: Contact | null;
  messages: Message[];
  isTyping?: boolean;
  onSendMessage: (text: string, media?: { url: string, type: 'image' | 'video' | 'file' | 'voice', name?: string }) => void;
  onVoiceCall: () => void;
  onVideoCall: () => void;
  onBack?: () => void;
}

const EMOJI_LIST = [
  "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽", "👾", "🤖", "🎃", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "👋", "👌", "👍", "❤️", "🔥", "✨", "🚀"
];

const ChatWindow: React.FC<ChatWindowProps> = ({ contact, messages, isTyping, onSendMessage, onVoiceCall, onVideoCall, onBack }) => {
  const [inputValue, setInputValue] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue('');
    setShowEmojiPicker(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          onSendMessage('', { url: base64Audio, type: 'voice', name: 'Voice Message' });
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied", err);
      alert("Please allow microphone access to record voice messages!");
    }
  };

  const stopRecording = (shouldSend: boolean) => {
    if (mediaRecorderRef.current && isRecording) {
      if (shouldSend) {
        mediaRecorderRef.current.stop();
      } else {
        // Cancel logic: just stop and discard
        mediaRecorderRef.current.onstop = () => {
            mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
        };
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      let type: 'image' | 'video' | 'file' = 'file';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('video/')) type = 'video';

      onSendMessage('', { url: result, type, name: file.name });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addEmoji = (emoji: string) => {
    setInputValue(prev => prev + emoji);
  };

  if (!contact) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#fffafa] text-black p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>
        <div className="w-32 h-32 md:w-40 md:h-40 bg-pink-200 border-4 border-black rounded-full flex items-center justify-center mb-8 shadow-[8px_8px_0px_#000] rotate-3 relative z-10">
          <i className="fas fa-bolt text-4xl md:text-5xl text-pink-600"></i>
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-black mb-3 italic uppercase relative z-10">CONNECTIFYR HQ</h2>
        <p className="max-w-xs font-bold text-gray-600 uppercase tracking-tighter relative z-10">Select a nakama to start your mission!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white relative overflow-hidden h-full">
      {/* Header */}
      <div className="px-4 md:px-6 py-3 md:py-4 bg-indigo-500 border-b-4 border-black flex items-center justify-between z-20 shadow-[0px_4px_0px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          {onBack && (
            <button onClick={onBack} className="md:hidden mr-1 text-white p-2 text-xl active:scale-90 transition-transform">
              <i className="fas fa-chevron-left"></i>
            </button>
          )}
          <div className="relative shrink-0">
            <img src={contact.avatar} alt={contact.name} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 md:border-4 border-black object-cover shadow-[2px_2px_0px_#000] bg-white" />
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-black ${contact.status === 'online' ? 'bg-green-400' : 'bg-gray-400'}`}></div>
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-white leading-tight truncate uppercase italic text-sm md:text-lg">{contact.name}</h3>
            <p className="hidden md:block text-[10px] text-yellow-300 font-black uppercase tracking-widest">
              <i className="fas fa-star mr-1"></i> Power Level Max
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <button onClick={onVideoCall} className="w-9 h-9 md:w-12 md:h-12 flex items-center justify-center bg-white border-4 border-black text-black hover:bg-pink-100 rounded-xl transition-all shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:shadow-none"><i className="fas fa-video text-xs md:text-base"></i></button>
          <button onClick={onVoiceCall} className="w-9 h-9 md:w-12 md:h-12 flex items-center justify-center bg-white border-4 border-black text-black hover:bg-pink-100 rounded-xl transition-all shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:shadow-none"><i className="fas fa-phone-alt text-xs md:text-base"></i></button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-10 space-y-4 md:space-y-6 scroll-smooth z-0"
        style={{ 
          backgroundColor: '#fff',
          backgroundImage: `linear-gradient(rgba(0,0,0,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.05) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] md:max-w-[75%] px-3 md:px-4 py-2 md:py-3 rounded-2xl md:rounded-3xl relative border-2 md:border-4 border-black font-bold text-sm md:text-base ${
              msg.senderId === 'me' 
              ? 'bg-pink-400 text-white rounded-tr-none' 
              : 'bg-white text-black rounded-tl-none shadow-[2px_2px_0px_#000] md:shadow-[3px_3px_0px_#000]'
            }`}>
              {msg.mediaUrl && (
                <div className="mb-2 rounded-xl overflow-hidden border-2 border-black/10">
                  {msg.mediaType === 'image' && <img src={msg.mediaUrl} alt="Shared" className="w-full max-h-64 object-cover" />}
                  {msg.mediaType === 'video' && <video src={msg.mediaUrl} controls className="w-full max-h-64" />}
                  {msg.mediaType === 'voice' && (
                    <div className="flex items-center gap-3 p-3 bg-black/10 rounded-xl min-w-[200px]">
                      <button className="w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center text-black active:scale-95 transition-transform" onClick={(e) => {
                        const audio = (e.currentTarget.nextElementSibling as HTMLAudioElement);
                        if (audio.paused) audio.play(); else audio.pause();
                      }}>
                        <i className="fas fa-play ml-1"></i>
                      </button>
                      <audio src={msg.mediaUrl} className="hidden" onPlay={(e) => {
                        const icon = (e.currentTarget.previousElementSibling as HTMLElement).querySelector('i');
                        if (icon) icon.className = 'fas fa-pause';
                      }} onPause={(e) => {
                        const icon = (e.currentTarget.previousElementSibling as HTMLElement).querySelector('i');
                        if (icon) icon.className = 'fas fa-play ml-1';
                      }} onEnded={(e) => {
                        const icon = (e.currentTarget.previousElementSibling as HTMLElement).querySelector('i');
                        if (icon) icon.className = 'fas fa-play ml-1';
                      }} />
                      <div className="flex-1 h-2 bg-black/20 rounded-full overflow-hidden relative">
                         <div className="absolute inset-0 bg-white/40 animate-pulse"></div>
                      </div>
                      <span className="text-[10px] font-black uppercase">VOICE</span>
                    </div>
                  )}
                  {msg.mediaType === 'file' && (
                    <div className="flex items-center gap-3 p-2 bg-black/5">
                      <i className="fas fa-file-alt text-xl"></i>
                      <span className="truncate text-[10px]">{msg.fileName || 'Document'}</span>
                    </div>
                  )}
                </div>
              )}
              {msg.text && <p className="leading-relaxed break-words">{msg.text}</p>}
              
              <div className={`text-[8px] md:text-[9px] mt-1.5 flex items-center justify-end gap-1 font-black uppercase tracking-tighter ${msg.senderId === 'me' ? 'text-pink-100' : 'text-gray-400'}`}>
                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                
                {msg.senderId === 'me' && (
                  <div className="flex items-center ml-0.5 md:ml-1">
                    {msg.status === 'read' ? (
                      <div className="flex -space-x-1">
                        <i className="fas fa-check text-blue-300"></i>
                        <i className="fas fa-check text-blue-300"></i>
                      </div>
                    ) : (
                      <i className="fas fa-check opacity-70"></i>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border-2 md:border-4 border-black px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl rounded-tl-none shadow-[2px_2px_0px_#000] md:shadow-[3px_3px_0px_#000] flex items-center gap-1">
              <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 md:p-6 bg-yellow-300 border-t-4 border-black z-30">
        <div className="flex items-end gap-2 md:gap-4 max-w-5xl mx-auto relative">
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
          />

          {showEmojiPicker && (
            <div 
              ref={emojiRef}
              className="absolute bottom-16 md:bottom-20 left-0 w-full md:w-72 h-64 md:h-80 bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_#000] p-4 overflow-y-auto z-50 grid grid-cols-6 md:grid-cols-6 gap-2"
            >
              {EMOJI_LIST.map((emoji, idx) => (
                <button key={idx} onClick={() => addEmoji(emoji)} className="text-xl md:text-2xl hover:bg-pink-100 rounded-lg p-1 active:scale-90 transition-transform">{emoji}</button>
              ))}
            </div>
          )}

          {!isRecording ? (
            <div className="flex items-center gap-1.5 md:gap-2 pb-1">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white border-2 md:border-4 border-black rounded-xl hover:bg-blue-100 transition-all shadow-[2px_2px_0px_#000] md:shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:shadow-none"
              >
                <i className="fas fa-paperclip text-sm md:text-xl"></i>
              </button>
              <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white border-2 md:border-4 border-black rounded-xl hover:bg-pink-100 transition-all shadow-[2px_2px_0px_#000] md:shadow-[3px_3px_0px_#000]"
              >
                <i className="far fa-smile text-sm md:text-xl"></i>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pb-1 bg-red-100 border-2 border-black px-3 py-2 rounded-2xl flex-1 animate-pulse">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                <span className="font-black text-red-600 uppercase text-[10px] md:text-xs">Recording {formatDuration(recordingDuration)}</span>
                <div className="flex-1 flex gap-1 items-center justify-center">
                   <div className="w-1 h-3 bg-red-400 rounded-full animate-[bounce_0.5s_infinite_0s]"></div>
                   <div className="w-1 h-5 bg-red-400 rounded-full animate-[bounce_0.5s_infinite_0.1s]"></div>
                   <div className="w-1 h-2 bg-red-400 rounded-full animate-[bounce_0.5s_infinite_0.2s]"></div>
                </div>
            </div>
          )}
          
          {!isRecording && (
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Message..."
                className="w-full bg-white border-2 md:border-4 border-black rounded-xl md:rounded-2xl px-3 md:px-4 py-2 md:py-3 text-sm font-bold focus:outline-none resize-none max-h-24 md:max-h-32 min-h-[40px] md:min-h-[48px] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05)]"
                rows={1}
              />
            </div>
          )}

          <div className="flex items-center pb-1 gap-2">
            {isRecording && (
               <button 
                 onClick={() => stopRecording(false)}
                 className="w-10 h-10 md:w-14 md:h-14 bg-white border-2 md:border-4 border-black rounded-xl flex items-center justify-center text-red-500 hover:bg-red-50 transition-all shadow-[2px_2px_0px_#000]"
               >
                 <i className="fas fa-trash"></i>
               </button>
            )}

            {!inputValue.trim() && !isRecording && !isUploading ? (
              <button 
                onClick={startRecording}
                className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all border-2 md:border-4 border-black shadow-[2px_2px_0px_#000] md:shadow-[4px_4px_0px_#000] bg-indigo-500 text-white active:translate-y-1 active:shadow-none"
              >
                <i className="fas fa-microphone text-sm md:text-xl"></i>
              </button>
            ) : (
              <button 
                onClick={() => isRecording ? stopRecording(true) : handleSend()}
                disabled={!inputValue.trim() && !isRecording && !isUploading}
                className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all border-2 md:border-4 border-black shadow-[2px_2px_0px_#000] md:shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-none ${
                  inputValue.trim() || isUploading || isRecording ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-400 opacity-50'
                }`}
              >
                {isUploading ? <i className="fas fa-spinner animate-spin"></i> : (isRecording ? <i className="fas fa-check text-sm md:text-xl"></i> : <i className="fas fa-paper-plane text-sm md:text-xl"></i>)}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
