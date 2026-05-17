'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchChats, Chat } from '@/lib/api';
import { getSocket } from '@/lib/socket';

export default function ChatList({ activeChatId }: { activeChatId?: string }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchChats().then(setChats).catch(console.error);

    const socket = getSocket();
    socket.on('chat_updated', (updated: Omit<Chat, 'avatar'>[]) => {
      setChats(prev => {
        const map = new Map(prev.map(c => [c.id, c]));
        updated.forEach(u => map.set(u.id, { ...map.get(u.id)!, ...u }));
        return Array.from(map.values());
      });
    });
    return () => { socket.off('chat_updated'); };
  }, []);

  return (
    <div className="w-80 h-screen border-r border-gray-200 flex flex-col bg-white">
      <div className="p-4 border-b border-gray-100">
        <h1 className="text-lg font-semibold text-blue-600">Zaloweb</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        {chats.map(chat => (
          <button
            key={chat.id}
            onClick={() => router.push(`/chat/${chat.id}`)}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors ${
              activeChatId === chat.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
            }`}
          >
            {chat.avatar ? (
              <img src={chat.avatar} alt={chat.name} className="w-10 h-10 rounded-full flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold flex-shrink-0">
                {chat.name[0] || '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">{chat.name}</div>
              <div className="text-sm text-gray-500 truncate">{chat.lastMessage}</div>
            </div>
          </button>
        ))}
        {chats.length === 0 && (
          <p className="text-center text-gray-400 text-sm mt-8">Đang tải danh sách chat...</p>
        )}
      </div>
    </div>
  );
}
