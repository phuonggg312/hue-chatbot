// file: app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/auth-helpers-nextjs';

export default function ProfilePage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  
  // State cho các trường trong form
  const [fullName, setFullName] = useState('');
  const [currentPassword, setCurrentPassword] = useState(''); // <-- 1. State cho mật khẩu hiện tại
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setFullName(user?.user_metadata?.full_name || '');
    };
    getUser();
  }, [supabase]);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    // Chỉ thực hiện đổi mật khẩu nếu người dùng nhập mật khẩu mới
    if (newPassword) {
      // --- 2. Logic xác thực mật khẩu cũ ---
      if (!currentPassword) {
        setMessage('Lỗi: Vui lòng nhập mật khẩu hiện tại.');
        setLoading(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setMessage('Lỗi: Mật khẩu xác nhận không khớp!');
        setLoading(false);
        return;
      }

      // Bước 1: Xác thực mật khẩu hiện tại bằng cách thử đăng nhập lại
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });

      if (signInError) {
        setMessage('Lỗi: Mật khẩu hiện tại không chính xác!');
        setLoading(false);
        return;
      }
      
      // Bước 2: Nếu mật khẩu cũ đúng, tiến hành cập nhật mật khẩu mới
      const { error: updatePasswordError } = await supabase.auth.updateUser({ password: newPassword });
      if (updatePasswordError) {
        setMessage(`Lỗi cập nhật mật khẩu: ${updatePasswordError.message}`);
        setLoading(false);
        return;
      }
    }

    // Logic cập nhật họ tên (luôn chạy)
    const { error: updateNameError } = await supabase.auth.updateUser({
      data: { full_name: fullName }
    });

    if (updateNameError) {
      setMessage(`Lỗi cập nhật họ tên: ${updateNameError.message}`);
      setLoading(false);
      return;
    }

    setMessage('Cập nhật thông tin thành công!');
    router.refresh(); // Làm mới dữ liệu để sidebar cập nhật tên mới
    // Xóa các trường mật khẩu sau khi thành công
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setLoading(false);
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 relative">
        <Link href="/" className="text-blue-600 hover:underline flex items-center gap-1 absolute top-8 left-8 text-sm">
            <ArrowLeft size={16} /> Quay lại
        </Link>

        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center mt-8">Quản lý tài khoản</h2>
        <form onSubmit={handleSaveChanges} className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Thông tin cá nhân</h4>
            {/* ... (phần email và họ tên giữ nguyên) ... */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input 
                  type="email" 
                  value={user?.email || ''} 
                  disabled 
                  className="mt-1 block w-full bg-gray-100 rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                <input 
                  type="text" 
                  placeholder="Nhập họ tên của bạn" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Đổi mật khẩu</h4>
            <div className="space-y-4">
              {/* --- 3. Thêm trường nhập mật khẩu hiện tại vào giao diện --- */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Mật khẩu hiện tại</label>
                <input 
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
                <input 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          {message && <p className={`text-sm ${message.startsWith('Lỗi') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}

          <button type="submit" disabled={loading} className="w-full py-2.5 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300">
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>
      </div>
    </div>
  );
}