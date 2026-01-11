
export interface Message {
  id: string;
  senderId: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'file';
  fileName?: string;
  timestamp: number;
  type: 'text' | 'image' | 'voice' | 'media';
  status?: 'sent' | 'read';
}

export interface Contact {
  id: string;
  email: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastMessage?: string;
  lastActive?: number;
}

export interface ChatSession {
  id: string;
  contactId: string;
  messages: Message[];
}
