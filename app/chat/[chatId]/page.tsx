'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import MessageBubble from '@/components/MessageBubble';
import { fetchChats, fetchMessages, sendMessage, Message } from '@/lib/api';
import { getSocket } from '@/lib/socket';

function getDateLabel(timestamp: string): string {
  if (!timestamp) return '';
  const ts = Number(timestamp);
  if (!ts) return '';
  // Zalo timestamps may be in seconds or ms — detect by magnitude
  const d = ts > 1e12 ? new Date(ts) : new Date(ts * 1000);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Hôm nay';
  if (d.toDateString() === yesterday.toDateString()) return 'Hôm qua';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

interface DateGroup { label: string; messages: Message[]; }

function groupByDate(messages: Message[]): DateGroup[] {
  const groups: DateGroup[] = [];
  for (const msg of messages) {
    const label = getDateLabel(msg.timestamp);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.messages.push(msg);
    } else {
      groups.push({ label, messages: [msg] });
    }
  }
  return groups;
}

export default function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const [chatName, setChatName] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [input, setInput]       = useState('');
  const [sending, setSending]   = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId) return;
    setMessages([]);
    setError('');
    setLoading(true);

    fetchChats().then(chats => {
      const match = chats.find(c => c.id === chatId);
      if (match) setChatName(match.name);
    }).catch(() => {});

    fetchMessages(chatId)
      .then(msgs => { setMessages(msgs); setLoading(false); })
      .catch(err  => { setError('Không tải được tin nhắn — ' + err.message); setLoading(false); });

    const socket = getSocket();
    socket.on('new_message', (msg: Message) => setMessages(prev => [...prev, msg]));
    return () => { socket.off('new_message'); };
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    try { await sendMessage(chatId, input.trim()); setInput(''); }
    catch (err) { console.error('Send failed:', err); }
    finally { setSending(false); }
  }

  const groups = groupByDate(messages);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-200 bg-white shadow-sm flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm">
          {chatName ? chatName[0] : '?'}
        </div>
        <span className="font-semibold text-gray-900 text-base truncate">
          {chatName || 'Đang tải...'}
        </span>
      </div>

      {/* Message area */}
      <div className="flex-1 overflow-y-auto p-3">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-sm">Đang tải tin nhắn...</p>
          </div>
        )}
        {!loading && error && (
          <div className="flex items-center justify-center h-full">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        {!loading && !error && messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-sm">Chưa có tin nhắn</p>
          </div>
        )}

        {groups.map(group => (
          <div key={group.label || 'no-date'}>
            {group.label && (
              <div className="flex items-center justify-center py-3">
                <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full select-none">
                  {group.label}
                </span>
              </div>
            )}
            <div className="space-y-0.5">
              {group.messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Send input */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 px-4 py-3 border-t border-gray-200 bg-white"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Nhập tin nhắn..."
          disabled={sending}
          className="flex-1 px-4 py-2 rounded-full border border-gray-300 text-sm focus:outline-none focus:border-blue-400 disabled:bg-gray-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="px-5 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Gửi
        </button>
      </form>
    </div>
  );
}
