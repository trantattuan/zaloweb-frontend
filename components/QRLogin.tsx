'use client';
import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';

export default function QRLogin({ onLoggedIn }: { onLoggedIn: (username: string) => void }) {
  const [qrSrc, setQrSrc] = useState<string | null>(null);

  useEffect(() => {
    const socket = getSocket();
    socket.on('qr_ready', ({ qr }: { qr: string }) => setQrSrc(qr));
    socket.on('logged_in', ({ username }: { username: string }) => onLoggedIn(username));
    return () => { socket.off('qr_ready'); socket.off('logged_in'); };
  }, [onLoggedIn]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 gap-6">
      <div className="text-2xl font-bold text-blue-600">Zaloweb</div>
      <p className="text-gray-500">Dùng Zalo trên điện thoại để quét mã QR</p>
      {qrSrc ? (
        <img src={qrSrc} alt="QR Code" className="w-64 h-64 border-4 border-blue-500 rounded-xl" />
      ) : (
        <div className="w-64 h-64 flex items-center justify-center border-4 border-dashed border-gray-300 rounded-xl">
          <span className="text-gray-400 text-sm">Đang tải mã QR...</span>
        </div>
      )}
    </div>
  );
}
