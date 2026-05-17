import { Message } from '@/lib/api';

export default function MessageBubble({ message }: { message: Message }) {
  const isMe = message.fromMe;
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm break-words ${
          isMe
            ? 'bg-blue-500 text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
        }`}
      >
        {!isMe && (
          <div className="text-xs font-semibold text-blue-600 mb-1">{message.sender}</div>
        )}
        <p>{message.content}</p>
        {message.timestamp && (
          <div className={`text-xs mt-1 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
            {new Date(Number(message.timestamp)).toLocaleTimeString('vi-VN', {
              hour: '2-digit', minute: '2-digit',
            })}
          </div>
        )}
      </div>
    </div>
  );
}
