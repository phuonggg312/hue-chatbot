// components/MarkdownMessage.tsx
'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import rehypeExternalLinks from 'rehype-external-links';

type Props = { content: string };

const MarkdownMessage: React.FC<Props> = ({ content }) => {
  return (
    <div
      className="
        prose prose-slate max-w-none
        prose-p:my-2 prose-li:my-1 prose-ul:ml-5 prose-ol:ml-5
        prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:p-4 prose-pre:rounded-xl
        prose-pre:shadow-sm prose-headings:scroll-mt-20
        prose-a:text-blue-600 hover:prose-a:underline
        prose-img:rounded-xl
        prose-table:my-4
      "
    >
      <ReactMarkdown
        // Hỗ trợ bảng, checklist, link tự động... (GitHub Flavored Markdown)
        remarkPlugins={[remarkGfm, remarkBreaks]}
        // Cho phép HTML an toàn đã sanitize và mở link ở tab mới
        rehypePlugins={[
          rehypeRaw,
          [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
        ]}
        components={{
          code({ inline, className, children, ...props }) {
            // Inline code
            if (inline) {
              return (
                <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800" {...props}>
                  {children}
                </code>
              );
            }
            // Code block
            return (
              <pre className="!my-3 overflow-x-auto">
                <code className={className} {...props}>{children}</code>
              </pre>
            );
          },
          a({ children, ...props }) {
            return (
              <a className="no-underline hover:underline text-blue-600" {...props}>
                {children}
              </a>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-slate-300 pl-4 italic text-slate-600">
                {children}
              </blockquote>
            );
          },
          table({ children }) {
            return <table className="w-full border border-slate-200 rounded-lg">{children}</table>;
          },
          thead({ children }) {
            return <thead className="bg-slate-50">{children}</thead>;
          },
          th({ children }) {
            return (
              <th className="px-3 py-2 border border-slate-200 text-left align-middle">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="px-3 py-2 border border-slate-200 align-top">
                {children}
              </td>
            );
          },
          ul({ children }) {
            return <ul className="list-disc ml-5">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal ml-5">{children}</ol>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownMessage;
