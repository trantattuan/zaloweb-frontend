import { Message } from '@/lib/api';

export default function MessageBubble({ message }: { message: Message }) {
  if (!message.content && !message.sender) return null;

  const ts = Number(message.timestamp);
  const timeStr = ts
    ? new Date(ts).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    : '';

  const sender = message.fromMe ? 'Tôi' : (message.sender || '?');

  return (
    <div className={`flex ${message.fromMe ? 'justify-end' : 'justify-start'} mb-1`}>
      <div className={`flex items-baseline gap-1.5 py-1.5 px-3 rounded-lg text-sm max-w-[80%] ${
        message.fromMe ? 'bg-blue-50' : 'bg-gray-50'
      }`}>
        <span className={`font-semibold shrink-0 ${message.fromMe ? 'text-blue-600' : 'text-gray-800'}`}>
          {sender}
        </span>
        <span className="text-gray-300 shrink-0">:</span>
        {timeStr && (
          <>
            <span className="text-gray-400 shrink-0 text-xs tabular-nums">{timeStr}</span>
            <span className="text-gray-300 shrink-0">:</span>
          </>
        )}
        <span className={`break-words min-w-0 ${message.fromMe ? 'text-blue-700' : 'text-gray-700'}`}>
          {message.content || '[hình ảnh / sticker]'}
        </span>
      </div>
    </div>
  );
}
