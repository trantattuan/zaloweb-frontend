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

export async function fetchChats(): Promise<Chat[]> {
  const res = await fetch(`${BASE}/api/chats`);
  if (!res.ok) throw new Error('Failed to fetch chats');
  return res.json();
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
