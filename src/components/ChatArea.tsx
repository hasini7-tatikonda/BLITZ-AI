import React, { useRef, useEffect } from 'react';
import { Bot, Compass, Code, Lightbulb, GraduationCap } from 'lucide-react';
import type { Message as MessageType } from '../types';
import { Message } from './Message';

interface ChatAreaProps {
  messages: MessageType[];
  isStreaming: boolean;
  onSelectStarterPrompt: (prompt: string) => void;
    onRegenerate: () => void;

}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isStreaming,
  onSelectStarterPrompt,
    onRegenerate,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  const starterPrompts = [
    {
      text: "Explain the mathematical pattern in the Chakravyuha formation.",
      icon: <Compass className="text-amber-500" size={18} />,
    },
    {
      text: "Write a React hook to manage local storage with a usage table.",
      icon: <Code className="text-amber-500" size={18} />,
    },
    {
      text: "Give me 5 productivity hacks to stay organized this college semester.",
      icon: <GraduationCap className="text-amber-500" size={18} />,
    },
    {
      text: "Draft a creative mystery riddle about a lock and a key.",
      icon: <Lightbulb className="text-amber-500" size={18} />,
    },
  ];

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/20 dark:bg-[#07080b] h-full">
      {messages.length === 0 ? (
        /* Welcome Dashboard Screen */
        <div className="flex flex-col items-center justify-center min-h-full max-w-3xl mx-auto px-6 py-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Decorative Logo Icon */}
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-3xl bg-amber-500/10 blur-xl"></div>
            <div className="relative flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-600 to-amber-400 text-white shadow-xl shadow-amber-500/20">
              <Bot size={36} />
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white tracking-tight mb-2">
            How can I help you today?
          </h2>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-md mb-10">
            Ask about college advice, system designs, puzzles, or coding challenges. Connection directly to Groq LLama-3.
          </p>

          {/* Starter Prompt Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-left">
            {starterPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => onSelectStarterPrompt(prompt.text)}
                className="flex items-start gap-3.5 p-4 rounded-2xl border border-gray-150 dark:border-gray-800 bg-white dark:bg-[#0c0d12] hover:border-amber-500/40 dark:hover:border-amber-500/30 hover:bg-amber-50/10 dark:hover:bg-amber-950/5 transition-all duration-200 cursor-pointer shadow-xs group"
              >
                <div className="flex-shrink-0 p-2 rounded-xl bg-gray-50 dark:bg-[#151720] group-hover:bg-amber-100/50 dark:group-hover:bg-amber-950/20 transition-colors">
                  {prompt.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-snug break-words">
                    {prompt.text}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Chat Feed list */
        <div className="flex flex-col min-h-full">
          {messages.map((msg, index) => (
            <Message
              key={msg.id}
              message={msg}
              isStreamingLast={isStreaming && index === messages.length - 1 && msg.role === 'assistant'}
                onRegenerate={onRegenerate}
            />
          ))}
          <div ref={bottomRef} className="h-28 flex-shrink-0" />
        </div>
      )}
    </div>
  );
};
