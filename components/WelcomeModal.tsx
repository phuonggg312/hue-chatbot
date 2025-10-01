// file: components/WelcomeModal.tsx

import React from 'react';

interface WelcomeModalProps {
  onLogin: () => void;
  onSignup: () => void;
  onContinueAsGuest: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onLogin, onSignup, onContinueAsGuest }) => {
  return (
    // Lớp phủ nền mờ
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-80">
      {/* Khung nội dung modal */}
      <div className="bg-white rounded-2xl shadow-lg p-8 m-4 max-w-md w-full text-center">
        
        {/* === START: NỘI DUNG MỚI === */}
        <h2 className="text-2xl font-bold mb-3 text-gray-800 tracking-wider">
          HUE AI CHAT
        </h2>
        <p className="text-gray-600 mb-8">
          <span className="font-semibold text-gray-700">Trợ lý thông minh của Đại học Kinh tế Huế</span>
          <br />
          Đăng nhập hoặc đăng ký để lưu lại lịch sử trò chuyện, nhận các tư vấn cá nhân hóa và khám phá đầy đủ tính năng của trợ lý ảo.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onLogin}
            className="w-full bg-gray-800 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Đăng nhập
          </button>
          <button
            onClick={onSignup}
            className="w-full bg-white text-gray-800 font-semibold py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            Đăng ký
          </button>
        </div>
        <button
          onClick={onContinueAsGuest}
          className="mt-6 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Trò chuyện ngay (không cần tài khoản)
        </button>
        {/* === END: NỘI DUNG MỚI === */}

      </div>
    </div>
  );
};

export default WelcomeModal;