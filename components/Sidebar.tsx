// file: components/Sidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { PlusCircle, User, LogOut, MoreHorizontal, Edit, Trash2 } from 'lucide-react'; // Import icon cần thiết
import type { Session } from '@supabase/auth-helpers-nextjs';
import ConfirmLogoutModal from './ConfirmLogoutModal';

// Dữ liệu giả lập
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
  
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  // State để theo dõi menu Sửa/Xóa của cuộc trò chuyện nào đang được mở
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setLogoutModalOpen(false);
    router.refresh();
  };

  // Các hàm xử lý Sửa/Xóa (tạm thời chỉ in ra để kiểm tra)
  const handleRename = (id: number, currentTitle: string) => {
    const newTitle = prompt("Nhập tên mới cho cuộc trò chuyện:", currentTitle);
    if (newTitle && newTitle.trim() !== "") {
        console.log(`Đổi tên ID ${id} thành: ${newTitle}`);
        // TODO: Cập nhật tên trong database
    }
    setActiveMenuId(null); // Đóng menu
  };

  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa cuộc trò chuyện này không?")) {
        console.log(`Xóa cuộc trò chuyện ID ${id}`);
        // TODO: Xóa cuộc trò chuyện trong database
    }
    setActiveMenuId(null); // Đóng menu
  };

  return (
    <>
      <div className="w-1/4 max-w-xs bg-gray-800 text-white flex flex-col p-4 h-screen">
        {/* Phần thông tin người dùng */}
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

        {/* Lịch sử chat (ĐÃ CÓ CHỨC NĂNG SỬA/XÓA) */}
        <div className="flex-grow overflow-y-auto pr-2">
          <p className="text-xs text-gray-400 mb-2 font-semibold uppercase">Lịch sử</p>
          <div className="space-y-1">
            {mockHistory.map((item) => (
              <div key={item.id} className="group relative">
                <a href="#" className="flex items-center justify-between w-full p-2 rounded-md text-sm hover:bg-gray-700">
                  <span className="truncate flex-grow">{item.title}</span>
                  <button 
                    onClick={(e) => {
                        e.preventDefault(); // Ngăn không cho link hoạt động
                        setActiveMenuId(activeMenuId === item.id ? null : item.id);
                    }} 
                    className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </a>
                {/* Menu Sửa/Xóa */}
                {activeMenuId === item.id && (
                  <div className="absolute right-0 mt-1 z-10 bg-gray-900 rounded-md shadow-lg p-1 w-36">
                    <button onClick={() => handleRename(item.id, item.title)} className="w-full flex items-center gap-2 text-left text-sm p-2 hover:bg-gray-700 rounded-md">
                      <Edit size={14} /> Sửa tên
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="w-full flex items-center gap-2 text-left text-sm p-2 hover:bg-gray-700 rounded-md text-red-400">
                      <Trash2 size={14} /> Xóa
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Menu dưới */}
        <div className="border-t border-gray-700 pt-4 mt-4 space-y-1 text-sm">
          <Link href="/profile" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700">
            <User size={18} />
            <span>Quản lý tài khoản</span>
          </Link>
          <button onClick={() => setLogoutModalOpen(true)} className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-700 text-red-400 hover:text-red-300">
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

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