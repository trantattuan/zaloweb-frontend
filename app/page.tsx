'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PhoneLogin from '@/components/PhoneLogin';
import { fetchStatus } from '@/lib/api';

export default function HomePage() {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchStatus()
      .then(({ loggedIn }) => {
        if (loggedIn) router.replace('/chat');
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [router]);

  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400 text-sm">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  return <PhoneLogin onLoggedIn={() => router.replace('/chat')} />;
}
