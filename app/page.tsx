// file: app/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient, Session } from '@supabase/auth-helpers-nextjs';
import { Send } from 'lucide-react';

import Sidebar from '@/components/Sidebar';
import AuthModal from '@/components/AuthModal';
import WelcomeModal from '@/components/WelcomeModal';
import ChatMessages, { Message } from '@/components/ChatMessages';
import AssistantPicker from '@/components/AssistantPicker';
import GuestAuthCTA from '@/components/GuestAuthCTA';
import { getAIResponse } from '@/lib/services/aiService';

type AssistantType = 'hoc_tap' | 'tuyen_sinh';

type Conversation = {
  id: string;
  title: string;
  created_at: string;
  updated_at?: string | null;
  last_message_at?: string | null;
  assistant_type: AssistantType;
};

const GREETING: Record<AssistantType, string> = {
  hoc_tap:
    'Xin chào! Tôi là chatbot Hỗ trợ người học của Trường Đại học Kinh tế, Đại học Huế (HUE). Tôi có thể giúp gì cho bạn về học vụ hôm nay?',
  tuyen_sinh:
    'Xin chào! Tôi là chatbot Tư vấn tuyển sinh của Trường Đại học Kinh tế, Đại học Huế (HUE). Bạn muốn tìm hiểu về điểm chuẩn, phương thức xét tuyển hay ngành học nào?',
};

