'use client'

import { User } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

// Định nghĩa kiểu dữ liệu cho một cuộc trò chuyện
type Conversation = {
  id: string;
  title: string;
}

// Định nghĩa các "props" (dữ liệu đầu vào) mà Sidebar sẽ nhận từ trang chính
type SidebarProps = {
  user: User | null;
  conversations: Conversation[];
  onNewConversation: () => void;
  onSelectConversation: (id: string) => void;
  activeConversationId: string | null;
  onSignOut: () => void;
}

export default function Sidebar({ user, conversations, onNewConversation, onSelectConversation, activeConversationId, onSignOut }: SidebarProps) {
  return (
    // Cột Sidebar chính
    <div className="w-1/4 bg-gray-800 text-white flex-shrink-0 hidden md:flex flex-col p-4">
      
      {/* Phần thông tin người dùng */}
      <div className="flex items-center gap-3 mb-6 border-b border-gray-700 pb-4">
        <img 
          src={user?.user_metadata?.avatar_url || `https://placehold.co/40x40/ffffff/333333?text=${user?.email?.charAt(0).toUpperCase()}`} 
          alt="Avatar" 
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-grow overflow-hidden">
          <p className="font-semibold text-sm truncate">{user?.user_metadata?.full_name || user?.email}</p>
          {/* Link dẫn đến trang quản lý tài khoản */}
          <Link href="/profile" className="text-xs text-gray-400 hover:underline">
            Quản lý tài khoản
          </Link>
        </div>
      </div>

      {/* Nút tạo cuộc trò chuyện mới */}
      <button 
        onClick={onNewConversation}
        className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
        <span>Tư vấn mới</span>
      </button>

      {/* Danh sách lịch sử các cuộc trò chuyện */}
      <div className="flex-grow overflow-y-auto pr-2">
        <p className="text-xs text-gray-400 mb-2 font-semibold uppercase">Lịch sử</p>
        <div className="space-y-2 text-sm">
          {conversations.length > 0 ? (
            conversations.map(convo => (
              <a 
                key={convo.id} 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onSelectConversation(convo.id);
                }}
                // Đổi màu nền nếu cuộc trò chuyện đang được chọn
                className={`block p-2 rounded-md truncate ${activeConversationId === convo.id ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
              >
                {convo.title}
              </a>
            ))
          ) : (
            // Hiển thị thông báo khi không có lịch sử
            <p className="p-2 text-gray-400 text-xs">Lịch sử trò chuyện của bạn sẽ xuất hiện ở đây.</p>
          )}
        </div>
      </div>

      {/* Nút đăng xuất */}
      <div className="border-t border-gray-700 pt-4 mt-4">
        <button 
          onClick={onSignOut}
          className="w-full flex items-center gap-3 p-2 rounded-md text-red-400 hover:bg-gray-700 hover:text-red-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  )
}

