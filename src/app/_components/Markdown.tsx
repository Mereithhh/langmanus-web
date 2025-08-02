import ReactMarkdown, { type Options } from "react-markdown";
import remarkMath from 'remark-math';
import { cn } from "~/core/utils";
import rehypeMathjax from 'rehype-mathjax'
export function Markdown({
  className,
  children,
  style,
  ...props
}: Options & { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={cn(className, "markdown")} style={style}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeMathjax]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
        {...props}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
