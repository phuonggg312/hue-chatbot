'use client';

type AssistantType = 'hoc_tap' | 'tuyen_sinh';

export default function AssistantPicker({
  onStart,
}: {
  // click card -> onStart(type)
  // click gợi ý -> onStart(type, initialQuestion)
  onStart: (type: AssistantType, initialQuestion?: string) => void;
}) {
  const SUGG_TS = [
    'Điểm chuẩn năm ngoái?',
    'Học phí ngành Quản trị Kinh doanh?',
    'Các phương thức xét tuyển?',
  ];
  const SUGG_HT = [
    'Cách đăng ký học phần?',
    'Lịch học tuần này?',
    'Các câu lạc bộ của trường?',
  ];

  const Card = ({
    title,
    subtitle,
    type,
    suggestions,
  }: {
    title: string;
    subtitle: string;
    type: AssistantType;
    suggestions: string[];
  }) => (
    <div className="rounded-xl border border-gray-200 p-5 hover:shadow-sm transition">
      {/* Click vào card -> chọn luồng và chào ngay */}
      <button
        type="button"
        onClick={() => onStart(type)}
        className="text-left w-full"
      >
        <div className="text-lg font-semibold">{title}</div>
        <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
      </button>

      {/* Gợi ý: click -> chọn luồng + gửi luôn câu hỏi */}
      <div className="mt-4 space-y-2">
        {suggestions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onStart(type, q)}
            className="block w-full text-left text-sm text-blue-600 hover:underline px-2 py-1 rounded hover:bg-gray-50"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-full w-full flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <h2 className="text-2xl font-bold text-gray-800 text-center">
          Chào mừng đến với Trợ lý ảo HCE!
        </h2>
        <p className="text-center text-gray-600 mt-2 mb-6">
          Chọn trợ lý để bắt đầu hoặc nhấn nhanh vào một câu hỏi gợi ý.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card
            title="Tư vấn Tuyển sinh"
            subtitle="Điểm chuẩn, phương thức xét tuyển, ngành học, học phí…"
            type="tuyen_sinh"
            suggestions={SUGG_TS}
          />
          <Card
            title="Hỗ trợ Người học"
            subtitle="Đăng ký học phần, lịch học, quy chế, CLB, học liệu…"
            type="hoc_tap"
            suggestions={SUGG_HT}
          />
        </div>
      </div>
    </div>
  );
}
