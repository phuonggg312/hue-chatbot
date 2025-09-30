import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// TODO: Sau này sẽ tạo component AdminSidebar riêng
const AdminSidebar = () => (
    <div className="w-1/5 bg-gray-900 text-gray-300 flex flex-col p-4">
        <div className="flex items-center gap-2 mb-8">
            <img src="https://placehold.co/40x40/f87171/ffffff?text=A" alt="Admin Logo" className="rounded-lg"/>
            <span className="font-bold text-white text-lg">HUE Admin</span>
        </div>
        <nav className="space-y-2">
            <Link href="/admin" className="flex items-center gap-3 p-2 rounded-md bg-red-600 text-white font-bold">Dashboard</Link>
            <Link href="/admin/knowledge" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700">Quản lý Kiến thức</Link>
            <Link href="/admin/users" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700">Quản lý Người dùng</Link>
        </nav>
    </div>
)

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // TODO: Ở đây chúng ta sẽ thêm logic để kiểm tra xem user có phải là admin không.
  // Nếu không phải admin hoặc chưa đăng nhập, sẽ chuyển hướng họ đi.
  // Tạm thời, chúng ta sẽ cho phép truy cập để xây dựng giao diện.
  // if (!session) {
  //   redirect('/login')
  // }

  return (
    <div className="w-full h-screen bg-gray-50 flex overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto">
            {children}
        </main>
    </div>
  )
}
