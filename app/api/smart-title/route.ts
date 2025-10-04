// app/api/smart-title/route.ts
import { NextRequest, NextResponse } from "next/server";

// --- CONFIG (Gemini only) ---
const GEMINI_MODEL = process.env.GEMINI_TITLE_MODEL || "gemini-2.5-pro";
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Làm sạch/chốt tiêu đề lần cuối ở server
function finalizeTitle(raw: string) {
  if (!raw) return "Cuộc trò chuyện";
  let t = raw
    .replace(/^["'“”‘’\[\](){}]+|["'“”‘’\[\](){}]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // bỏ dấu câu cuối
  t = t.replace(/[.?!,:;。、]+$/g, "");

  // cắt bớt nếu quá dài
  if (t.length > 48) t = t.slice(0, 48).trim() + "…";

  return t || "Cuộc trò chuyện";
}

export async function POST(req: NextRequest) {
  try {
    if (!GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: "GOOGLE_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const { text, assistant_type } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    // Prompt: ép trả về JSON duy nhất
    const systemRules = `
Bạn là công cụ đặt tiêu đề tiếng Việt cho cuộc trò chuyện.
Yêu cầu:
- 3–8 từ, ngắn gọn, đúng ngữ cảnh.
- Không dấu câu ở cuối, không ngoặc kép.
- Viết hoa hợp lý (tên riêng/ngành viết hoa chữ cái đầu).
- Bám sát loại trợ lý: "${assistant_type ?? "tuyen_sinh"}".
Chỉ trả về JSON: {"title":"Tiêu đề"}.
`;

    const userPrompt = `Câu đầu tiên của người dùng:
"""${text}"""
Hãy sinh "title" theo yêu cầu.`;

    const url = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(
      GEMINI_MODEL
    )}:generateContent?key=${GOOGLE_API_KEY}`;

    const body = {
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemRules}\n\n${userPrompt}` }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 64,
        // Yêu cầu Gemini trả về đúng JSON string
        responseMimeType: "application/json",
      },
    };

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const errText = await r.text().catch(() => "");
      return NextResponse.json(
        { error: `Gemini error: ${r.status} ${errText}` },
        { status: 500 }
      );
    }

    const data = await r.json();

    // Lấy text từ candidate đầu tiên
    const contentText: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Cố parse JSON (vì ta set responseMimeType application/json)
    let title = "Cuộc trò chuyện";
    try {
      const parsed = JSON.parse(contentText);
      title = finalizeTitle(parsed?.title || "");
    } catch {
      // nếu model trả plain text, fallback
      title = finalizeTitle(String(contentText || ""));
    }

    return NextResponse.json({ title });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
