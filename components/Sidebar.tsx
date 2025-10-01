// file: components/Sidebar.tsx
'use client';

import { useState } from 'react'; // <-- 1. Import thêm useState
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { PlusCircle, User, LogOut } from 'lucide-react';
import type { Session } from '@supabase/auth-helpers-nextjs';
import ConfirmLogoutModal from './ConfirmLogoutModal'; // <-- 2. Import component mới

// Giả lập dữ liệu lịch sử chat
const mockHistory = [
  { id: 1, title: 'Học phí ngành Kế toán' },
  { id: 2, title: 'Cơ hội việc làm Marketing' },
  { id: 3, title: 'Các CLB học thuật' },
  { id: 4, title: 'Phương thức xét tuyển 2026' },
];

interface SidebarProps {
  session: Session | null;
}

const Sidebar: React.FC<SidebarProps> = ({ session }) => {
  const supabase = createClientComponentClient();
  const router = useRouter();
  
  // 3. State để quản lý việc đóng/mở modal xác nhận
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);

  // Hàm xử lý đăng xuất không đổi
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setLogoutModalOpen(false); // Đóng modal sau khi đăng xuất
    router.refresh();
  };

  return (
    <> {/* Bọc mọi thứ trong Fragment để thêm modal */}
      <div className="w-1/4 max-w-xs bg-gray-800 text-white flex flex-col p-4 h-screen">
        {/* Thông tin người dùng (đã cập nhật) */}
        <div className="flex items-center gap-3 mb-6 p-2 border-b border-gray-700 pb-4">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white">
            {(session?.user?.user_metadata?.full_name?.charAt(0) || session?.user?.email?.charAt(0) || 'A').toUpperCase()}
          </div>
          <span className="font-semibold text-sm truncate">
            {session?.user?.user_metadata?.full_name || session?.user?.email}
          </span>
        </div>

        {/* Nút cuộc trò chuyện mới */}
        <button className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors text-sm font-semibold">
          <PlusCircle size={18} />
          <span>Cuộc trò chuyện mới</span>
        </button>

        {/* Lịch sử chat */}
        <div className="flex-grow overflow-y-auto pr-2">
          <p className="text-xs text-gray-400 mb-2 font-semibold uppercase">Lịch sử</p>
          <div className="space-y-1">
            {mockHistory.map((item) => (
              <a key={item.id} href="#" className={`block p-2 rounded-md text-sm truncate ${item.id === 1 ? 'bg-gray-700/80' : 'hover:bg-gray-700'}`}>
                {item.title}
              </a>
            ))}
          </div>
        </div>

        {/* Menu dưới */}
        <div className="border-t border-gray-700 pt-4 mt-4 space-y-1 text-sm">
          <Link href="/profile" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700">
            <User size={18} />
            <span>Quản lý tài khoản</span>
          </Link>
          {/* 4. Nút đăng xuất bây giờ sẽ mở modal */}
          <button
            onClick={() => setLogoutModalOpen(true)}
            className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-700 text-red-400 hover:text-red-300"
          >
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* 5. Render modal xác nhận */}
      <ConfirmLogoutModal
        isOpen={isLogoutModalOpen}
        userEmail={session?.user?.email || ''}
        onConfirm={handleSignOut}
        onCancel={() => setLogoutModalOpen(false)}
      />
    </>
  );
};

export default Sidebar;