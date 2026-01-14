
import React, { useState } from 'react';
import { Contact } from '../types';
import { ConnectifyrIcon } from './Icon';

interface SidebarProps {
  contacts: Contact[];
  activeContactId: string | null;
  onSelectContact: (id: string) => void;
  currentUserEmail: string;
  currentUserName: string;
  currentUserAvatar?: string;
  onLogout: () => void;
  onAddContact: (name: string, email: string) => void;
  onChangeAvatar: (url: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  contacts, 
  activeContactId, 
  onSelectContact, 
  currentUserName,
  currentUserAvatar,
  onLogout, 
  onAddContact,
  onChangeAvatar
}) => {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName && newEmail) {
      onAddContact(newName, newEmail);
      setNewName('');
      setNewEmail('');
      setShowAddModal(false);
    }
  };

  return (
    <div className="w-full flex flex-col bg-white h-full relative overflow-hidden">
      {/* Dynamic Header: Scales for desktop/mobile */}
      <div className="p-4 md:p-6 border-b-4 border-black flex flex-col gap-4 bg-yellow-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <ConnectifyrIcon className="w-8 h-8 md:w-10 md:h-10" />
            <h1 className="font-black text-base md:text-lg leading-tight text-black italic uppercase tracking-tighter">CONNECTIFYR</h1>
          </div>
          <div className="flex gap-1.5 md:gap-2">
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white p-2 md:p-2.5 border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all"
            >
              <i className="fas fa-plus text-sm"></i>
            </button>
            <button onClick={onLogout} className="bg-red-400 hover:bg-red-500 text-white p-2 md:p-2.5 border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all">
              <i className="fas fa-sign-out-alt text-sm"></i>
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-white/40 p-2 rounded-2xl border-2 border-black/10">
          <button 
            onClick={() => setShowAvatarPicker(!showAvatarPicker)}
            className="relative group shrink-0"
          >
            <img 
              src={currentUserAvatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=me'} 
              className="w-10 h-10 rounded-full border-2 border-black bg-white shadow-[2px_2px_0px_#000] object-cover" 
              alt="me" 
            />
          </button>
          <div className="min-w-0 overflow-hidden">
            <p className="text-[11px] md:text-[12px] font-black uppercase text-black truncate italic leading-none">{currentUserName}</p>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full border border-black animate-pulse"></div>
              <span className="text-[8px] font-bold uppercase text-black/60 tracking-widest">Active Nakama</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search: Optimized for touch */}
      <div className="p-3 md:p-4 bg-white border-b-2 border-black">
        <div className="relative">
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find a friend..." 
            className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-gray-50 border-4 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white transition-all shadow-[3px_3px_0px_#000]"
          />
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-black opacity-50"></i>
        </div>
      </div>

      {/* Contact List: Responsive Padding */}
      <div className="flex-1 overflow-y-auto p-2 md:p-3 space-y-2 custom-scrollbar">
        {filteredContacts.map(contact => (
          <div 
            key={contact.id}
            onClick={() => onSelectContact(contact.id)}
            className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 cursor-pointer rounded-2xl border-4 transition-all ${
              activeContactId === contact.id 
              ? 'bg-pink-100 border-black shadow-[4px_4px_0px_#000] -translate-y-1' 
              : 'border-transparent hover:bg-gray-50 active:scale-[0.98]'
            }`}
          >
            <div className="relative shrink-0">
              <img src={contact.avatar} alt={contact.name} className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 md:border-4 border-black object-cover bg-white shadow-[2px_2px_0px_#000]" />
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 rounded-full border-2 md:border-4 border-black ${contact.status === 'online' ? 'bg-green-400' : 'bg-gray-400'}`}></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <h3 className="font-black text-black truncate text-[13px] md:text-sm uppercase italic">{contact.name}</h3>
                <span className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase">Just now</span>
              </div>
              <p className="text-[11px] md:text-xs font-bold text-gray-500 truncate italic">
                {contact.lastMessage || 'Start a convo!'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Contact Modal: Fullscreen on mobile */}
      {showAddModal && (
        <div className="absolute inset-0 z-50 bg-white md:bg-white/95 flex flex-col p-6 animate-in slide-in-from-bottom duration-300 md:border-t-4 border-black">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl md:text-2xl font-black italic uppercase">New Mission</h2>
            <button onClick={() => setShowAddModal(false)} className="text-black p-2"><i className="fas fa-times text-xl"></i></button>
          </div>
          <form onSubmit={handleAddSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase mb-2">Display Name</label>
              <input 
                autoFocus
                type="text" 
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Naruto"
                className="w-full p-4 border-4 border-black rounded-2xl font-bold bg-gray-50 focus:bg-white focus:outline-none shadow-[4px_4px_0px_#000]"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase mb-2">Email Address</label>
              <input 
                type="email" 
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="nakama@connectifyr.com"
                className="w-full p-4 border-4 border-black rounded-2xl font-bold bg-gray-50 focus:bg-white focus:outline-none shadow-[4px_4px_0px_#000]"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-yellow-400 p-4 border-4 border-black rounded-2xl font-black uppercase italic text-lg shadow-[6px_6px_0px_#000] active:translate-y-1 active:shadow-none transition-all"
            >
              Add Friend
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