const LS_KEY = 'active_conversation_id';
const PLACEHOLDERS = ['Cuộc trò chuyện mới', 'Tư vấn tuyển sinh', 'Hỗ trợ người học'];

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

  // stream UI
  const [pendingAssistantText, setPendingAssistantText] = useState<string | null>(null);
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
        messages: Array<{ id: string; role: 'user' | 'assistant' | 'system'; text: string }>;
      } = await res.json();

      const mapped: Message[] =
        (data.messages || []).map((m) => ({
          id: m.id,
          text: m.text,
          sender: m.role === 'assistant' ? 'bot' : 'user',
        })) || [];

      setMessages(mapped);
    } catch (e) {
      console.error('Load messages error:', e);
      setMessages([]);
    }
  }, []);

  const createConversation = useCallback(
    async ({ title, assistant_type }: { title?: string; assistant_type: AssistantType }) => {
      try {
        const res = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title || (assistant_type === 'hoc_tap' ? 'Hỗ trợ người học' : 'Tư vấn tuyển sinh'),
            assistant_type,
          }),
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
    },
    []
  );

  const updateConversationTitle = useCallback(async (id: string, title: string) => {
    await fetch('/api/conversations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, title }),
    });
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)));
  }, []);

  const appendMessageToDB = useCallback(
    async (conversationId: string, role: 'user' | 'bot', text: string) => {
      const res = await fetch(`/api/messages/${conversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, text }),
      });
      if (!res.ok) return undefined;
      const out = await res.json();
      return (out?.id || out?.message?.id) as string | undefined;
    },
    []
  );

  // ===== Auth bootstrap =====
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, s) => {
      setSession(s);
      setLoading(false);

      if (event === 'SIGNED_OUT') {
        setShowWelcomeModal(true);
        setMessages([]);
        setConversations([]);
        setActiveConversationId(null);
        localStorage.removeItem(LS_KEY);
        return;
      }

      if (event === 'SIGNED_IN') {
        setShowWelcomeModal(false);
        setShowAuthModal(false);

        // 👉 Sau đăng nhập: LUÔN hiện AssistantPicker
        await loadConversations();
        setActiveConversationId(null);
        localStorage.removeItem(LS_KEY);
        setMessages([]);
        setInputValue('');
        setPendingAssistantText(null);
        setTempAssistantId(null);
        setIsBotReplying(false);
        return;
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

      // Đã đăng nhập và mở trang: vẫn hiện AssistantPicker
      await loadConversations();
      setActiveConversationId(null);
      localStorage.removeItem(LS_KEY);
      setMessages([]);
    })();

    return () => authListener.subscription.unsubscribe();
  }, [supabase, loadConversations, loadMessages]);

  // ===== helper: gửi 1 câu hỏi (không dùng ô input) =====
  const sendMessageInConv = useCallback(
    async (convId: string, text: string) => {
      setIsBotReplying(true);
      try {
        // user msg
        let userMsgId: string | undefined = undefined;
        if (session) userMsgId = await appendMessageToDB(convId, 'user', text);
        setMessages((prev) => [...prev, { id: userMsgId, text, sender: 'user' }]);

        // bot placeholder
        const tempId = `temp-${Date.now()}`;
        setTempAssistantId(tempId);
        setMessages((prev) => [...prev, { id: tempId, text: '', sender: 'bot' }]);

        // call AI
        const botText = await getAIResponse(text);

        // save bot
        let botMsgId: string | undefined = undefined;
        if (session) {
          botMsgId = await appendMessageToDB(convId, 'bot', botText);
          if (botMsgId) {
            setMessages((prev) => {
              const cp = [...prev];
              const lastBotIdx = cp.map((m) => m.sender).lastIndexOf('bot');
              if (lastBotIdx >= 0 && cp[lastBotIdx]?.id === tempId) {
                cp[lastBotIdx] = { ...cp[lastBotIdx], id: botMsgId };
              }
              return cp;
            });
          }
        }

        setPendingAssistantText(botText);
      } catch (err) {
        console.error(err);
        setMessages((prev) => [...prev, { text: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.', sender: 'bot' }]);
        setIsBotReplying(false);
        setPendingAssistantText(null);
        setTempAssistantId(null);
      }
    },
    [appendMessageToDB, session]
  );

  // ===== bắt đầu bằng việc chọn trợ lý (có thể có câu gợi ý) =====
  const startWithAssistant = async (type: AssistantType, initialQuestion?: string) => {
    let convId: string | null = null;

    if (session) {
      const conv = await createConversation({
        title: type === 'hoc_tap' ? 'Hỗ trợ người học' : 'Tư vấn tuyển sinh',
        assistant_type: type,
      });
      if (!conv) return;
      convId = conv.id;
    } else {
      convId = `guest-${Date.now()}`; // guest: conv tạm
    }

    setActiveConversationId(convId);
    setPendingAssistantText(null);
    setTempAssistantId(null);
    setIsBotReplying(false);

    // Bot chào ngay
    const greet = GREETING[type];
    let botId: string | undefined = undefined;
    if (session) botId = await appendMessageToDB(convId, 'bot', greet);
    setMessages([{ id: botId, text: greet, sender: 'bot' }]);
    setInputValue('');

    if (initialQuestion) {
      await sendMessageInConv(convId, initialQuestion);
    }
  };

  // ===== gửi từ input =====
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isBotReplying) return;

    const currentInput = inputValue;
    setInputValue('');
    setIsBotReplying(true);

    try {
      // đảm bảo có conversationId
      let convId = activeConversationId;
      if (!convId) {
        if (session) {
          const created = await createConversation({
            title: 'Cuộc trò chuyện mới',
            assistant_type: 'tuyen_sinh',
          });
          convId = created?.id || null;
          if (convId) localStorage.setItem(LS_KEY, convId);
        } else {
          convId = `guest-${Date.now()}`;
        }
        setActiveConversationId(convId);
      }

      // user msg
      let userMsgId: string | undefined = undefined;
      if (session && convId) {
        userMsgId = await appendMessageToDB(convId, 'user', currentInput);
      }
      setMessages((prev) => [...prev, { id: userMsgId, text: currentInput, sender: 'user' }]);

      // Đổi tiêu đề thông minh nếu đang là placeholder
      if (session && convId) {
        const conv = conversations.find((c) => c.id === convId);
        const titleNow = conv?.title?.trim() || '';
        if (conv && PLACEHOLDERS.includes(titleNow)) {
          try {
            const resTitle = await fetch('/api/smart-title', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: currentInput,
                assistant_type: conv.assistant_type ?? 'tuyen_sinh',
              }),
            });
            const { title } = resTitle.ok
              ? await resTitle.json()
              : { title: (currentInput || '').slice(0, 48).trim() };

            const finalTitle = (title || (currentInput || '').slice(0, 48)).trim();
            await updateConversationTitle(convId, finalTitle);
          } catch (e) {
            console.error('smart-title error', e);
          }
        }
      }

      // bot placeholder
      const tempId = `temp-${Date.now()}`;
      setTempAssistantId(tempId);
      setMessages((prev) => [...prev, { id: tempId, text: '', sender: 'bot' }]);

      // call AI
      const botText = await getAIResponse(currentInput);

      // save bot
      let botMsgId: string | undefined = undefined;
      if (session && convId) {
        botMsgId = await appendMessageToDB(convId, 'bot', botText);
        if (botMsgId) {
          setMessages((prev) => {
            const cp = [...prev];
            const lastBotIdx = cp.map((m) => m.sender).lastIndexOf('bot');
            if (lastBotIdx >= 0 && cp[lastBotIdx]?.id === tempId) {
              cp[lastBotIdx] = { ...cp[lastBotIdx], id: botMsgId };
            }
            return cp;
          });
        }
      }

      setPendingAssistantText(botText);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { text: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.', sender: 'bot' }]);
      setIsBotReplying(false);
      setPendingAssistantText(null);
      setTempAssistantId(null);
    }
  };

  const handleStreamDone = () => {
    if (!pendingAssistantText) {
      setIsBotReplying(false);
      setTempAssistantId(null);
      return;
    }
    setMessages((prev) => {
      const cp = [...prev];
      const lastBotIdx = cp.map((m) => m.sender).lastIndexOf('bot');
      if (lastBotIdx >= 0) cp[lastBotIdx] = { ...cp[lastBotIdx], text: pendingAssistantText };
      return cp;
    });
    setIsBotReplying(false);
    setPendingAssistantText(null);
    setTempAssistantId(null);
  };

  // ===== Auth modal controls =====
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
  if (loading) return <div className="flex h-screen items-center justify-center">Đang tải...</div>;

  if (!session && showWelcomeModal) {
    return (
      <div className="w-full h-screen bg-gray-900">
        <WelcomeModal onLogin={handleShowLogin} onSignup={handleShowSignup} onContinueAsGuest={handleContinueAsGuest} />
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
            localStorage.setItem(LS_KEY, id);
            setPendingAssistantText(null);
            setTempAssistantId(null);
            setIsBotReplying(false);
            setInputValue('');
            setMessages([]);
            await loadMessages(id);
          }}
          onNew={async () => {
            // 👉 Không tạo conv ngay, chỉ hiện AssistantPicker
            setActiveConversationId(null);
            setPendingAssistantText(null);
            setTempAssistantId(null);
            setIsBotReplying(false);
            setInputValue('');
            setMessages([]);
            localStorage.removeItem(LS_KEY);
          }}
          onNewByType={async (type) => {
            await startWithAssistant(type);
          }}
          onRename={async (id, newTitle) => {
            await updateConversationTitle(id, newTitle);
          }}
          onDelete={async (id) => {
            await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
            setConversations((prev) => prev.filter((c) => c.id !== id));
            if (activeConversationId === id) {
              setActiveConversationId(null);
              setPendingAssistantText(null);
              setTempAssistantId(null);
              setIsBotReplying(false);
              setInputValue('');
              setMessages([]);
              localStorage.removeItem(LS_KEY);
            }
          }}
        />
      )}

      <div className="flex-1 flex flex-col h-screen">
        {/* Chưa có conv -> hiện Picker */}
        {!activeConversationId ? (
          <AssistantPicker onStart={startWithAssistant} />
        ) : (
          <>
            <ChatMessages
              messages={messages}
              onFeedback={async (id, value) => {
                if (!id) return;
                await fetch(`/api/message-feedback/${id}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ reaction: value }),
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
          </>
        )}
      </div>

      {showAuthModal && (
        <AuthModal mode={authMode} onClose={() => setShowAuthModal(false)} onSuccess={handleAuthSuccess} />
      )}

      {!session && !showWelcomeModal && <GuestAuthCTA onLogin={handleShowLogin} onSignup={handleShowSignup} />}
    </main>
  );
}
