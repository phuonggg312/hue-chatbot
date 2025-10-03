// app/api/ai/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, systemPrompt } = await req.json();
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Google API Key is not configured." }, { status: 500 });
    }

    const url =
    "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent"
    + `?key=${apiKey}`;
  // hoặc: gemini-2.5-flash
  
    const fullPrompt = `${systemPrompt ?? ""}\n\nNgười dùng hỏi: ${prompt}\n\nCố vấn HUE trả lời:`;

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }]}] }),
    });

    if (!r.ok) {
      const errText = await r.text();            // log nguyên văn từ Google
      console.error("Gemini API error:", errText);
      // Trả 502 để phân biệt với 404 “route không tồn tại” của Next
      return NextResponse.json({ error: errText }, { status: 502 });
    }

    const data = await r.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return NextResponse.json({ text });
  } catch (e) {
    console.error("Internal server error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Giúp kiểm tra nhanh: GET /api/ai → 405 (route tồn tại)
export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
