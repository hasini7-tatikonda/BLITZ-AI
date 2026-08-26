import React, { useRef, useEffect, useState } from 'react';
import { Send, Square, Mic, MicOff } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  disabled: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isStreaming,
  onStopStreaming,
  disabled,
}) => {
  const [value, setValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (value.trim() && !disabled && !isStreaming) {
      // If we are currently listening to voice, stop it first
      if (isListening) {
        stopListening();
      }
      onSendMessage(value.trim());
      setValue('');
    }
  };

  // Adjust height automatically
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [value]);

  // Clean up speech recognition on component unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please try using Chrome, Edge or Safari.");
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Stop listening automatically after a pause in speech
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    const baseText = value;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      // Concatenate the transcripts to the existing text box value
      const transcript = finalTranscript || interimTranscript;
      const spacing = baseText && transcript ? ' ' : '';
      setValue(baseText + spacing + transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  return (
    <div className="relative flex items-end gap-2 w-full max-w-3xl mx-auto px-4 md:px-0">
      <div className="relative flex-1 flex items-end rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121319] hover:border-gray-300 dark:hover:border-gray-700 shadow-sm focus-within:border-amber-500/80 focus-within:ring-1 focus-within:ring-amber-500/50 transition-all px-4 py-2.5 min-h-[52px]">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a message..."
          disabled={disabled && !isStreaming}
          className="flex-1 w-full bg-transparent resize-none outline-none border-none text-gray-800 dark:text-gray-100 text-sm md:text-base max-h-[200px] py-1.5 focus:ring-0 leading-relaxed pr-24"
          style={{ height: 'auto' }}
        />

        {/* Input Controls */}
        <div className="absolute right-3.5 bottom-2.5 flex items-center gap-2">
          {/* Microphone speech-to-text button */}
          <button
            type="button"
            onClick={startListening}
            disabled={disabled && !isListening}
            className={`flex items-center justify-center p-2 rounded-xl transition-all duration-200 shadow-sm ${
              isListening
                ? 'bg-red-500/10 dark:bg-red-500/20 text-red-500 border border-red-500/30 animate-pulse cursor-pointer'
                : 'text-gray-400 dark:text-gray-500 hover:text-amber-600 dark:hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-[#1a1c26] cursor-pointer'
            }`}
            title={isListening ? "Stop listening" : "Dictate (Speech to Text)"}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>

          {isStreaming ? (
            <button
              type="button"
              onClick={onStopStreaming}
              className="flex items-center justify-center p-2 rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-950 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm cursor-pointer"
              title="Stop generating"
            >
              <Square size={16} fill="currentColor" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!value.trim() || disabled}
              className={`flex items-center justify-center p-2 rounded-xl transition-all duration-200 shadow-sm ${
                value.trim() && !disabled
                  ? 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-amber-600/10'
                  : 'bg-gray-100 dark:bg-[#1b1c25] text-gray-400 dark:text-gray-600 cursor-not-allowed'
              }`}
              title="Send message"
            >
              <Send size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
