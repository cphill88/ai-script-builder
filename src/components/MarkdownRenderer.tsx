import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FunctionBadge } from "./FunctionBadge";

const FUNCTION_PLACEHOLDER_REGEX = /<% function ([a-zA-Z0-9-]+) %>/g;

interface MarkdownRendererProps {
  content: string;
  onUpdateFunction: (oldId: string, newId: string) => void;
  onDeleteFunction: (id: string) => void;
}

export function MarkdownRenderer({
  content,
  onUpdateFunction,
  onDeleteFunction,
}: MarkdownRendererProps) {
  // Process content to replace function placeholders with markers
  const processedContent = React.useMemo(() => {
    const badges = new Map<string, string>();
    let index = 0;
    
    const text = content.replace(FUNCTION_PLACEHOLDER_REGEX, (_, functionId) => {
      const marker = `BADGE_MARKER_${index++}`;
      badges.set(marker, functionId);
      return marker;
    });

    return { text, badges };
  }, [content]);

  // Helper to process text nodes and replace markers with badges
  const processTextNode = React.useCallback((text: string) => {
    if (processedContent.badges.size === 0) return text;
    
    const parts: React.ReactNode[] = [];
    let remaining = text;
    
    for (const [marker, functionId] of processedContent.badges) {
      const index = remaining.indexOf(marker);
      if (index !== -1) {
        if (index > 0) {
          parts.push(remaining.substring(0, index));
        }
        
        parts.push(
          <span key={marker} className="inline-block align-middle">
            <FunctionBadge
              functionId={functionId}
              onUpdate={(newId) => onUpdateFunction(functionId, newId)}
              onDelete={() => onDeleteFunction(functionId)}
            />
          </span>
        );
        
        remaining = remaining.substring(index + marker.length);
      }
    }
    
    if (remaining) {
      parts.push(remaining);
    }
    
    return parts.length > 0 ? parts : text;
  }, [processedContent.badges, onUpdateFunction, onDeleteFunction]);

  // Generic processor for any element with text children
  const createTextProcessor = React.useCallback((Component: string) => {
    return ({ children, ...props }: React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>) => {
      const processChildren = (child: React.ReactNode): React.ReactNode => {
        if (typeof child === 'string') {
          return processTextNode(child);
        }
        
        if (React.isValidElement(child)) {
          const childProps = child.props as { children?: React.ReactNode };
          if (childProps.children) {
            return React.cloneElement(
              child,
              {},
              React.Children.map(childProps.children, processChildren)
            );
          }
        }
        
        if (Array.isArray(child)) {
          return child.map(processChildren);
        }
        
        return child;
      };

      const processedChildren = React.Children.map(children, processChildren);
      return React.createElement(Component, props, processedChildren);
    };
  }, [processTextNode]);

  const components = React.useMemo(() => ({
    // Headings
    h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h1 className="text-4xl font-extrabold leading-tight mt-0 mb-8" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h2 className="text-2xl font-bold leading-tight mt-8 mb-4" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h3 className="text-xl font-semibold leading-normal mt-6 mb-2" {...props}>
        {children}
      </h3>
    ),
    h4: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h4 className="text-base font-semibold leading-normal mt-6 mb-2" {...props}>
        {children}
      </h4>
    ),
    
    // Paragraphs with text processing
    p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
      const Processor = createTextProcessor('p');
      return <Processor className="my-5 leading-7" {...props}>{children}</Processor>;
    },
    
    // Lists
    ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
      <ul className="list-disc pl-6 my-5 space-y-2 [&_ul]:mt-3 [&_ul]:mb-3 [&_ol]:mt-3 [&_ol]:mb-3" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
      <ol className="list-decimal pl-6 my-5 space-y-2 [&_ul]:mt-3 [&_ul]:mb-3 [&_ol]:mt-3 [&_ol]:mb-3" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => {
      const Processor = createTextProcessor('li');
      return <Processor className="leading-7" {...props}>{children}</Processor>;
    },
    
    // Links
    a: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a 
        className="text-primary underline font-medium hover:text-primary-foreground transition-colors" 
        href={href} 
        {...props}
      >
        {children}
      </a>
    ),
    
    // Text formatting
    strong: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
      <strong className="font-semibold" {...props}>{children}</strong>
    ),
    em: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
      <em className="italic" {...props}>{children}</em>
    ),
    
    // Code
    code: ({ children, className, ...props }: React.HTMLAttributes<HTMLElement> & { className?: string }) => {
      // Check if this is inside a pre tag (code block)
      const isInline = !className?.includes('language-');
      
      if (isInline) {
        return (
          <code 
            className="text-sm font-semibold font-mono bg-black/5 px-1 py-0.5 rounded" 
            {...props}
          >
            {children}
          </code>
        );
      }
      
      // For code blocks, just render the code element without extra processing
      return <code className={className} {...props}>{children}</code>;
    },
    pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
      <pre 
        className="text-sm leading-relaxed my-7 rounded-md p-4 bg-black/5 overflow-x-auto [&_code]:bg-transparent [&_code]:p-0 [&_code]:font-normal [&_code]:text-inherit" 
        {...props}
      >
        {children}
      </pre>
    ),
    
    // Blockquotes
    blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
      <blockquote 
        className="font-medium italic border-l-4 border-border my-6 pl-4" 
        {...props}
      >
        {children}
      </blockquote>
    ),
    
    // Horizontal rules
    hr: ({ ...props }: React.HTMLAttributes<HTMLHRElement>) => (
      <hr className="border-border border-t my-12" {...props} />
    ),
  }), [createTextProcessor]);

  return (
    <div className="text-foreground max-w-[65ch] text-base leading-7 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {processedContent.text}
      </ReactMarkdown>
    </div>
  );
}