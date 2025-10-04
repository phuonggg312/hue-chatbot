import { useEffect, useRef, useState } from "react";

export function useTypewriter(speedMs = 18) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [output, setOutput] = useState("");
  const fullRef = useRef("");
  const idxRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const speedRef = useRef(speedMs);

  const tick = () => {
    const full = fullRef.current;
    const i = idxRef.current;
    if (i >= full.length) {
      stop();
      return;
    }
    // cắt theo “từ” mượt hơn
    const nextChunk = full.slice(i, i + Math.max(1, Math.min(12, full.length - i)));
    idxRef.current += nextChunk.length;
    setOutput((p) => p + nextChunk);
  };

  const start = (fullText: string) => {
    stop(); // reset nếu đang chạy
    fullRef.current = fullText;
    idxRef.current = 0;
    setOutput("");
    setIsStreaming(true);
    timerRef.current = window.setInterval(tick, speedRef.current);
  };

  const pause = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsStreaming(false);
  };

  const resume = () => {
    if (!timerRef.current && idxRef.current < fullRef.current.length) {
      setIsStreaming(true);
      timerRef.current = window.setInterval(tick, speedRef.current);
    }
  };

  const stop = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsStreaming(false);
  };

  useEffect(() => () => stop(), []); // cleanup khi unmount

  return { isStreaming, output, start, pause, resume, stop };
}
