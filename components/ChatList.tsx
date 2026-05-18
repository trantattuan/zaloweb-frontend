'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { fetchChats, updateChatsCache, Chat } from '@/lib/api';
import { getSocket } from '@/lib/socket';

export default function ChatList() {
  const [chats, setChats]   = useState<Chat[]>([]);
  const [search, setSearch] = useState('');
  const router   = useRouter();
  const pathname = usePathname();

  // Extract active chatId from URL: /chat/<id>
  const activeChatId = pathname?.startsWith('/chat/') ? pathname.split('/')[2] : undefined;

  useEffect(() => {
    fetchChats().then(setChats).catch(console.error);

    const socket = getSocket();
    socket.on('chat_updated', (updated: Omit<Chat, 'avatar'>[]) => {
      setChats(prev => {
        const map = new Map(prev.map(c => [c.id, c]));
        updated.forEach(u => map.set(u.id, { ...map.get(u.id)!, ...u }));
        const next = Array.from(map.values());
        updateChatsCache(() => next);
        return next;
      });
    });
    return () => { socket.off('chat_updated'); };
  }, []);

  const filtered = search.trim()
    ? chats.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : chats;

  return (
    <div className="w-80 h-screen border-r border-gray-200 flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <h1 className="text-lg font-semibold text-blue-600 mb-3">Zaloweb</h1>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tìm kiếm..."
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue-400 bg-gray-50"
        />
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map(chat => (
          <button
            key={chat.id}
            onClick={() => router.push(`/chat/${chat.id}`)}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors ${
              activeChatId === chat.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
            }`}
          >
            {chat.avatar ? (
              <img src={chat.avatar} alt={chat.name} className="w-10 h-10 rounded-full flex-shrink-0 object-cover" />
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
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 text-sm mt-8">
            {search ? 'Không tìm thấy hội thoại' : 'Đang tải danh sách chat...'}
          </p>
        )}
      </div>
    </div>
  );
}
