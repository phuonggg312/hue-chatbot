'use client';

type Props = {
  onLogin: () => void;
  onSignup: () => void;
};

export default function GuestAuthCTA({ onLogin, onSignup }: Props) {
  return (
    <div className="fixed right-4 top-24 z-40 w-72">
      <div className="rounded-2xl shadow-xl border border-gray-200 bg-white/95 backdrop-blur px-4 py-5">
        <p className="text-sm text-gray-700 mb-3">
          Bạn đang dùng chế độ khách. Đăng nhập để lưu lịch sử trò chuyện và đồng bộ trên mọi thiết bị.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onLogin}
            className="flex-1 rounded-lg bg-gray-900 text-white text-sm py-2 hover:bg-gray-800"
          >
            Đăng nhập
          </button>
          <button
            onClick={onSignup}
            className="flex-1 rounded-lg border border-gray-300 text-sm py-2 hover:bg-gray-100"
          >
            Đăng ký
          </button>
        </div>
      </div>
    </div>
  );
}
