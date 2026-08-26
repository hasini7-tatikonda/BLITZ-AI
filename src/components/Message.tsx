import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Bot, User } from 'lucide-react';
import type { Message as MessageType } from '../types';

interface MessageProps {
  message: MessageType;
  isStreamingLast: boolean;
  onRegenerate: () => void;
}

export const Message: React.FC<MessageProps> = ({
  message,
  isStreamingLast,
  onRegenerate,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const copyResponse = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy response', err);
    }
  };

  return (
    <div
      className={`flex w-full gap-4 py-6 ${
        isUser
          ? 'justify-end'
          : 'justify-start border-b border-gray-100 dark:border-gray-900/40 bg-gray-50/30 dark:bg-[#0c0d12]/30'
      }`}
    >
      <div
        className={`flex w-full max-w-3xl gap-4 px-4 md:px-0 ${
          isUser ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        {/* Avatar with hover tooltip */}
        <div className="flex-shrink-0 relative group">
          {isUser ? (
            <div className="flex items-center justify-center w-8.5 h-8.5 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold border border-gray-300 dark:border-gray-700 shadow-xs cursor-default">
              <User size={16} />

              {/* User tooltip */}
              <span className="absolute z-50 top-1/2 -translate-y-1/2 right-full mr-2 px-2.5 py-1.5 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 pointer-events-none shadow-lg">
                You
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center w-8.5 h-8.5 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-white font-bold border border-amber-500/20 shadow-sm shadow-amber-500/10 cursor-default">
              <Bot size={16} />

              {/* AI tooltip */}
              <span className="absolute z-50 top-1/2 -translate-y-1/2 left-full ml-2 px-2.5 py-1.5 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 pointer-events-none shadow-lg">
                StudyMate AI
              </span>
            </div>
          )}
        </div>

        {/* Message Bubble/Content */}
        <div className={`flex-1 min-w-0 ${isUser ? 'flex justify-end' : ''}`}>
          {isUser ? (
            <div className="bg-amber-600 dark:bg-amber-600/90 text-white px-4 py-3 rounded-2xl rounded-tr-xs shadow-xs text-sm md:text-base leading-relaxed break-words max-w-[85%]">
              {message.content}
            </div>
          ) : (
            <div className="prose text-gray-800 dark:text-gray-200 w-full break-words">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');
                    const isInline = !match && !codeString.includes('\n');

                    return isInline ? (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    ) : (
                      <CodeBlock
                        language={match ? match[1] : 'code'}
                        code={codeString}
                      />
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>

              {/* Copy + Regenerate icon buttons */}
              {!isStreamingLast && (
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={copyResponse}
                    title={copied ? 'Copied!' : 'Copy response'}
                    aria-label={copied ? 'Copied!' : 'Copy response'}
                    className="flex items-center justify-center p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <Check size={15} />
                    ) : (
                      <Copy size={15} />
                    )}
                  </button>

                  <button
                    onClick={onRegenerate}
                    title="Regenerate"
                    aria-label="Regenerate"
                    className="flex items-center justify-center p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <span className="text-sm">🔄</span>
                  </button>
                </div>
              )}

              {/* Cursor Blinker when response is active streaming */}
              {isStreamingLast && (
                <span className="inline-block w-1.5 h-4 bg-amber-500 dark:bg-amber-400 ml-1 translate-y-0.5 animate-blink" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* CodeBlock sub-component for code highlighting with Copy Button */
interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-950 text-gray-100 shadow-md">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 text-[11px] font-mono text-gray-400 tracking-wider">
        <span className="uppercase">{language}</span>

        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1 hover:text-gray-200 transition-colors py-1 px-1.5 rounded-md hover:bg-gray-800 cursor-pointer"
          title="Copy code"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check size={12} className="text-green-500" />
              <span className="text-green-500 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="overflow-x-auto p-4 text-xs md:text-sm font-mono leading-relaxed bg-[#0c0d12]">
        <pre className="whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};