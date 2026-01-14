
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import CallOverlay from './components/CallOverlay';
import Login from './components/Login';
import { Contact, Message } from './types';
import { getGeminiResponse, generateSpeech, playPCM } from './services/geminiService';

const AI_CONTACT: Contact = { 
  id: 'gemini-ai', 
  email: 'ai@connectifyr.com', 
  name: 'Gemini-chan', 
  avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Gemini&backgroundColor=b6e3f4', 
  status: 'online', 
  lastMessage: 'Yaho! Ready to chat?' 
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('connectifyr_auth') === 'true' || sessionStorage.getItem('connectifyr_auth') === 'true';
  });
  
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string, avatar?: string } | null>(() => {
    const saved = localStorage.getItem('connectifyr_user') || sessionStorage.getItem('connectifyr_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('connectifyr_contacts');
    const initial = saved ? JSON.parse(saved) : [AI_CONTACT];
    if (!initial.find((c: Contact) => c.id === 'gemini-ai')) {
      return [AI_CONTACT, ...initial];
    }
    return initial;
  });
  
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [systemToasts, setSystemToasts] = useState<string[]>([]);

  const isMobile = viewportWidth < 768;

  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem('connectifyr_chats');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [activeCall, setActiveCall] = useState<{ type: 'voice' | 'video', contactId: string } | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem('connectifyr_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('connectifyr_chats', JSON.stringify(chatHistories));
  }, [chatHistories]);

  const addToast = (msg: string) => {
    setSystemToasts(prev => [...prev, msg]);
    setTimeout(() => setSystemToasts(prev => prev.slice(1)), 4000);
  };

  const handleLogin = (email: string, name: string, remember: boolean) => {
    // We use a specific seed so the avatar is deterministic and the same on "both ends"
    const avatarSeed = btoa(email.toLowerCase()).substring(0, 8);
    const defaultAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}&backgroundColor=ffd5dc`;
    const user = { email, name, avatar: defaultAvatar };
    setCurrentUser(user);
    setIsAuthenticated(true);
    
    if (remember) {
      localStorage.setItem('connectifyr_auth', 'true');
      localStorage.setItem('connectifyr_user', JSON.stringify(user));
    } else {
      sessionStorage.setItem('connectifyr_auth', 'true');
      sessionStorage.setItem('connectifyr_user', JSON.stringify(user));
    }
    addToast(`Welcome back, ${name}-kun!`);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to end your session?")) {
      setIsAuthenticated(false);
      setCurrentUser(null);
      localStorage.removeItem('connectifyr_auth');
      localStorage.removeItem('connectifyr_user');
      sessionStorage.removeItem('connectifyr_auth');
      sessionStorage.removeItem('connectifyr_user');
      setContacts([AI_CONTACT]);
      setChatHistories({});
      setActiveContactId(null);
      setShowChatOnMobile(false);
    }
  };

  const handleAddContact = (name: string, email: string) => {
    const emailLower = email.toLowerCase();
    if (emailLower === currentUser?.email.toLowerCase()) {
      alert("You cannot add yourself!");
      return;
    }
    if (contacts.find(c => c.email.toLowerCase() === emailLower)) {
      alert("Nakama already in your circle!");
      return;
    }

    // Deterministic avatar for the friend too
    const friendSeed = btoa(emailLower).substring(0, 8);
    const friendAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${friendSeed}&backgroundColor=b6e3f4`;

    const newContact: Contact = {
      id: btoa(emailLower),
      name,
      email: emailLower,
      avatar: friendAvatar,
      status: 'offline',
      lastMessage: 'Digital handshake complete!'
    };

    setContacts(prev => [...prev, newContact]);
    
    // Simulate real network behavior: 
    // "Broadcasting your profile to the new nakama..."
    addToast(`Syncing your profile with ${name}...`);
    
    setTimeout(() => {
      addToast(`${name} has accepted your request!`);
      // Update status to online to simulate them seeing you
      setContacts(prev => prev.map(c => c.email === emailLower ? { ...c, status: 'online' } : c));
      
      // LOG for developer to see the shared data structure
      console.log("SIMULATED REMOTE INTERFACE DATA:", {
        recipient: emailLower,
        sender_displayed_to_them: {
          name: currentUser?.name,
          email: currentUser?.email,
          avatar: currentUser?.avatar
        }
      });
    }, 2000);
  };

  const handleSelectContact = (id: string) => {
    setActiveContactId(id);
    if (isMobile) setShowChatOnMobile(true);
  };

  const handleChangeAvatar = (url: string) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, avatar: url };
      setCurrentUser(updatedUser);
      const storage = localStorage.getItem('connectifyr_user') ? localStorage : sessionStorage;
      storage.setItem('connectifyr_user', JSON.stringify(updatedUser));
      addToast("Avatar updated across the network!");
    }
  };

  const activeContact = useMemo(() => contacts.find(c => c.id === activeContactId) || null, [contacts, activeContactId]);
  const activeMessages = useMemo(() => activeContactId ? (chatHistories[activeContactId] || []) : [], [chatHistories, activeContactId]);

  const handleSendMessage = useCallback(async (text: string, media?: { url: string, type: 'image' | 'video' | 'file' | 'voice', name?: string }) => {
    if (!activeContactId) return;

    const messageId = Date.now().toString();
    const newMessage: Message = {
      id: messageId,
      senderId: 'me',
      text,
      mediaUrl: media?.url,
      mediaType: media?.type as any,
      fileName: media?.name,
      timestamp: Date.now(),
      type: media ? (media.type === 'voice' ? 'voice' : 'media') : 'text',
      status: 'sent'
    };

    setChatHistories(prev => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), newMessage]
    }));

    // Simulate delivery/read receipts
    setTimeout(() => {
      setChatHistories(prev => ({
        ...prev,
        [activeContactId]: (prev[activeContactId] || []).map(m => m.id === messageId ? { ...m, status: 'read' as const } : m)
      }));
    }, 1500);

    if (activeContactId === 'gemini-ai') {
      setIsTyping(true);
      
      const history = (chatHistories['gemini-ai'] || []).slice(-10).map(m => {
        const parts: any[] = [];
        if (m.text) parts.push({ text: m.text });
        if (m.mediaUrl && m.mediaType === 'image') {
          parts.push({ inlineData: { mimeType: 'image/png', data: m.mediaUrl.split(',')[1] } });
        }
        return {
          role: (m.senderId === 'me' ? 'user' : 'model') as 'user' | 'model',
          parts
        };
      });

      try {
        const responseText = await getGeminiResponse(text || "Check this out!", history);
        setIsTyping(false);
        if (responseText) {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            senderId: 'gemini-ai',
            text: responseText,
            timestamp: Date.now(),
            type: 'text',
            status: 'read'
          };
          setChatHistories(prev => ({
            ...prev,
            ['gemini-ai']: [...(prev['gemini-ai'] || []), aiMessage]
          }));
          
          setIsSpeaking(true);
          const audio = await generateSpeech(responseText);
          if (audio) await playPCM(audio);
          setIsSpeaking(false);
        }
      } catch (err) {
        setIsTyping(false);
      }
    }
  }, [activeContactId, chatHistories]);

  if (!isAuthenticated || !currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden antialiased md:p-4 lg:p-8 xl:p-12 justify-center items-center">
      {/* System Toasts */}
      <div className="fixed top-6 right-6 z-[300] flex flex-col gap-3 pointer-events-none">
        {systemToasts.map((toast, idx) => (
          <div key={idx} className="bg-black text-white px-6 py-3 rounded-xl border-2 border-white shadow-[6px_6px_0px_#000] font-black uppercase italic text-xs animate-in slide-in-from-right duration-300">
            <i className="fas fa-satellite-dish mr-2 text-indigo-400"></i>
            {toast}
          </div>
        ))}
      </div>

      <div className="flex w-full h-full md:max-h-[1000px] xl:max-w-[1600px] bg-white md:shadow-[24px_24px_0px_#000] md:rounded-[3rem] md:border-[8px] border-black transition-all app-container overflow-hidden relative">
        
        {/* Sidebar */}
        <div className={`h-full border-black transition-all duration-300 ${
          isMobile 
            ? (showChatOnMobile ? 'hidden' : 'w-full') 
            : 'w-80 lg:w-96 border-r-[8px] flex-shrink-0'
        }`}>
          <Sidebar 
            contacts={contacts} 
            activeContactId={activeContactId} 
            onSelectContact={handleSelectContact}
            currentUserEmail={currentUser.email}
            currentUserName={currentUser.name}
            currentUserAvatar={currentUser.avatar}
            onLogout={handleLogout}
            onAddContact={handleAddContact}
            onChangeAvatar={handleChangeAvatar}
          />
        </div>

        {/* Chat Window */}
        <div className={`flex-1 h-full transition-all duration-300 ${
          isMobile && !showChatOnMobile ? 'hidden' : 'flex'
        }`}>
          <ChatWindow 
            contact={activeContact}
            messages={activeMessages}
            isTyping={isTyping}
            onSendMessage={handleSendMessage}
            onVoiceCall={() => setActiveCall({ type: 'voice', contactId: activeContactId! })}
            onVideoCall={() => setActiveCall({ type: 'video', contactId: activeContactId! })}
            onBack={isMobile ? () => setShowChatOnMobile(false) : undefined}
          />
        </div>
      </div>

      {activeCall && activeContact && (
        <CallOverlay 
          contact={activeContact} 
          type={activeCall.type} 
          onEnd={() => setActiveCall(null)} 
        />
      )}
      
      {isSpeaking && (
        <div className="fixed bottom-24 md:bottom-12 right-6 md:right-12 bg-pink-500 text-white px-8 py-4 rounded-3xl border-4 border-black shadow-[10px_10px_0px_#000] flex items-center gap-4 animate-bounce z-[150] cursor-pointer no-select">
          <div className="flex gap-1.5 items-end h-8">
             <div className="w-2 bg-white rounded-full animate-[pulse_0.8s_infinite]"></div>
             <div className="w-2 bg-white rounded-full animate-[pulse_0.8s_infinite_0.1s]"></div>
             <div className="w-2 bg-white rounded-full animate-[pulse_0.8s_infinite_0.2s]"></div>
             <div className="w-2 bg-white rounded-full animate-[pulse_0.8s_infinite_0.3s]"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-black uppercase tracking-tighter italic">Nakama Transmission</span>
            <span className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Incoming Audio Stream</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
