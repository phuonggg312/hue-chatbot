// file: components/AuthForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Component bây giờ sẽ nhận một prop để biết nên hiển thị form nào lúc đầu
interface AuthFormProps {
  initialView: 'sign_in' | 'sign_up';
}

const AuthForm: React.FC<AuthFormProps> = ({ initialView }) => {
  const supabase = createClientComponentClient();
  
  // State sẽ được khởi tạo dựa trên prop được truyền vào
  const [view, setView] = useState(initialView);

  // Dùng useEffect để cập nhật lại view nếu prop thay đổi (ví dụ: khi modal đóng và mở lại)
  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  return (
    <div>
      <img 
        src="https://placehold.co/150x50/344e41/ffffff?text=LOGO+HCE" 
        alt="Logo HCE" 
        className="mx-auto mb-6"
      />
      <Auth
        supabaseClient={supabase}
        providers={['google']}
        view={view} // Luôn hiển thị đúng view theo state
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#3b82f6',
                brandAccent: '#2563eb',
              },
            },
          },
        }}
        theme="light"
        localization={{
            variables: {
                sign_in: {
                    email_label: 'Địa chỉ email',
                    password_label: 'Mật khẩu',
                    button_label: 'Đăng nhập',
                    social_provider_text: 'Tiếp tục với {{provider}}',
                },
                sign_up: {
                    email_label: 'Địa chỉ email',
                    password_label: 'Tạo mật khẩu',
                    button_label: 'Đăng ký',
                    social_provider_text: 'Tiếp tục với {{provider}}',
                },
            }
        }}
      />

      {/* Tự tạo link chuyển đổi giao diện */}
      <div className="text-center text-sm mt-4">
        {view === 'sign_in' ? (
          <p className="text-gray-600">
            Chưa có tài khoản?{' '}
            <button onClick={() => setView('sign_up')} className="font-medium text-blue-600 hover:underline">
              Đăng ký ngay
            </button>
          </p>
        ) : (
          <p className="text-gray-600">
            Đã có tài khoản?{' '}
            <button onClick={() => setView('sign_in')} className="font-medium text-blue-600 hover:underline">
              Đăng nhập
            </button>
          </p>
        )}
      </div>

    </div>
  );
};

export default AuthForm;