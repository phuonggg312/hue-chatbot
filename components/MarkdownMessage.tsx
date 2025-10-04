import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import hljs from "highlight.js/lib/common";
import "highlight.js/styles/github.css"; // có thể đổi theme khác

type Props = { content: string };

export default function MarkdownMessage({ content }: Props) {
  return (
    <div className="prose prose-zinc max-w-none prose-pre:p-0 prose-code:before:hidden prose-code:after:hidden">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        // tip: bạn có thể thêm rehype-sanitize khi cần siết chặt XSS
        components={{
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
          img: ({ node, ...props }) => (
            // chặn kích thước ảnh phá layout
            // eslint-disable-next-line @next/next/no-img-element
            <img {...props} alt={props.alt as string} style={{ maxWidth: "100%", height: "auto" }} />
          ),
          code: ({ inline, children, ...props }) => {
            const text = String(children ?? "");
            if (inline) {
              return <code {...props}>{text}</code>;
            }
            // highlight code block
            const html = hljs.highlightAuto(text).value;
            return (
              <pre className="hljs rounded-lg overflow-auto p-3">
                <code dangerouslySetInnerHTML={{ __html: html }} />
              </pre>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
