// file: components/AuthModal.tsx
'use client';

import React from 'react';
import AuthForm from './AuthForm';
import type { Session } from '@supabase/auth-helpers-nextjs';

// KHAI BÁO LẠI PROPS CHO CHÍNH XÁC
interface AuthModalProps {
  mode: 'login' | 'signup';
  onClose: () => void;
  onSuccess: (session: Session) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ mode, onClose, onSuccess }) => {
  const imageUrl = "https://dean1665.vn/uploads/school/dh-kinh-te-hue-1.jpg";

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60"
      onClick={onClose}
    >
      <div 
        className="w-full h-full max-w-4xl max-h-[600px] rounded-lg shadow-2xl flex items-center justify-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center filter blur-sm scale-105"
          style={{ backgroundImage: `url('${imageUrl}')` }}
        ></div>
        <div className="absolute inset-0 bg-black opacity-30"></div> 
        <div className="relative bg-white/95 backdrop-blur-sm p-8 rounded-xl shadow-2xl w-full max-w-sm z-10">
          {/* Truyền 'mode' dưới tên 'initialView' cho AuthForm */}
          <AuthForm initialView={mode === 'login' ? 'sign_in' : 'sign_up'} />
        </div>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    </div>
  );
};

export default AuthModal;