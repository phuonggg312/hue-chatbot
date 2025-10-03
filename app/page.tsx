// file: app/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient, Session } from '@supabase/auth-helpers-nextjs';
import { Send } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import AuthModal from '@/components/AuthModal';
import WelcomeModal from '@/components/WelcomeModal';
import ChatMessages, { Message } from '@/components/ChatMessages';
import { getAIResponse } from '@/lib/services/aiService';
import GuestAuthCTA from '@/components/GuestAuthCTA';

type Conversation = {
  id: string;
  title: string;
  created_at: string;
  updated_at?: string | null;
  last_message_at?: string | null;
};

const LS_KEY = 'active_conversation_id';

export default function Home() {
  const supabase = createClientComponentClient();

  // Auth/UI
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Chat states
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isBotReplying, setIsBotReplying] = useState(false);

  // Conversations
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loadingConversations, setLoadingConversations] = useState(false);

  // ===== Helpers to call API =====
  const loadConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      const res = await fetch('/api/conversations', { method: 'GET' });
      if (!res.ok) throw new Error('Failed to load conversations');
      const data: { conversations: Conversation[] } = await res.json();
      setConversations(data.conversations || []);
      return data.conversations || [];
    } catch (e) {
      console.error('Load conversations error:', e);
      setConversations([]);
      return [];
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const res = await fetch(`/api/messages/${conversationId}`, { method: 'GET' });
      if (!res.ok) throw new Error('Failed to load messages');
  
      const data: {
        messages: Array<{ id: string; role: 'user' | 'assistant' | 'system'; text: string }>
      } = await res.json();
  
      const mapped: Message[] = (data.messages || []).map((m) => ({
        id: m.id,
        text: m.text,
        sender: m.role === 'assistant' ? 'bot' : 'user',
      }));
      setMessages(mapped);
    } catch (e) {
      console.error('Load messages error:', e);
      setMessages([]);
    }
  }, []);
  


  const createConversation = useCallback(async (title: string) => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error('Create conversation failed');
      const data: { conversation: Conversation } = await res.json();
      setConversations((prev) => [data.conversation, ...prev]);
      setActiveConversationId(data.conversation.id);
      localStorage.setItem(LS_KEY, data.conversation.id);
      return data.conversation;
    } catch (e) {
      console.error('Create conversation error:', e);
      return null;
    }
  }, []);

  const appendMessageToDB = useCallback(
    async (conversationId: string, role: 'user' | 'bot', text: string) => {
      const res = await fetch(`/api/messages/${conversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, text }),
      });
      if (!res.ok) return undefined;
      const out = await res.json(); // { id }
      return out?.id as string | undefined;
    },
    []
  );
  

  // ===== Auth bootstrap =====
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, s) => {
      setSession(s);
      setLoading(false);

      if (event === 'SIGNED_IN') {
        setShowWelcomeModal(false);
        setShowAuthModal(false);
        const convs = await loadConversations();

        // Khôi phục convId đã lưu (nếu còn tồn tại)
        const saved = localStorage.getItem(LS_KEY);
        if (saved && convs.find((c) => c.id === saved)) {
          setActiveConversationId(saved);
          await loadMessages(saved);
        } else if (convs.length) {
          setActiveConversationId(convs[0].id);
          localStorage.setItem(LS_KEY, convs[0].id);
          await loadMessages(convs[0].id);
        } else {
          setActiveConversationId(null);
          localStorage.removeItem(LS_KEY);
          setMessages([]);
        }
      }

      if (event === 'SIGNED_OUT') {
        setShowWelcomeModal(true);
        setMessages([]);
        setConversations([]);
        setActiveConversationId(null);
        localStorage.removeItem(LS_KEY);
      }
    });

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);

      if (!session) {
        setShowWelcomeModal(true);
        return;
      }

      const convs = await loadConversations();
      const saved = localStorage.getItem(LS_KEY);
      if (saved && convs.find((c) => c.id === saved)) {
        setActiveConversationId(saved);
        await loadMessages(saved);
      } else if (convs.length) {
        setActiveConversationId(convs[0].id);
        localStorage.setItem(LS_KEY, convs[0].id);
        await loadMessages(convs[0].id);
      }
    })();

    return () => authListener.subscription.unsubscribe();
  }, [supabase, loadConversations, loadMessages]);

  // ===== UI handlers =====
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isBotReplying) return;
  
    const currentInput = inputValue;
    setInputValue('');
    setIsBotReplying(true);
  
    try {
      // đảm bảo có conversationId nếu đã đăng nhập
      let convId = activeConversationId;
      if (session && !convId) {
        const title = currentInput.slice(0, 50) || 'Cuộc trò chuyện mới';
        const created = await createConversation(title);
        convId = created?.id || null;
        if (convId) {
          setActiveConversationId(convId);
          localStorage.setItem(LS_KEY, convId);
        }
      }
  
      /* ============ USER message ============ */
      let userMsgId: string | undefined = undefined;
  
      if (session && convId) {
        // lưu DB và nhận lại id
        userMsgId = await appendMessageToDB(convId, 'user', currentInput);
      }
  
      // render user (khách thì id = undefined)
      setMessages(prev => [
        ...prev,
        { id: userMsgId, text: currentInput, sender: 'user' },
      ]);
  
      /* ============ Gọi AI ============ */
      const botText = await getAIResponse(currentInput);
  
      /* ============ BOT message ============ */
      let botMsgId: string | undefined = undefined;
  
      if (session && convId) {
        botMsgId = await appendMessageToDB(convId, 'bot', botText);
      }
  
      setMessages(prev => [
        ...prev,
        { id: botMsgId, text: botText, sender: 'bot' },
      ]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { text: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.', sender: 'bot' },
      ]);
    } finally {
      setIsBotReplying(false);
    }
  };
  

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
  const handleContinueAsGuest = () => setShowWelcomeModal(false);
  const handleAuthSuccess = (s: Session) => {
    setSession(s);
    setShowAuthModal(false);
  };

  // ===== Render =====
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Đang tải...</div>;
  }

  if (!session && showWelcomeModal) {
    return (
      <div className="w-full h-screen bg-gray-900">
        <WelcomeModal
          onLogin={handleShowLogin}
          onSignup={handleShowSignup}
          onContinueAsGuest={handleContinueAsGuest}
        />
      </div>
    );
  }

  return (
    <main className="flex h-screen bg-white">
      {session && <Sidebar session={session} />}

      <div className="flex-1 flex flex-col h-screen">
        {/* Header nhỏ hiển thị thông tin hội thoại */}
        {session && (
          <div className="px-4 py-2 border-b bg-white">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {loadingConversations
                  ? 'Đang tải cuộc trò chuyện...'
                  : activeConversationId
                    ? `Cuộc trò chuyện: ${conversations.find((c) => c.id === activeConversationId)?.title || 'Không tiêu đề'
                    }`
                    : 'Chưa chọn cuộc trò chuyện'}
              </div>
              <button
                onClick={async () => {
                  if (!session) {
                    // khách: chỉ reset UI
                    setActiveConversationId(null);
                    localStorage.removeItem(LS_KEY);
                    setMessages([]);
                    return;
                  }
                  const conv = await createConversation('Cuộc trò chuyện mới');
                  if (conv) {
                    setMessages([]);
                    await loadMessages(conv.id);
                  }
                }}
                className="text-sm px-3 py-1.5 rounded-md bg-gray-800 text-white hover:bg-gray-700"
              >
                Cuộc trò chuyện mới
              </button>
            </div>
          </div>
        )}

        <ChatMessages
          messages={messages}
          onSuggestionClick={(q) => setInputValue(q)}   // click gợi ý -> đổ vào input
          onFeedback={async (id, value) => {
            // TODO: nếu CHƯA làm API lưu feedback thì có thể tạm thời bỏ qua khối này
            await fetch(`/api/messages/${id}/feedback`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ value }), // 'like' | 'dislike'
            });
          }}
        />


        <div className="p-4 bg-white border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="relative max-w-3xl mx-auto">
            <input
              type="text"
              placeholder={isBotReplying ? 'Bot đang trả lời...' : 'Nhập câu hỏi của bạn...'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isBotReplying}
              className="w-full py-3 pl-4 pr-14 rounded-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition-shadow shadow-sm disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={isBotReplying || !inputValue.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>

      {showAuthModal && (
        <AuthModal
          mode={authMode}   // ✅ Truyền đúng 'login' | 'signup'
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* CTA nổi cho KHÁCH: chỉ hiện khi không có session & đã đóng WelcomeModal */}
      {!session && !showWelcomeModal && (
        <GuestAuthCTA onLogin={handleShowLogin} onSignup={handleShowSignup} />
      )}
    </main>
  );
}
