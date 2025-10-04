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

  // “full text” từ server dùng để gõ từ từ ở UI
  const [pendingAssistantText, setPendingAssistantText] = useState<string | null>(null);
  // lưu tạm id message assistant placeholder để cập nhật khi stream xong
  const [tempAssistantId, setTempAssistantId] = useState<string | null>(null);

  // Conversations
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loadingConversations, setLoadingConversations] = useState(false);

  // ===== Helpers (API) =====
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
      setMessages([]); // clear nếu lỗi
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
      const out = await res.json(); // { id } hoặc { message:{id,...}}
      return (out?.id || out?.message?.id) as string | undefined;
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
      const {
        data: { session },
      } = await supabase.auth.getSession();
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
        userMsgId = await appendMessageToDB(convId, 'user', currentInput);
      }
      setMessages((prev) => [...prev, { id: userMsgId, text: currentInput, sender: 'user' }]);

      // Nếu tiêu đề còn placeholder, đổi theo snippet tin đầu
      if (session && convId) {
        const conv = conversations.find((c) => c.id === convId);
        const firstTitle = (currentInput || '').slice(0, 50).trim();
        if (conv && (!conv.title || conv.title === 'Cuộc trò chuyện mới') && firstTitle) {
          await fetch('/api/conversations', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: convId, title: firstTitle }),
          });
          setConversations((prev) =>
            prev.map((c) => (c.id === convId ? { ...c, title: firstTitle } : c))
          );
        }
      }

      /* ============ Thêm BOT placeholder để “gõ dần” ============ */
      const tempId = `temp-${Date.now()}`;
      setTempAssistantId(tempId);
      setMessages((prev) => [...prev, { id: tempId, text: '', sender: 'bot' }]);

      /* ============ Gọi AI ============ */
      const botText = await getAIResponse(currentInput);

      /* ============ Lưu BOT message vào DB (nếu có) ============ */
      let botMsgId: string | undefined = undefined;
      if (session && convId) {
        botMsgId = await appendMessageToDB(convId, 'bot', botText);
        // cập nhật id của placeholder (tuỳ chọn)
        if (botMsgId) {
          setMessages((prev) => {
            const cp = [...prev];
            const lastBotIdx = cp.map(m => m.sender).lastIndexOf('bot');
            if (lastBotIdx >= 0 && cp[lastBotIdx]?.id === tempId) {
              cp[lastBotIdx] = { ...cp[lastBotIdx], id: botMsgId };
            }
            return cp;
          });
        }
      }

      // Đưa full text cho ChatMessages để “gõ từ từ”
      setPendingAssistantText(botText);
    } catch (err) {
      console.error(err);
      // hiển thị lỗi luôn (không stream)
      setMessages((prev) => [
        ...prev,
        { text: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.', sender: 'bot' },
      ]);
      setIsBotReplying(false);
      setPendingAssistantText(null);
      setTempAssistantId(null);
    }
  };

  // Khi ChatMessages báo “gõ xong” hoặc người dùng bấm Stop:
  const handleStreamDone = () => {
    if (!pendingAssistantText) {
      setIsBotReplying(false);
      setTempAssistantId(null);
      return;
    }
    // chốt lại nội dung cho message bot placeholder
    setMessages((prev) => {
      const cp = [...prev];
      const lastBotIdx = cp.map(m => m.sender).lastIndexOf('bot');
      if (lastBotIdx >= 0) {
        cp[lastBotIdx] = { ...cp[lastBotIdx], text: pendingAssistantText };
      }
      return cp;
    });
    setIsBotReplying(false);
    setPendingAssistantText(null);
    setTempAssistantId(null);
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
      {/* Sidebar chỉ hiển thị khi đã đăng nhập */}
      {session && (
        <Sidebar
          session={session}
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={async (id) => {
            setActiveConversationId(id);
            // reset stream khi đổi hội thoại
            setPendingAssistantText(null);
            setTempAssistantId(null);
            setIsBotReplying(false);
            await loadMessages(id);
          }}
          onNew={async () => {
            const conv = await createConversation('Cuộc trò chuyện mới');
            if (conv) {
              setActiveConversationId(conv.id);
              setMessages([]);
              setPendingAssistantText(null);
              setTempAssistantId(null);
              setIsBotReplying(false);
              await loadMessages(conv.id);
            }
          }}
          onRename={async (id, newTitle) => {
            await fetch('/api/conversations', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id, title: newTitle }),
            });
            setConversations((prev) =>
              prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
            );
          }}
          onDelete={async (id) => {
            await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
            setConversations((prev) => prev.filter((c) => c.id !== id));
            if (activeConversationId === id) {
              setActiveConversationId(null);
              setMessages([]);
              setPendingAssistantText(null);
              setTempAssistantId(null);
              setIsBotReplying(false);
            }
          }}
        />
      )}

      <div className="flex-1 flex flex-col h-screen">
        {/* KHÔNG còn header hiển thị dòng “Cuộc trò chuyện: …” */}
        <ChatMessages
          messages={messages}
          onSuggestionClick={(q) => setInputValue(q)}
          onFeedback={async (id, value) => {
            if (!id) return;
            await fetch(`/api/message-feedback/${id}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reaction: value }), // 'like' | 'dislike'
            });
          }}
          pendingAssistantText={pendingAssistantText}
          onStreamDone={handleStreamDone}
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
          mode={authMode} // 'login' | 'signup'
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
