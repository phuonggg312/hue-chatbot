'use client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    // Lắng nghe sự kiện đăng nhập thành công
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        // Nếu đăng nhập thành công, chuyển hướng về trang chủ
        router.push('/')
        router.refresh() // Làm mới trang để đảm bảo server nhận được phiên đăng nhập mới
      }
    })

    return () => {
      // Dọn dẹp listener khi component bị hủy
      subscription.unsubscribe()
    }
  }, [supabase, router])

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Chào mừng đến với HUE Chatbot</h2>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="light"
          providers={[]} // Chúng ta chỉ dùng đăng nhập bằng Email/Password
          redirectTo={`${location.origin}/auth/callback`}
        />
      </div>
    </div>
  )
}

