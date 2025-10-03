// file: components/ChatMessages.tsx
'use client';

import { Bot, User as UserIcon, ThumbsUp, ThumbsDown, Copy } from 'lucide-react';

// Định nghĩa kiểu dữ liệu cho một tin nhắn
export interface Message {
  text: string;
  sender: 'user' | 'bot';
}

// --- Component cho các gợi ý câu hỏi ---
const SuggestionCard = ({ title, suggestions }: { title: string; suggestions: string[] }) => (
  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 w-full">
    <h4 className="font-bold mb-3 text-gray-700">{title}</h4>
    <div className="space-y-2">
      {suggestions.map((text, index) => (
        <button key={index} className="text-left text-sm text-blue-600 hover:underline w-full p-2 hover:bg-gray-100 rounded">
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


// --- Component chính để hiển thị tin nhắn ---
const ChatMessages = ({ messages }: { messages: Message[] }) => {
  // Các hàm xử lý (tạm thời)
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Có thể thêm thông báo "Đã sao chép!" ở đây
  };
  const handleLike = () => console.log('Liked!');
  const handleDislike = () => console.log('Disliked!');

  if (messages.length === 0) {
    return <WelcomeChat />;
  }

  return (
    <div className="flex-grow p-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-8">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {/* Avatar */}
            {msg.sender === 'bot' && (
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-700 text-white">
                <Bot size={20} />
              </div>
            )}

            <div className={`flex flex-col w-full ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              {/* Bong bóng chat */}
              <div className={`max-w-lg p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none border'}`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
              
              {/* Các nút tương tác cho tin nhắn của bot */}
              {msg.sender === 'bot' && (
                <div className="flex items-center gap-2 mt-2 text-gray-500">
                  <button onClick={() => handleCopy(msg.text)} className="p-1 hover:bg-gray-200 rounded-full"><Copy size={14} /></button>
                  <button onClick={handleLike} className="p-1 hover:bg-gray-200 rounded-full"><ThumbsUp size={14} /></button>
                  <button onClick={handleDislike} className="p-1 hover:bg-gray-200 rounded-full"><ThumbsDown size={14} /></button>
                </div>
              )}
            </div>

            {/* Avatar người dùng */}
            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-300">
                <UserIcon size={20} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatMessages;