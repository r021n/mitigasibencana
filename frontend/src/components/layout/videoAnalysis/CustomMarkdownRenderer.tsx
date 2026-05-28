import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface CustomMarkdownRendererProps {
  text: string;
  className?: string;
}

export default function CustomMarkdownRenderer({
  text,
  className = "",
}: CustomMarkdownRendererProps) {
  if (!text) return null;

  return (
    <div
      className={`max-w-none text-on-surface-variant leading-relaxed select-text ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="font-display-md text-base font-bold text-on-surface mt-4 mb-2 select-none border-b border-outline-variant/20 pb-1">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="font-display-md text-sm font-bold text-on-surface mt-3 mb-2 select-none">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-display-md text-xs font-bold text-on-surface mt-2 mb-1 select-none">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 text-inherit leading-relaxed">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 mb-3 space-y-1 text-inherit">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 mb-3 space-y-1 text-inherit">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-inherit leading-normal text-sm">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-on-surface">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/50 pl-3 py-1 my-3 bg-primary/5 rounded-r-lg italic text-xs text-on-surface-variant">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="bg-surface-container-high px-1.5 py-0.5 rounded font-mono text-xs text-secondary-container-on select-text">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-surface-container rounded-xl p-3.5 my-3 overflow-x-auto font-mono text-[11px] text-on-surface border border-outline-variant/20 select-text custom-scrollbar">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto w-full my-3 rounded-lg border border-outline-variant/20">
              <table className="w-full text-left border-collapse text-xs select-text">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-surface-container-low border-b border-outline-variant/30 font-bold text-on-surface">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-outline-variant/10">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-surface-container-low/20 transition-none">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="py-2 px-3 font-semibold">{children}</th>
          ),
          td: ({ children }) => (
            <td className="py-2 px-3 text-on-surface-variant font-normal leading-normal">
              {children}
            </td>
          ),
          input: ({ checked }) => (
            <span className="inline-flex items-center align-middle mr-1.5 select-none">
              <span
                className={`material-symbols-outlined text-[18px] leading-none ${
                  checked
                    ? "text-success font-bold"
                    : "text-on-surface-variant/40"
                }`}
              >
                {checked ? "check_box" : "check_box_outline_blank"}
              </span>
            </span>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
