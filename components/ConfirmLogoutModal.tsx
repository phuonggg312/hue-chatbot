// file: components/ConfirmLogoutModal.tsx
'use client';

import React from 'react';

interface ConfirmLogoutModalProps {
  isOpen: boolean;
  userEmail: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmLogoutModal: React.FC<ConfirmLogoutModalProps> = ({ isOpen, userEmail, onConfirm, onCancel }) => {
  if (!isOpen) {
    return null;
  }

  return (
    // Lớp phủ nền mờ
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {/* Khung nội dung modal */}
      <div className="bg-white rounded-2xl shadow-lg p-8 m-4 max-w-md w-full text-center">
        <h2 className="text-xl font-bold mb-2 text-gray-800">Bạn có chắc muốn đăng xuất không?</h2>
        <p className="text-gray-600 mb-8">
          Đăng xuất khỏi tài khoản <br />
          <span className="font-semibold text-gray-800">{userEmail}</span>
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full bg-gray-800 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Đăng xuất
          </button>
          <button
            onClick={onCancel}
            className="w-full bg-white text-gray-800 font-semibold py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmLogoutModal;