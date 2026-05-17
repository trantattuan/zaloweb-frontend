'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import MessageBubble from '@/components/MessageBubble';
import { fetchMessages, sendMessage, Message } from '@/lib/api';
import { getSocket } from '@/lib/socket';

export default function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState('');
  const [sending, setSending]     = useState(false);
  const bottomRef                  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId) return;
    fetchMessages(chatId).then(setMessages).catch(console.error);

    const socket = getSocket();
    socket.on('new_message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => { socket.off('new_message'); };
  }, [chatId]);

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage(chatId, input.trim());
      setInput('');
    } catch (err) {
      console.error('Send failed:', err);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
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
