'use client';

import { useEffect, useState } from 'react';
import {
  Bot,
  User as UserIcon,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Pause,
  Play,
  Square,
} from 'lucide-react';
import MarkdownMessage from './MarkdownMessage';
import TypingIndicator from './TypingIndicator'; // 👈 bong bóng 3 chấm
import { useTypewriter } from '@/lib/hooks/useTypewriter';

export interface Message {
  id?: string;
  text: string;
  sender: 'user' | 'bot';
}

type Props = {
  messages: Message[];
  onSuggestionClick?: (q: string) => void; // (giữ để tương thích)
  onFeedback?: (id: string | undefined, value: 'like' | 'dislike') => Promise<void> | void;
  onCopy?: (text: string) => void;
  isGuest?: boolean;

  /** Full câu trả lời từ server để “gõ từ từ” */
  pendingAssistantText?: string | null;
  /** Báo cho parent biết đã gõ xong / dừng */
  onStreamDone?: () => void;
};

const ChatMessages = ({
  messages,
  onFeedback,
  onCopy,
  isGuest,
  pendingAssistantText,
  onStreamDone,
}: Props) => {
  const [reactions, setReactions] = useState<Record<string, 'like' | 'dislike'>>({});
  const { isStreaming, output, start, pause, resume, stop } = useTypewriter(18);

  const handleCopy = (text: string) =>
    onCopy ? onCopy(text) : navigator.clipboard.writeText(text);

  const react = async (id: string | undefined, v: 'like' | 'dislike') => {
    if (!id) return;
    setReactions((prev) => ({ ...prev, [id]: v })); // optimistic
    try {
      await onFeedback?.(id, v);
    } catch {
      setReactions((prev) => {
        const clone = { ...prev };
        delete clone[id];
        return clone;
      });
    }
  };

  // Khi có full text mới -> bắt đầu “gõ”
  useEffect(() => {
    if (pendingAssistantText) start(pendingAssistantText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAssistantText]);

  // Khi gõ xong hoặc stop -> báo parent
  useEffect(() => {
    if (!messages.length) return;
    if (!isStreaming && pendingAssistantText && output === pendingAssistantText) {
      onStreamDone?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [output, isStreaming]);

  // Không render WelcomeChat nữa; khi chưa có message, để trống vùng chat
  if (messages.length === 0) {
    return <div className="flex-grow p-6 overflow-y-auto" />;
  }

  return (
    <div className="flex-grow p-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-8">
        {messages.map((msg, index) => {
          const reacted = msg.id ? reactions[msg.id] : undefined;

          const lastBotIndex = messages.map((m) => m.sender).lastIndexOf('bot');
          const isLastAssistant = msg.sender === 'bot' && index === lastBotIndex;

          // Hiển thị “đang nghĩ” khi bot là placeholder (text rỗng) và CHƯA bắt đầu stream
          const isThinkingBubble =
            msg.sender === 'bot' &&
            msg.text === '' &&
            index === lastBotIndex &&
            !pendingAssistantText;

          // Nội dung hiển thị cho bot khi đã có text/đang stream
          const botContent =
            isLastAssistant && pendingAssistantText ? output : msg.text;

          return (
            <div
              key={msg.id || index}
              className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}
            >
              {msg.sender === 'bot' && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-700 text-white">
                  <Bot size={20} />
                </div>
              )}

              <div className={`flex flex-col w-full ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-lg p-3 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none border'
                  }`}
                >
                  {msg.sender === 'bot' ? (
                    isThinkingBubble ? (
                      <TypingIndicator /> // 👈 bong bóng 3 chấm
                    ) : (
                      <MarkdownMessage content={botContent} />
                    )
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  )}
                </div>

                {/* Hàng nút action chỉ hiện khi KHÔNG phải bong bóng nghĩ */}
                {msg.sender === 'bot' && !isThinkingBubble && (
                  <div className="flex items-center gap-2 mt-2 text-gray-500">
                    <button
                      onClick={() =>
                        handleCopy(isLastAssistant && pendingAssistantText ? output : msg.text)
                      }
                      className="p-1 hover:bg-gray-200 rounded-full"
                      title="Sao chép nội dung"
                    >
                      <Copy size={14} />
                    </button>

                    <button
                      disabled={isGuest}
                      onClick={() => react(msg.id, 'like')}
                      className={`p-1 rounded-full ${
                        reacted === 'like' ? 'text-blue-600 bg-blue-50' : 'hover:bg-gray-200'
                      }`}
                      title={isGuest ? 'Đăng nhập để phản hồi' : 'Thích'}
                    >
                      <ThumbsUp size={14} />
                    </button>

                    <button
                      disabled={isGuest}
                      onClick={() => react(msg.id, 'dislike')}
                      className={`p-1 rounded-full ${
                        reacted === 'dislike' ? 'text-red-600 bg-red-50' : 'hover:bg-gray-200'
                      }`}
                      title={isGuest ? 'Đăng nhập để phản hồi' : 'Không hữu ích'}
                    >
                      <ThumbsDown size={14} />
                    </button>

                    {isLastAssistant && pendingAssistantText && (
                      <div className="flex items-center gap-1 ml-2">
                        {isStreaming ? (
                          <button
                            onClick={pause}
                            className="p-1 hover:bg-gray-200 rounded-full"
                            title="Tạm dừng"
                          >
                            <Pause size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={resume}
                            className="p-1 hover:bg-gray-200 rounded-full"
                            title="Tiếp tục"
                          >
                            <Play size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            stop();
                            onStreamDone?.();
                          }}
                          className="p-1 hover:bg-gray-200 rounded-full"
                          title="Dừng hẳn"
                        >
                          <Square size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-300">
                  <UserIcon size={20} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatMessages;
