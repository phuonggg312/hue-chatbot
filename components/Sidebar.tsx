// components/Sidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import {
  PlusCircle, User, LogOut, MoreHorizontal, Edit, Trash2, Check, X
} from 'lucide-react';
import type { Session } from '@supabase/auth-helpers-nextjs';
import ConfirmLogoutModal from './ConfirmLogoutModal';
import ConfirmDialog from './ConfirmDialog';

export type Conversation = {
  id: string;
  title: string;
  created_at?: string;
  last_message_at?: string | null;
  assistant_type: 'hoc_tap' | 'tuyen_sinh';
};

interface SidebarProps {
  session: Session;
  conversations: Conversation[];
  activeId?: string | null;
  onSelect: (id: string) => void | Promise<void>;
  onNew: () => void | Promise<void>;
  onNewByType?: (type: 'hoc_tap' | 'tuyen_sinh') => void | Promise<void>; // NEW (optional)
  onRename?: (id: string, title: string) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
}

const Sidebar: React.FC<SidebarProps> = ({
  session,
  conversations,
  activeId = null,
  onSelect,
  onNew,
  onNewByType,
  onRename,
  onDelete,
}) => {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState<string>('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Popover "Cuộc trò chuyện mới"
  const [showNewPopover, setShowNewPopover] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setLogoutModalOpen(false);
    router.refresh();
  };

  const startEdit = (id: string, current: string) => {
    setMenuId(null);
    setEditingId(id);
    setDraftTitle(current || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftTitle('');
  };

  const commitEdit = async (id: string) => {
    const title = draftTitle.trim();
    if (!title) return cancelEdit();
    await onRename?.(id, title);
    setEditingId(null);
  };

  const askDelete = (id: string) => {
    setMenuId(null);
    setConfirmDeleteId(id);
  };

  return (
    <>
<div className="w-1/4 max-w-xs bg-gray-800 text-white flex flex-col p-4 h-screen relative">
{/* User */}
        <div className="flex items-center gap-3 mb-6 p-2 border-b border-gray-700 pb-4">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white">
            {(session?.user?.user_metadata?.full_name?.charAt(0) ||
              session?.user?.email?.charAt(0) || 'A').toUpperCase()}
          </div>
          <span className="font-semibold text-sm truncate">
            {session?.user?.user_metadata?.full_name || session?.user?.email}
          </span>
        </div>

        {/* New conversation with popover */}
        <div className="relative mb-4">
          <button
            type="button"
            onClick={() => setShowNewPopover((v) => !v)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors text-sm font-semibold"
          >
            <PlusCircle size={18} />
            <span>Cuộc trò chuyện mới</span>
          </button>

          {showNewPopover && (
  <>
    {/* Backdrop CHỈ trong phạm vi Sidebar, không che phần chat */}
    <div
      className="absolute inset-0 z-30"
      onClick={() => setShowNewPopover(false)}
    />

    {/* Popover thả xuống ngay dưới nút, nằm trong Sidebar */}
    <div className="absolute z-40 left-0 right-0 mt-2">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-lg p-2">
        <button
          type="button"
          onClick={() => { setShowNewPopover(false); onNewByType?.('hoc_tap'); }}
          className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-700 text-sm"
        >
          📘 Hỗ trợ người học
          <div className="text-xs text-gray-400">Lịch học, đăng ký học phần, CLB…</div>
        </button>

        <button
          type="button"
          onClick={() => { setShowNewPopover(false); onNewByType?.('tuyen_sinh'); }}
          className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-700 text-sm mt-1"
        >
          🎓 Tư vấn tuyển sinh
          <div className="text-xs text-gray-400">Điểm chuẩn, phương thức, học phí…</div>
        </button>

        {!onNewByType && (
          <button
            type="button"
            onClick={() => { setShowNewPopover(false); onNew?.(); }}
            className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-700 text-sm mt-2 border-t border-gray-700 pt-2"
          >
            Tạo mặc định
          </button>
        )}
      </div>
    </div>
  </>
)}

        </div>

        {/* History */}
        <div className="flex-grow overflow-y-auto pr-2">
          <p className="text-xs text-gray-400 mb-2 font-semibold uppercase">Lịch sử</p>

          {conversations.length === 0 ? (
            <p className="text-sm text-gray-400">Chưa có cuộc trò chuyện</p>
          ) : (
            <div className="space-y-1">
              {conversations.map((item) => {
                const isActive = item.id === activeId;
                const isEditing = item.id === editingId;

                return (
                  <div key={item.id} className="group relative">
                    {!isEditing ? (
                      // Wrapper item dùng div role="button" để tránh lồng button
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => onSelect(item.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') onSelect(item.id);
                        }}
                        className={`flex items-center justify-between w-full p-2 rounded-md text-sm transition-colors cursor-pointer ${
                          isActive ? 'bg-gray-700' : 'hover:bg-gray-700'
                        }`}
                        aria-pressed={isActive}
                        title={item.title || 'Không tiêu đề'}
                      >
                        <div className="truncate flex-grow text-left">
                          <div className="flex items-center gap-2">
                            {/* Pill loại trợ lý */}
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide ${
                                item.assistant_type === 'hoc_tap'
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                              }`}
                            >
                              {item.assistant_type === 'hoc_tap' ? 'Hỗ trợ người học' : 'Tư vấn tuyển sinh'}
                            </span>
                            <span className="truncate">{item.title || 'Không tiêu đề'}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuId(menuId === item.id ? null : item.id);
                          }}
                          className={`p-1 rounded transition-opacity ${
                            isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}
                          aria-label="Mở menu"
                          aria-haspopup="menu"
                          aria-expanded={menuId === item.id}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 w-full p-2 rounded-md text-sm bg-gray-700">
                        <input
                          autoFocus
                          value={draftTitle}
                          onChange={(e) => setDraftTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') commitEdit(item.id);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          className="flex-1 bg-gray-600 rounded px-2 py-1 outline-none"
                          placeholder="Tên cuộc trò chuyện"
                        />
                        <button
                          type="button"
                          onClick={() => commitEdit(item.id)}
                          className="p-1 hover:bg-gray-600 rounded"
                          title="Lưu"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="p-1 hover:bg-gray-600 rounded"
                          title="Hủy"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}

                    {/* Menu Sửa/Xóa */}
                    {menuId === item.id && !isEditing && (
                      <div
                        role="menu"
                        className="absolute right-0 mt-1 z-20 bg-gray-900 rounded-md shadow-lg p-1 w-48 border border-gray-700"
                      >
                        <button
                          type="button"
                          onClick={() => startEdit(item.id, item.title || '')}
                          className="w-full flex items-center gap-2 text-left text-sm p-2 hover:bg-gray-700 rounded-md"
                          role="menuitem"
                        >
                          <Edit size={14} /> Sửa tên
                        </button>
                        <button
                          type="button"
                          onClick={() => askDelete(item.id)}
                          className="w-full flex items-center gap-2 text-left text-sm p-2 hover:bg-gray-700 rounded-md text-red-400"
                          role="menuitem"
                        >
                          <Trash2 size={14} /> Xóa
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 pt-4 mt-4 space-y-1 text-sm">
          <Link href="/profile" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700">
            <User size={18} />
            <span>Quản lý tài khoản</span>
          </Link>

          <button
            type="button"
            onClick={() => setLogoutModalOpen(true)}
            className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-700 text-red-400 hover:text-red-300"
          >
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Modal xác nhận XÓA hội thoại */}
      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Xóa cuộc trò chuyện"
        message="Bạn có chắc chắn muốn xóa cuộc trò chuyện này không?"
        confirmText="Xóa"
        cancelText="Hủy"
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={async () => {
          if (confirmDeleteId) {
            await onDelete?.(confirmDeleteId);
          }
          setConfirmDeleteId(null);
        }}
      />

      {/* Modal xác nhận ĐĂNG XUẤT */}
      <ConfirmLogoutModal
        isOpen={isLogoutModalOpen}
        userEmail={session?.user?.email || ''}
        onConfirm={handleSignOut}
        onCancel={() => setLogoutModalOpen(false)}
      />
    </>
  );
};

export default Sidebar;
