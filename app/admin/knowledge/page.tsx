'use client'
import { useState } from 'react'

// Giả lập dữ liệu tài liệu
const initialDocuments = [
    { id: 1, name: 'DeAnTuyenSinh_2026.pdf', uploadedAt: '27/09/2025', status: 'processed' },
    { id: 2, name: 'HocPhi_NamHoc_2026.docx', uploadedAt: '26/09/2025', status: 'processed' },
    { id: 3, name: 'QuyCheHocVu.pdf', uploadedAt: '25/09/2025', status: 'pending' },
]

export default function KnowledgeManagement() {
    const [documents, setDocuments] = useState(initialDocuments);
    const [isTraining, setIsTraining] = useState(false);

    const handleRetrain = () => {
        setIsTraining(true);
        // Giả lập quá trình huấn luyện
        setTimeout(() => {
            setIsTraining(false);
            alert("Đã huấn luyện lại chatbot với dữ liệu mới!");
        }, 3000);
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Quản lý Thư viện Kiến thức</h1>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                    Tải lên tài liệu mới
                </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600 mb-4">Đây là nơi bạn quản lý các tài liệu nguồn mà chatbot sử dụng để trả lời câu hỏi. Sau khi tải lên tài liệu mới, hãy nhấn nút "Huấn luyện lại".</p>
                
                <div className="bg-white rounded-lg border border-gray-200">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Tên tài liệu</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Ngày cập nhật</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Trạng thái</th>
                                <th className="py-3 px-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {documents.map((doc) => (
                                <tr key={doc.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4 font-medium text-gray-800">{doc.name}</td>
                                    <td className="py-3 px-4 text-gray-600">{doc.uploadedAt}</td>
                                    <td className="py-3 px-4">
                                        {doc.status === 'processed' ? (
                                            <span className="bg-green-100 text-green-800 py-1 px-3 rounded-full text-xs font-semibold">Đã xử lý</span>
                                        ) : (
                                            <span className="bg-yellow-100 text-yellow-800 py-1 px-3 rounded-full text-xs font-semibold">Đang chờ</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <button className="text-red-500 hover:text-red-700">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={handleRetrain}
                        disabled={isTraining}
                        className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 disabled:bg-gray-400 flex items-center gap-2"
                    >
                        {isTraining ? (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                        )}
                        {isTraining ? 'Đang huấn luyện...' : 'Huấn luyện lại'}
                    </button>
                </div>
            </div>
        </div>
    )
}
