const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
}

export interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  fromMe: boolean;
}

let _chatsCache: Chat[] | null = null;

export async function fetchChats(force = false): Promise<Chat[]> {
  if (_chatsCache && !force) return _chatsCache;
  const res = await fetch(`${BASE}/api/chats`);
  if (!res.ok) throw new Error('Failed to fetch chats');
  _chatsCache = await res.json();
  return _chatsCache!;
}

export function updateChatsCache(updater: (prev: Chat[]) => Chat[]) {
  if (_chatsCache) _chatsCache = updater(_chatsCache);
}

export async function fetchMessages(chatId: string): Promise<Message[]> {
  const res = await fetch(`${BASE}/api/chats/${chatId}/messages`);
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
}

export async function sendMessage(chatId: string, content: string): Promise<void> {
  const res = await fetch(`${BASE}/api/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, content }),
  });
  if (!res.ok) throw new Error('Failed to send message');
}

export async function fetchStatus(): Promise<{ loggedIn: boolean; username: string | null }> {
  const res = await fetch(`${BASE}/api/status`);
  return res.json();
}
