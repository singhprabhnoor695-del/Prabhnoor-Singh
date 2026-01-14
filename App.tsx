
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

  const isMobile = viewportWidth < 768;
  const isTablet = viewportWidth >= 768 && viewportWidth < 1024;

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

  const handleLogin = (email: string, name: string, remember: boolean) => {
    const defaultAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}&backgroundColor=ffd5dc`;
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
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
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
    if (email.toLowerCase() === currentUser?.email.toLowerCase()) {
      alert("You cannot add yourself!");
      return;
    }
    if (contacts.find(c => c.email.toLowerCase() === email.toLowerCase())) {
      alert("Contact already exists!");
      return;
    }
    const newContact: Contact = {
      id: btoa(email),
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}&backgroundColor=ffd5dc`,
      status: 'offline',
      lastMessage: 'Added to your circle!'
    };
    setContacts(prev => [...prev, newContact]);
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

    if (activeContactId === 'gemini-ai') {
      setIsTyping(true);
      const history = (chatHistories['gemini-ai'] || []).slice(-10).map(m => ({
        role: (m.senderId === 'me' ? 'user' : 'model') as 'user' | 'model',
        parts: [{ text: m.text || '' }]
      }));

      try {
        const responseText = await getGeminiResponse(text || "Help!", history);
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
    <div className="flex h-screen w-screen overflow-hidden antialiased md:p-4 lg:p-8 xl:p-12 justify-center items-center bg-transparent">
      <div className="flex w-full h-full md:max-h-[900px] xl:max-h-[1000px] bg-white md:shadow-[20px_20px_0px_#000] md:rounded-[2.5rem] md:border-[6px] border-black transition-all app-container overflow-hidden relative">
        
        {/* Sidebar: Adaptive width */}
        <div className={`h-full border-black transition-all duration-300 ${
          isMobile 
            ? (showChatOnMobile ? 'hidden' : 'w-full') 
            : 'w-72 md:w-80 lg:w-96 border-r-[6px] flex-shrink-0'
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

        {/* Chat Window: Fluid width */}
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
        <div className="fixed bottom-24 md:bottom-12 right-6 md:right-12 bg-pink-500 text-white px-6 py-3 rounded-2xl border-4 border-black shadow-[6px_6px_0px_#000] flex items-center gap-3 animate-bounce z-[100] cursor-pointer no-select">
          <div className="flex gap-1">
             <div className="w-1 h-4 bg-white rounded-full animate-pulse"></div>
             <div className="w-1 h-4 bg-white rounded-full animate-pulse [animation-delay:0.2s]"></div>
             <div className="w-1 h-4 bg-white rounded-full animate-pulse [animation-delay:0.4s]"></div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Live Voice</span>
        </div>
      )}
    </div>
  );
};

export default App;
