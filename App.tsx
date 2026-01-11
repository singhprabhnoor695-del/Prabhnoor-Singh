
import React, { useState, useEffect, useCallback } from 'react';
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
    return localStorage.getItem('connectifyr_auth') === 'true';
  });
  
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string, avatar?: string } | null>(() => {
    const saved = localStorage.getItem('connectifyr_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('connectifyr_contacts');
    return saved ? JSON.parse(saved) : [AI_CONTACT];
  });
  
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem('connectifyr_chats');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [activeCall, setActiveCall] = useState<{ type: 'voice' | 'video', contactId: string } | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem('connectifyr_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('connectifyr_chats', JSON.stringify(chatHistories));
  }, [chatHistories]);

  const handleLogin = (email: string, name: string) => {
    const defaultAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}&backgroundColor=ffd5dc`;
    const user = { email, name, avatar: defaultAvatar };
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('connectifyr_auth', 'true');
    localStorage.setItem('connectifyr_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.clear();
    setContacts([AI_CONTACT]);
    setChatHistories({});
    setActiveContactId(null);
    setShowChatOnMobile(false);
  };

  const handleAddContact = (name: string, email: string) => {
    const newContact: Contact = {
      id: Date.now().toString(),
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}&backgroundColor=ffd5dc`,
      status: 'offline',
      lastMessage: 'Newly added nakama!'
    };
    setContacts(prev => [...prev, newContact]);
  };

  const handleSelectContact = (id: string) => {
    setActiveContactId(id);
    if (isMobileView) setShowChatOnMobile(true);
  };

  const handleBackToContacts = () => {
    setShowChatOnMobile(false);
  };

  const handleChangeAvatar = (url: string) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, avatar: url };
      setCurrentUser(updatedUser);
      localStorage.setItem('connectifyr_user', JSON.stringify(updatedUser));
    }
  };

  const activeContact = contacts.find(c => c.id === activeContactId) || null;
  const activeMessages = activeContactId ? (chatHistories[activeContactId] || []) : [];

  const handleSendMessage = useCallback(async (text: string, media?: { url: string, type: 'image' | 'video' | 'file', name?: string }) => {
    if (!activeContactId) return;

    const messageId = Date.now().toString();
    const newMessage: Message = {
      id: messageId,
      senderId: 'me',
      text,
      mediaUrl: media?.url,
      mediaType: media?.type,
      fileName: media?.name,
      timestamp: Date.now(),
      type: media ? 'media' : 'text',
      status: 'sent'
    };

    setChatHistories(prev => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), newMessage]
    }));

    setTimeout(() => {
      setChatHistories(prev => {
        const history = prev[activeContactId] || [];
        const updated = history.map(m => m.id === messageId ? { ...m, status: 'read' as const } : m);
        return { ...prev, [activeContactId]: updated };
      });
    }, 2000);

    if (activeContactId === 'gemini-ai') {
      setIsTyping(true);
      
      const history = (chatHistories['gemini-ai'] || []).slice(-6).map(m => {
        const parts: any[] = [];
        if (m.text) parts.push({ text: m.text });
        if (m.mediaUrl && m.mediaType === 'image') {
          const base64Data = m.mediaUrl.split(',')[1];
          parts.push({ inlineData: { mimeType: 'image/png', data: base64Data } });
        }
        return {
          role: (m.senderId === 'me' ? 'user' : 'model') as 'user' | 'model',
          parts
        };
      });

      const effectivePrompt = text || (media?.type === 'image' ? "What do you think of this image?" : "Check this out!");
      
      try {
        const responseText = await getGeminiResponse(effectivePrompt, history);
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
          generateSpeech(responseText).then(audioBase64 => {
            if (audioBase64) {
              playPCM(audioBase64).finally(() => setIsSpeaking(false));
            } else {
              setIsSpeaking(false);
            }
          }).catch(() => setIsSpeaking(false));
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
    <div className="flex h-screen w-screen overflow-hidden antialiased md:p-6 lg:p-10 justify-center items-center">
      <div className="flex w-full h-full max-w-[1600px] bg-white md:bg-white/95 md:backdrop-blur-md md:shadow-[20px_20px_0px_#000] md:rounded-[2.5rem] md:border-[6px] border-black transition-all app-container overflow-hidden">
        
        {/* Responsive Layout Handling */}
        <div className={`h-full border-r-4 border-black transition-all duration-300 ${isMobileView ? (showChatOnMobile ? 'hidden' : 'w-full') : 'w-80 lg:w-96'}`}>
          <Sidebar 
            contacts={contacts.map(c => ({
              ...c,
              lastMessage: chatHistories[c.id]?.length 
                ? (chatHistories[c.id][chatHistories[c.id].length - 1].mediaType ? `Shared ${chatHistories[c.id][chatHistories[c.id].length - 1].mediaType}` : chatHistories[c.id][chatHistories[c.id].length - 1].text)
                : c.lastMessage
            }))} 
            activeContactId={activeContactId} 
            onSelectContact={handleSelectContact}
            currentUserEmail={currentUser.email}
            currentUserAvatar={currentUser.avatar}
            onLogout={handleLogout}
            onAddContact={handleAddContact}
            onChangeAvatar={handleChangeAvatar}
          />
        </div>

        <div className={`flex-1 h-full transition-all duration-300 ${isMobileView && !showChatOnMobile ? 'hidden' : 'flex'}`}>
          <ChatWindow 
            contact={activeContact}
            messages={activeMessages}
            isTyping={isTyping}
            onSendMessage={handleSendMessage}
            onVoiceCall={() => setActiveCall({ type: 'voice', contactId: activeContactId! })}
            onVideoCall={() => setActiveCall({ type: 'video', contactId: activeContactId! })}
            onBack={isMobileView ? handleBackToContacts : undefined}
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
        <div className="fixed bottom-24 md:bottom-12 right-6 md:right-12 bg-pink-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-3xl border-4 border-black shadow-[6px_6px_0px_#000] md:shadow-[10px_10px_0px_#000] flex items-center gap-3 md:gap-4 animate-bounce z-[100]">
          <div className="flex gap-1">
            <div className="w-1 md:w-1.5 h-4 md:h-6 bg-white animate-pulse"></div>
            <div className="w-1 md:w-1.5 h-4 md:h-6 bg-white animate-pulse [animation-delay:0.2s]"></div>
            <div className="w-1 md:w-1.5 h-4 md:h-6 bg-white animate-pulse [animation-delay:0.4s]"></div>
          </div>
          <span className="text-[10px] md:text-sm font-black uppercase tracking-widest">Speaking...</span>
        </div>
      )}
    </div>
  );
};

export default App;
