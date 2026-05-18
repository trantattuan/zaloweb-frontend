'use client';
import { useEffect, useRef, useState } from 'react';
import { getSocket } from '@/lib/socket';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

type Mode = 'form' | 'streaming';

interface Screenshot {
  image: string;
  width: number;
  height: number;
}

export default function PhoneLogin({ onLoggedIn }: { onLoggedIn: (username: string) => void }) {
  const [phone, setPhone]       = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode]         = useState<Mode>('form');
  const [error, setError]       = useState<string | null>(null);
  const [screenshot, setScreenshot] = useState<Screenshot | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const socket = getSocket();
    socket.on('page_screenshot', (data: Screenshot) => {
      setScreenshot(data);
      if (mode !== 'streaming') setMode('streaming');
    });
    socket.on('logged_in', ({ username }: { username: string }) => onLoggedIn(username));
    socket.on('login_error', ({ error: msg }: { error: string }) => {
      setError(msg);
      setMode('form');
    });
    return () => {
      socket.off('page_screenshot');
      socket.off('logged_in');
      socket.off('login_error');
    };
  }, [onLoggedIn, mode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMode('streaming');
    try {
      const res = await fetch(`${BACKEND}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Lỗi kết nối'); setMode('form'); }
    } catch {
      setError('Không kết nối được backend');
      setMode('form');
    }
  }

  // Click trên ảnh → tính tọa độ gốc → emit page_click
  function handleImageClick(e: React.MouseEvent<HTMLImageElement>) {
    if (!screenshot || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const scaleX = screenshot.width  / rect.width;
    const scaleY = screenshot.height / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top)  * scaleY);
    getSocket().emit('page_click', { x, y });
  }

  if (mode === 'streaming') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 gap-3 p-4">
        <div className="text-white text-sm font-medium">
          Điều khiển trình duyệt — click vào ảnh để tương tác (giải CAPTCHA...)
        </div>
        {screenshot ? (
          <img
            ref={imgRef}
            src={screenshot.image}
            alt="Browser"
            onClick={handleImageClick}
            className="rounded-xl border border-gray-600 cursor-crosshair max-w-full"
            style={{ maxHeight: '80vh', objectFit: 'contain' }}
          />
        ) : (
          <div className="text-gray-400 text-sm">Đang tải browser...</div>
        )}
        <button
          onClick={() => { setMode('form'); setError(null); }}
          className="text-gray-400 text-xs underline hover:text-white"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 gap-6">
      <div className="text-2xl font-bold text-blue-600">Zaloweb</div>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-md p-8 flex flex-col gap-4 w-80"
      >
        <h2 className="text-lg font-semibold text-gray-700 text-center">Đăng nhập Zalo</h2>
        <input
          type="tel"
          placeholder="Số điện thoại"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        {error && <p className="text-red-500 text-xs text-center">{error}</p>}
        <button
          type="submit"
          className="bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 transition"
        >
          Đăng nhập
        </button>
      </form>
    </div>
  );
}
