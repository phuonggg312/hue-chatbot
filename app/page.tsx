// file: app/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient, Session } from '@supabase/auth-helpers-nextjs';
import { Send } from 'lucide-react';

// Import các component giao diện
import Sidebar from '@/components/Sidebar';
import AuthModal from '@/components/AuthModal';
import WelcomeModal from '@/components/WelcomeModal';

// --- Component cho các gợi ý câu hỏi ---
const SuggestionCard = ({ title, suggestions }: { title: string; suggestions: string[] }) => (
  <div className="bg-gray-100 p-4 rounded-lg w-full">
    <h4 className="font-bold mb-3 text-gray-700">{title}</h4>
    <div className="space-y-2">
      {suggestions.map((text, index) => (
        <button key={index} className="text-left text-sm text-blue-600 hover:underline w-full p-2 hover:bg-gray-200 rounded">
          {text}
        </button>
      ))}
    </div>
  </div>
);

// --- Giao diện Chat khi chưa có tin nhắn ---
const WelcomeChat = () => (
    <div className="text-center h-full flex flex-col justify-center items-center px-4">
        <h2 className="text-3xl font-bold text-gray-800">Chào mừng đến với Trợ lý ảo HCE!</h2>
        <p className="text-gray-600 mt-2 mb-8">Tôi có thể giúp gì cho bạn hôm nay?</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
            <SuggestionCard 
                title="Tư vấn Tuyển sinh"
                suggestions={[
                    "Điểm chuẩn năm ngoái?",
                    "Học phí ngành Quản trị Kinh doanh?"
                ]}
            />
            <SuggestionCard 
                title="Tư vấn Học tập"
                suggestions={[
                    "Lộ trình học ngành Marketing?",
                    "Các câu lạc bộ của trường?"
                ]}
            />
        </div>
    </div>
);

// --- Giao diện Chọn Chủ đề cho khách ---
const TopicSelection = ({ onSelectTopic }: { onSelectTopic: (topic: string) => void }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-4">
    <img src="https://placehold.co/150x50/344e41/ffffff?text=LOGO+HCE" alt="Logo HCE" className="mx-auto mb-6"></img>
    <h1 className="text-4xl font-bold mb-4 text-gray-800">Cố vấn HUE</h1>
    <p className="text-lg text-gray-600 mb-8 max-w-xl">
      Để bắt đầu, vui lòng chọn một chủ đề bạn quan tâm. Bạn có thể đăng nhập để lưu lại lịch sử cuộc trò chuyện.
    </p>
    <div className="flex flex-col sm:flex-row gap-4">
      <div onClick={() => onSelectTopic('Tuyển sinh')} className="cursor-pointer p-6 border rounded-lg hover:bg-gray-100 transition-colors w-64">
        <h2 className="text-xl font-semibold">Tư vấn Tuyển sinh</h2>
        <p className="text-sm text-gray-500 mt-2">Học phí, điểm chuẩn, ngành học...</p>
      </div>
      <div onClick={() => onSelectTopic('Học tập')} className="cursor-pointer p-6 border rounded-lg hover:bg-gray-100 transition-colors w-64">
        <h2 className="text-xl font-semibold">Tư vấn Học tập</h2>
        <p className="text-sm text-gray-500 mt-2">Lộ trình, câu lạc bộ, hoạt động...</p>
      </div>
    </div>
  </div>
);


// --- Component chính của trang ---
export default function Home() {
  const supabase = createClientComponentClient();
  
  // State quản lý phiên đăng nhập
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // State quản lý việc hiển thị các modal
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // State quản lý chủ đề chat (cho cả khách và người dùng đã đăng nhập)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // === PHẦN CODE ĐÃ ĐƯỢC SỬA LỖI ===
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        setSession(session);
        setLoading(false);

        // Logic xử lý khi trạng thái thay đổi
        if (event === 'SIGNED_IN') {
            // Khi người dùng đăng nhập thành công
            setShowWelcomeModal(false);
            setShowAuthModal(false);
        } else if (event === 'SIGNED_OUT') {
            // Khi người dùng đăng xuất
            setSelectedTopic(null); // Reset lại chủ đề đã chọn
            setShowWelcomeModal(true); // Hiển thị lại modal chào mừng
        }
    });

    // Kiểm tra session ban đầu khi tải trang
    const getInitialSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setLoading(false);
        if (!session) {
            setShowWelcomeModal(true);
        }
    };

    getInitialSession();

    return () => {
        authListener.subscription.unsubscribe();
    };
  }, [supabase]);
  // === KẾT THÚC PHẦN SỬA LỖI ===

  // === Các hàm xử lý sự kiện cho modal ===
  const handleShowLogin = () => {
    setAuthMode('login');
    setShowWelcomeModal(false);
    setShowAuthModal(true);
  };

  const handleShowSignup = () => {
    setAuthMode('signup');
    setShowWelcomeModal(false);
    setShowAuthModal(true);
  };

  const handleContinueAsGuest = () => {
    setShowWelcomeModal(false);
  };
  
  const handleAuthSuccess = (session: Session) => {
    setSession(session);
    setShowAuthModal(false);
  };

  // === Render giao diện ===
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Đang tải...</div>;
  }

  return (
    <main className="flex h-screen bg-white">
      {/* Sidebar chỉ hiển thị khi đã đăng nhập */}
      {session && <Sidebar session={session} />}

      {/* Nội dung chính */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Render Giao diện Chat hoặc Màn hình Chọn chủ đề */}
        {session || selectedTopic ? (
          // Nếu đã đăng nhập hoặc khách đã chọn chủ đề -> vào giao diện chat
          <>
            <div className="flex-grow p-6 overflow-y-auto">
              <WelcomeChat />
            </div>
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Nhập câu hỏi của bạn..." 
                  className="w-full py-3 pl-4 pr-14 rounded-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition-shadow shadow-sm"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          // Nếu là khách và chưa chọn chủ đề -> vào màn hình chọn chủ đề
          <TopicSelection onSelectTopic={setSelectedTopic} />
        )}
      </div>

      {/* Các Modal sẽ hiển thị chồng lên trên */}
      {showWelcomeModal && (
        <WelcomeModal
          onLogin={handleShowLogin}
          onSignup={handleShowSignup}
          onContinueAsGuest={handleContinueAsGuest}
        />
      )}
      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </main>
  );
}