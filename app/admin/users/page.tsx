'use client'
import { useState, useEffect } from 'react'

// Trong một ứng dụng thực tế, dữ liệu này sẽ được lấy từ Supabase
// Chúng ta sẽ giả lập dữ liệu để xây dựng giao diện trước
const initialUsers = [
    { id: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6', email: 'lethithuphuong03122004@gmail.com', created_at: '2025-09-29T10:00:00Z', role: 'user' },
    { id: 'q7r8s9t0-u1v2-w3x4-y5z6-a7b8c9d0e1f2', email: 'nguyen.van.a@student.hue.edu.vn', created_at: '2025-09-28T14:30:00Z', role: 'user' },
    { id: 'g3h4i5j6-k7l8-m9n0-o1p2-q3r4s5t6u7v8', email: 'admin@hue.edu.vn', created_at: '2025-09-27T09:00:00Z', role: 'admin' },
]

export default function UserManagement() {
    const [users, setUsers] = useState(initialUsers);

    // Ở bước sau, chúng ta sẽ thay thế dữ liệu giả lập bằng một hàm useEffect
    // để gọi API lấy danh sách người dùng thật từ Supabase.

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Quản lý Người dùng</h1>
                <div className="relative">
                    <input 
                        type="text"
                        placeholder="Tìm kiếm email..."
                        className="px-4 py-2 border border-gray-300 rounded-md w-64"
                    />
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="bg-white rounded-lg border border-gray-200">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Email</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Ngày đăng ký</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Vai trò</th>
                                <th className="py-3 px-4 font-semibold text-sm text-gray-600">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4 font-medium text-gray-800">{user.email}</td>
                                    <td className="py-3 px-4 text-gray-600">
                                        {new Date(user.created_at).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`py-1 px-3 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button className="text-gray-500 hover:text-blue-700" title="Xem lịch sử chat">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                            </button>
                                            <button className="text-gray-500 hover:text-red-700" title="Vô hiệu hóa tài khoản">
                                               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" x2="19.07" y1="4.93" y2="19.07"></line></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
