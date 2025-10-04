'use client';

export default function TypingIndicator() {
  // Bong bóng xám + 3 chấm nảy
  return (
    <div className="inline-flex items-center gap-1 px-3 py-2 rounded-2xl bg-gray-100 border text-gray-600">
      <span className="sr-only">Đang soạn…</span>
      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '120ms' }} />
      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '240ms' }} />
    </div>
  );
}
