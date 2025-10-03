// file: app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient, Session } from '@supabase/auth-helpers-nextjs';
import { Send } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import AuthModal from '@/components/AuthModal';
import WelcomeModal from '@/components/WelcomeModal';
import ChatMessages, { Message } from '@/components/ChatMessages';
import { getAIResponse } from '@/lib/services/aiService';

export default function Home() {
  const supabase = createClientComponentClient();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isBotReplying, setIsBotReplying] = useState(false);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        setSession(session);
        setLoading(false);
        if (event === 'SIGNED_IN') {
            setShowWelcomeModal(false);
            setShowAuthModal(false);
        } else if (event === 'SIGNED_OUT') {
            setShowWelcomeModal(true);
            setMessages([]);
        }
    });
    const getInitialSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setLoading(false);
        if (!session) {
            setShowWelcomeModal(true);
        }
    };
    getInitialSession();
    return () => { authListener.subscription.unsubscribe(); };
  }, [supabase]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isBotReplying) return;

    const userMessage: Message = { text: inputValue, sender: 'user' };
    const currentInputValue = inputValue; // Lưu lại giá trị trước khi xóa
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsBotReplying(true);

    // Gửi giá trị đã lưu đi, không phải state đã bị xóa
    const botResponseText = await getAIResponse(currentInputValue);

    const botMessage: Message = { text: botResponseText, sender: 'bot' };
    setMessages(prev => [...prev, botMessage]);
    setIsBotReplying(false);
  };

  const handleShowLogin = () => { setAuthMode('login'); setShowWelcomeModal(false); setShowAuthModal(true); };
  const handleShowSignup = () => { setAuthMode('signup'); setShowWelcomeModal(false); setShowAuthModal(true); };
  const handleContinueAsGuest = () => { setShowWelcomeModal(false); };
  const handleAuthSuccess = (session: Session) => { setSession(session); setShowAuthModal(false); };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Đang tải...</div>;
  }

  if (!session && showWelcomeModal) {
    return (
        <div className='w-full h-screen bg-gray-900'>
            <WelcomeModal onLogin={handleShowLogin} onSignup={handleShowSignup} onContinueAsGuest={handleContinueAsGuest} />
        </div>
    );
  }

  return (
    <main className="flex h-screen bg-white">
      {session && <Sidebar session={session} />}
      <div className="flex-1 flex flex-col h-screen">
        <ChatMessages messages={messages} />
        <div className="p-4 bg-white border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="relative max-w-3xl mx-auto">
            <input 
              type="text" 
              placeholder={isBotReplying ? "Bot đang trả lời..." : "Nhập câu hỏi của bạn..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isBotReplying}
              className="w-full py-3 pl-4 pr-14 rounded-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition-shadow shadow-sm disabled:bg-gray-100"
            />
            <button type="submit" disabled={isBotReplying || !inputValue.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:bg-blue-300">
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
      {showAuthModal && (<AuthModal mode={authMode === 'login' ? 'sign_in' : 'sign_up'} onClose={() => setShowAuthModal(false)} onSuccess={handleAuthSuccess} />)}
    </main>
  );
}