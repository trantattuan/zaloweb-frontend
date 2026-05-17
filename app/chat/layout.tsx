import ChatList from '@/components/ChatList';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <ChatList />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
