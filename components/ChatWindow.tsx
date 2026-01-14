
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

const EMOJI_LIST = ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽", "👾", "🤖", "🎃", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "👋", "👌", "👍", "❤️", "🔥", "✨", "🚀"];

const ChatWindow: React.FC<ChatWindowProps> = ({ contact, messages, isTyping, onSendMessage, onVoiceCall, onVideoCall, onBack }) => {
  const [inputValue, setInputValue] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue('');
    setShowEmojiPicker(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!contact) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white p-6 text-center">
        <div className="w-24 h-24 md:w-32 md:h-32 bg-pink-100 border-4 border-black rounded-full flex items-center justify-center mb-6 shadow-[8px_8px_0px_#000] rotate-3 animate-pulse">
          <i className="fas fa-comments text-3xl md:text-4xl text-pink-500"></i>
        </div>
        <h2 className="text-2xl md:text-3xl font-black uppercase italic italic mb-2">Connectifyr HQ</h2>
        <p className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-widest max-w-[200px]">Pick a friend to start chatting!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white relative overflow-hidden h-full">
      {/* Dynamic Header */}
      <div className="px-4 md:px-6 py-3 md:py-4 bg-indigo-500 border-b-4 border-black flex items-center justify-between z-20">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          {onBack && (
            <button onClick={onBack} className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors">
              <i className="fas fa-chevron-left text-xl"></i>
            </button>
          )}
          <div className="relative shrink-0">
            <img src={contact.avatar} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-black object-cover bg-white" alt="" />
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-black ${contact.status === 'online' ? 'bg-green-400' : 'bg-gray-400'}`}></div>
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-white leading-tight truncate uppercase italic text-sm md:text-base">{contact.name}</h3>
            <p className="text-[9px] text-yellow-300 font-black uppercase tracking-widest truncate hidden md:block">Active now</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onVideoCall} className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center bg-white border-2 md:border-4 border-black rounded-xl shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:shadow-none"><i className="fas fa-video text-xs md:text-base"></i></button>
          <button onClick={onVoiceCall} className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center bg-white border-2 md:border-4 border-black rounded-xl shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:shadow-none"><i className="fas fa-phone text-xs md:text-base"></i></button>
        </div>
      </div>

      {/* Message Feed: Responsive bubble widths */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-6 bg-gray-50/50"
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '24px 24px', backgroundAlpha: '0.05' }}
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`relative px-4 py-2.5 rounded-2xl border-2 md:border-4 border-black font-bold text-sm md:text-base ${
              msg.senderId === 'me' 
                ? 'bg-pink-400 text-white rounded-tr-none max-w-[85%] md:max-w-[70%]' 
                : 'bg-white text-black rounded-tl-none shadow-[3px_3px_0px_#000] max-w-[85%] md:max-w-[70%]'
            }`}>
              {msg.text && <p className="leading-relaxed break-words">{msg.text}</p>}
              <div className={`text-[8px] md:text-[9px] mt-1.5 flex items-center justify-end gap-1 font-black uppercase opacity-60 ${msg.senderId === 'me' ? 'text-white' : 'text-gray-500'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {msg.senderId === 'me' && <i className={`fas fa-check-double ${msg.status === 'read' ? 'text-indigo-900' : ''}`}></i>}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border-2 md:border-4 border-black px-4 py-2 rounded-2xl rounded-tl-none shadow-[3px_3px_0px_#000] flex gap-1">
              <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area: Ergonomic touch targets */}
      <div className="p-3 md:p-6 bg-yellow-300 border-t-4 border-black">
        <div className="flex items-end gap-2 md:gap-4 max-w-6xl mx-auto relative">
          
          <div className="flex gap-2 pb-1">
            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white border-2 md:border-4 border-black rounded-xl shadow-[3px_3px_0px_#000] hover:bg-pink-50 transition-colors">
              <i className="far fa-smile text-lg md:text-xl"></i>
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              className="w-full bg-white border-2 md:border-4 border-black rounded-xl md:rounded-2xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base font-bold focus:outline-none resize-none min-h-[44px] max-h-32 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05)]"
              rows={1}
            />
          </div>

          <button 
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className={`shrink-0 w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center border-2 md:border-4 border-black shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-none transition-all ${
              inputValue.trim() ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-400 opacity-50'
            }`}
          >
            <i className="fas fa-paper-plane text-sm md:text-xl"></i>
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-16 md:bottom-20 left-0 w-full md:w-80 h-64 bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_#000] p-3 overflow-y-auto grid grid-cols-6 gap-2 z-50">
              {EMOJI_LIST.map((e, i) => (
                <button key={i} onClick={() => { setInputValue(v => v + e); setShowEmojiPicker(false); }} className="text-xl md:text-2xl hover:bg-pink-100 rounded-lg p-1 transition-colors">{e}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
