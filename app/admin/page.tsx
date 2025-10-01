    export default function AdminDashboard() {
        // Trong tương lai, chúng ta sẽ lấy dữ liệu thống kê thật từ Supabase
        const stats = [
            { name: 'Tổng số người dùng', value: '1,204' },
            { name: 'Số cuộc trò chuyện (hôm nay)', value: '86' },
            { name: 'Câu hỏi chưa trả lời được', value: '12' },
        ]

        return (
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat) => (
                        <div key={stat.name} className="bg-white p-6 rounded-lg shadow">
                            <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-8 bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4">Các chủ đề được quan tâm nhiều nhất</h2>
                    {/* Ở đây sẽ là một biểu đồ */}
                    <div className="h-64 bg-gray-200 rounded-md flex items-center justify-center">
                        <p className="text-gray-500">[Biểu đồ sẽ được hiển thị ở đây]</p>
                    </div>
                </div>
            </div>
        )
    }
