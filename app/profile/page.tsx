'use client'

import { useState, useEffect, FormEvent } from 'react'
import { createClientComponentClient, User } from '@supabase/auth-helpers-nextjs'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [fullName, setFullName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(true);

    const supabase = createClientComponentClient();
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                setFullName(user.user_metadata.full_name || '');
            } else {
                // Nếu không có user, chuyển về trang đăng nhập
                router.push('/login');
            }
            setLoading(false);
        };
        fetchUser();
    }, [supabase, router]);

    const handleUpdateProfile = async (event: FormEvent) => {
        event.preventDefault();

        const updates: { password?: string; data?: { full_name: string } } = {};

        if (newPassword) {
            if (newPassword.length < 6) {
                toast.error("Mật khẩu phải có ít nhất 6 ký tự.");
                return;
            }
            updates.password = newPassword;
        }

        if (fullName !== user?.user_metadata.full_name) {
            updates.data = { full_name: fullName };
        }

        if (Object.keys(updates).length === 0) {
            toast('Không có thông tin nào thay đổi.');
            return;
        }

        const toastId = toast.loading('Đang cập nhật...');
        const { error } = await supabase.auth.updateUser(updates);

        if (error) {
            toast.error(error.message, { id: toastId });
        } else {
            toast.success('Cập nhật tài khoản thành công!', { id: toastId });
            setNewPassword('');
            // Nếu đổi mật khẩu, đăng xuất để đăng nhập lại cho an toàn
            if(updates.password) {
                await supabase.auth.signOut();
                router.push('/login');
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Đang tải...</div>
    }

    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md">
                <Link href="/" className="text-blue-600 hover:underline flex items-center gap-1 mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    Quay lại trang Chat
                </Link>
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý tài khoản</h1>
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div>
                            <h2 className="font-semibold text-gray-700 mb-2">Thông tin cá nhân</h2>
                            <label className="block text-sm font-medium text-gray-600">Email</label>
                            <input 
                                type="email" 
                                value={user?.email || ''} 
                                disabled 
                                className="mt-1 block w-full bg-gray-100 rounded-md border-gray-300 shadow-sm"
                            />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-600">Họ và tên</label>
                            <input 
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-700 mb-2">Đổi mật khẩu</h2>
                            <label className="block text-sm font-medium text-gray-600">Mật khẩu mới</label>
                            <input 
                                type="password" 
                                placeholder="Để trống nếu không muốn đổi" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                        </div>
                        <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">
                            Lưu thay đổi
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
