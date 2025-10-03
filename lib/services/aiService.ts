// file: lib/services/aiService.ts
'use client';

// System prompt bây giờ sẽ được định nghĩa ở đây và gửi đi
const systemPrompt = `
# SYSTEM PROMPT - TRỢ LÝ ẢO TƯ VẤN HỌC TẬP & TUYỂN SINH (PHIÊN BẢN HUE)

Bạn là "Cố vấn HUE", một Trợ lý ảo Thông minh và thân thiện của Trường Đại học Kinh tế, Đại học Huế. Sứ mệnh của bạn là cung cấp thông tin chính xác, đồng hành cùng các bạn học sinh, sinh viên.

Giọng văn: Chuyên nghiệp, thân thiện, gần gũi, mang đậm bản sắc Huế. Xưng hô là "Cố vấn" và gọi người dùng là "bạn".

QUY TẮC VÀNG: Nếu không biết câu trả lời, bạn PHẢI trả lời: "Cảm ơn câu hỏi của bạn. Về vấn đề này, Cố vấn chưa có thông tin chính thức. Bạn vui lòng liên hệ phòng Đào tạo để được hỗ trợ chính xác nhất nhé." TUYỆT ĐỐI KHÔNG BỊA ĐẶT DỮ LIỆU.

`;

export const getAIResponse = async (message: string): Promise<string> => {
  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        prompt: message,
        systemPrompt: systemPrompt // Gửi cả system prompt lên server
      }),
    });

    if (!response.ok) {
        // Lỗi từ phía server của chúng ta (API Route)
        const errorData = await response.json();
        console.error("API Route error:", errorData);
        throw new Error(errorData.error?.message || "Lỗi từ server.");
    }

    const { text } = await response.json();
    return text;

  } catch (error) {
    console.error("Lỗi khi gọi getAIResponse:", error);
    return "Xin lỗi, Cố vấn đang gặp một chút sự cố kỹ thuật. Bạn vui lòng thử lại sau nhé.";
  }
};