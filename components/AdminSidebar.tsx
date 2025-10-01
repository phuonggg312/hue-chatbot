// file: components/AdminSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Bot, Library } from 'lucide-react';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/users', icon: Users, label: 'Quản lý Người dùng' },
  { href: '/admin/knowledge', icon: Library, label: 'Quản lý Kiến thức' },
  // { href: '/admin/settings', icon: Bot, label: 'Cấu hình Chatbot' },
];

const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-gray-300 flex flex-col h-screen">
      <div className="flex items-center gap-3 p-4 border-b border-gray-700">
        <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
            <Bot size={20} className="text-white" />
        </div>
        <span className="font-bold text-white text-lg">HCE Admin</span>
      </div>
      <nav className="flex-grow p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 p-2 rounded-md transition-colors ${
                isActive
                  ? 'bg-red-600 text-white font-bold'
                  : 'hover:bg-gray-700'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <Link href="/" className="text-sm hover:underline">
          ← Quay lại trang Chatbot
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;