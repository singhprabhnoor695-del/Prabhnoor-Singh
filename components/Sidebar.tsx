
import React, { useState } from 'react';
import { Contact } from '../types';
import { ConnectifyrIcon } from './Icon';

interface SidebarProps {
  contacts: Contact[];
  activeContactId: string | null;
  onSelectContact: (id: string) => void;
  currentUserEmail: string;
  currentUserName: string; // Added currentUserName
  currentUserAvatar?: string;
  onLogout: () => void;
  onAddContact: (name: string, email: string) => void;
  onChangeAvatar: (url: string) => void;
}

/**
 * GENERATING 110+ THEMED ANIME & CHARACTER DPS
 */
const generateVarietyDps = () => {
  const dps: string[] = [];
  
  const blueSeeds = ['Dora', 'Nobita', 'Shizuka', 'Suneo', 'Gian', 'Dorami', 'Robot', 'Gadget', 'Bell', 'Future'];
  for (let i = 0; i < 30; i++) {
    const seed = blueSeeds[i % blueSeeds.length] + i;
    dps.push(`https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}&backgroundColor=b6e3f4,00a0e9`);
  }
  
  const kidsSeeds = ['Shin', 'Himawari', 'Kazama', 'Masao', 'Nene', 'Bo-chan', 'ActionMask', 'Buriburi', 'Chocobi', 'Misae'];
  for (let i = 0; i < 30; i++) {
    const seed = kidsSeeds[i % kidsSeeds.length] + i;
    dps.push(`https://api.dicebear.com/7.x/big-ears/svg?seed=${seed}&backgroundColor=ffd5dc,ffdfbf`);
  }

  const actionSeeds = ['Goku', 'Naruto', 'Luffy', 'Ichigo', 'Zoro', 'Saitama', 'Deku', 'Tanjiro', 'Asta', 'Eren'];
  for (let i = 0; i < 30; i++) {
    const seed = actionSeeds[i % actionSeeds.length] + i;
    dps.push(`https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}&backgroundColor=ffdfbf,c0aede`);
  }

  for (let i = 0; i < 25; i++) {
    dps.push(`https://api.dicebear.com/7.x/notionists/svg?seed=AnimeArt${i}&backgroundColor=f1f1f1,d1d4f9`);
  }

  return dps;
};

const VARIETY_PRESET_AVATARS = generateVarietyDps();

const Sidebar: React.FC<SidebarProps> = ({ 
  contacts, 
  activeContactId, 
  onSelectContact, 
  currentUserEmail, 
  currentUserName, // Consuming the name
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
    <div className="w-full md:w-80 lg:w-96 flex flex-col border-r-4 border-black bg-[#fffafa] h-full shrink-0 relative">
      <div className="p-5 border-b-4 border-black flex flex-col gap-4 bg-yellow-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ConnectifyrIcon className="w-10 h-10" />
            <h1 className="font-black text-lg leading-tight text-black italic uppercase tracking-tighter">CONNECTIFYR</h1>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white p-2 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all"
            >
              <i className="fas fa-plus"></i>
            </button>
            <button onClick={onLogout} className="bg-red-400 hover:bg-red-500 text-white p-2 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all">
              <i className="fas fa-sign-out-alt"></i>
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
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <i className="fas fa-camera text-[10px] text-white"></i>
            </div>
          </button>
          <div className="min-w-0 overflow-hidden">
            {/* Displaying Name instead of Email */}
            <p className="text-[12px] font-black uppercase text-black truncate leading-none mb-1 italic">{currentUserName}</p>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full border border-black animate-pulse"></div>
              <span className="text-[8px] font-bold uppercase text-black/60 tracking-widest">Nakama Member</span>
            </div>
          </div>
        </div>
      </div>

      {showAvatarPicker && (
        <div className="absolute top-36 left-4 right-4 z-40 bg-white border-4 border-black rounded-2xl p-4 shadow-[12px_12px_0px_#000] animate-in zoom-in-95 duration-200 max-h-[60vh] flex flex-col">
          <div className="flex justify-between items-center mb-4 bg-black text-white p-2 rounded-lg">
            <h3 className="text-xs font-black uppercase italic tracking-widest">Nakama Gallery (115+ Styles)</h3>
            <button onClick={() => setShowAvatarPicker(false)} className="hover:text-red-400 transition-colors"><i className="fas fa-times"></i></button>
          </div>
          <div className="grid grid-cols-4 gap-3 overflow-y-auto p-1 custom-scrollbar">
            {VARIETY_PRESET_AVATARS.map((url, i) => (
              <button 
                key={i} 
                onClick={() => { onChangeAvatar(url); setShowAvatarPicker(false); }}
                className="group relative hover:scale-110 transition-transform active:scale-90"
              >
                <img src={url} className="w-full aspect-square rounded-xl border-2 border-black bg-gray-50 shadow-[3px_3px_0px_#000] object-cover" loading="lazy" />
              </button>
            ))}
          </div>
          <p className="mt-4 text-[9px] font-black text-center text-gray-400 uppercase tracking-tighter italic">Featuring Shin-chan, Doraemon & more!</p>
        </div>
      )}

      <div className="p-4 bg-white border-b-2 border-black">
        <div className="relative">
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your nakama..." 
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-4 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white transition-all shadow-[2px_2px_0px_#000]"
          />
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-black opacity-50"></i>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
        {filteredContacts.map(contact => (
          <div 
            key={contact.id}
            onClick={() => onSelectContact(contact.id)}
            className={`flex items-center gap-4 p-4 cursor-pointer rounded-2xl border-4 transition-all ${
              activeContactId === contact.id 
              ? 'bg-pink-100 border-black shadow-[4px_4px_0px_#000] -translate-y-1' 
              : 'border-transparent hover:bg-gray-100'
            }`}
          >
            <div className="relative shrink-0">
              <img src={contact.avatar} alt={contact.name} className="w-14 h-14 rounded-full border-4 border-black object-cover bg-white shadow-[2px_2px_0px_#000]" />
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-black ${contact.status === 'online' ? 'bg-green-400' : 'bg-gray-400'}`}></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <h3 className="font-black text-black truncate text-sm uppercase italic">{contact.name}</h3>
                <span className="text-[9px] font-black text-gray-400">active</span>
              </div>
              <p className="text-xs font-bold text-gray-500 truncate italic">
                {contact.lastMessage || 'No messages yet'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="absolute inset-0 z-50 bg-white/95 flex flex-col p-6 animate-in slide-in-from-bottom-full duration-300">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black italic uppercase">New Mission</h2>
            <button onClick={() => setShowAddModal(false)} className="text-black text-2xl"><i className="fas fa-times"></i></button>
          </div>
          <form onSubmit={handleAddSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase mb-2">Nakama Name</label>
              <input 
                autoFocus
                type="text" 
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Ex: Naruto Uzumaki"
                className="w-full p-4 border-4 border-black rounded-2xl font-bold bg-gray-50 focus:bg-white focus:outline-none shadow-[4px_4px_0px_#000]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase mb-2">Digital Address (Email)</label>
              <input 
                type="email" 
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="Ex: hokage@leaf.village"
                className="w-full p-4 border-4 border-black rounded-2xl font-bold bg-gray-50 focus:bg-white focus:outline-none shadow-[4px_4px_0px_#000]"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-yellow-400 p-4 border-4 border-black rounded-2xl font-black uppercase italic text-xl shadow-[6px_6px_0px_#000] active:translate-y-1 active:shadow-none transition-all"
            >
              Add to Squad!
            </button>
          </form>
        </div>
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #000;
          border-radius: 10px;
          border: 2px solid #f1f1f1;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
