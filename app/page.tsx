'use client'

import { useState, useEffect, FormEvent } from 'react'
import { createClientComponentClient, User } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '../components/Sidebar' // Import component Sidebar

// Định nghĩa các kiểu dữ liệu
type Conversation = {
  id: string;
  title: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])

  const router = useRouter()
  const supabase = createClientComponentClient()

  // Hook này sẽ chạy khi trang được tải để kiểm tra và lấy dữ liệu
  useEffect(() => {
    const getUserAndConversations = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)

      if (session?.user) {
        // Tải lịch sử chat từ Supabase
        const { data, error } = await supabase
          .from('conversations')
          .select('id, title')
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Lỗi khi tải lịch sử chat:", error);
        } else if (data) {
          setConversations(data);
        }
      }
    }
    getUserAndConversations()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === 'SIGNED_OUT') {
        setConversations([])
        router.refresh();
      } else if (event === 'SIGNED_IN') {
        router.refresh();
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase, router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleNewConversation = () => {
    // Logic để tạo cuộc trò chuyện mới sẽ được thêm vào đây
    alert("Chức năng tạo cuộc trò chuyện mới!");
  }

  const handleSelectConversation = (id: string) => {
    // Logic để chọn và tải một cuộc trò chuyện cũ sẽ được thêm vào đây
    alert(`Bạn đã chọn cuộc trò chuyện có ID: ${id}`);
  }

  return (
    <div className="w-full h-screen bg-white flex overflow-hidden">
      {/* Hiển thị Sidebar nếu người dùng đã đăng nhập */}
      {user && (
        <Sidebar 
          user={user}
          conversations={conversations}
          onNewConversation={handleNewConversation}
          onSelectConversation={handleSelectConversation}
          activeConversationId={null} // Tạm thời để null
          onSignOut={handleSignOut}
        />
      )}

      {/* Cửa sổ Chat chính */}
      <div className="flex-1 flex flex-col relative">
        <header className="p-4 border-b flex justify-between items-center bg-white flex-shrink-0">
          <h1 className="text-xl font-bold">Trợ lý ảo HUE</h1>
        </header>
        
        <main className="flex-grow p-6 overflow-y-auto">
          {/* Các tin nhắn sẽ được hiển thị ở đây */}
          <p className="text-gray-500">Bắt đầu cuộc trò chuyện của bạn...</p>
        </main>
        
        {/* Lớp phủ yêu cầu đăng nhập */}
        {!user && (
          <div className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-sm z-10 flex flex-col justify-center items-center text-center p-4">
            <img src="https://placehold.co/150x50/003366/ffffff?text=LOGO+HUE" alt="Logo HUE" className="mb-6" />
            <h2 className="text-2xl font-bold text-gray-800">Chào mừng đến với Trợ lý ảo HUE</h2>
            <p className="text-gray-600 mt-2 mb-6">Vui lòng đăng nhập để bắt đầu cuộc trò chuyện và lưu lại lịch sử.</p>
            <Link 
              href="/login"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105"
            >
              Đăng nhập / Đăng ký
            </Link>
          </div>
        )}

        {/* Ô nhập liệu */}
        <footer className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
          <div className="relative">
            <input 
              type="text" 
              placeholder={user ? "Nhập câu hỏi của bạn..." : "Vui lòng đăng nhập để bắt đầu"}
              disabled={!user}
              className="w-full py-3 pl-4 pr-16 rounded-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
            <button 
              type="submit" 
              disabled={!user}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:bg-gray-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2z"/></svg>
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}

