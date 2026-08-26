import { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { ChatInput } from './components/ChatInput';
import type { ChatSession, Message } from './types';
import { Bot, AlertCircle, KeyRound } from 'lucide-react';

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('chakravyuha_sessions');

    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    return localStorage.getItem('chakravyuha_active_id');
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('chakravyuha_theme');

    if (saved === 'light' || saved === 'dark') {
      return saved;
    }

    return 'dark';
  });

  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('chakravyuha_groq_key') || '';
  });

  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const envApiKey = import.meta.env.VITE_GROQ_API_KEY || '';

  const activeSession =
    sessions.find(session => session.id === activeSessionId) || null;

  useEffect(() => {
    localStorage.setItem(
      'chakravyuha_sessions',
      JSON.stringify(sessions)
    );
  }, [sessions]);

  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem(
        'chakravyuha_active_id',
        activeSessionId
      );
    } else {
      localStorage.removeItem('chakravyuha_active_id');
    }
  }, [activeSessionId]);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem(
      'chakravyuha_theme',
      theme
    );
  }, [theme]);

  const toggleTheme = () => {
    setTheme(previous =>
      previous === 'light' ? 'dark' : 'light'
    );
  };

  const handleApiKeyChange = (newKey: string) => {
    setApiKey(newKey);

    localStorage.setItem(
      'chakravyuha_groq_key',
      newKey
    );

    if (newKey.trim()) {
      setErrorMsg(null);
    }
  };

  const createSession = () => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now(),
    };

    setSessions(previous => [
      newSession,
      ...previous,
    ]);

    setActiveSessionId(newSession.id);
    setErrorMsg(null);
  };

  const deleteSession = (id: string) => {
    setSessions(previous => {
      const remaining = previous.filter(
        session => session.id !== id
      );

      if (activeSessionId === id) {
        setActiveSessionId(
          remaining.length > 0
            ? remaining[0].id
            : null
        );
      }

      return remaining;
    });

    setErrorMsg(null);
  };

  const renameSession = (
    id: string,
    newTitle: string
  ) => {
    setSessions(previous =>
      previous.map(session =>
        session.id === id
          ? {
              ...session,
              title: newTitle,
            }
          : session
      )
    );
  };

  const clearSessions = () => {
    if (
      window.confirm(
        'Are you sure you want to delete all conversations?'
      )
    ) {
      setSessions([]);
      setActiveSessionId(null);
      setErrorMsg(null);
    }
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setIsStreaming(false);
  };

  const handleApiError = (error: unknown) => {
    console.error('Groq API Error:', error);

    const message =
      error instanceof Error
        ? error.message
        : String(error);

    const lowerMessage =
      message.toLowerCase();

    if (
      lowerMessage.includes('invalid_api_key') ||
      lowerMessage.includes('invalid api key')
    ) {
      setErrorMsg(
        'Invalid API key. Please check your Groq API key in Settings.'
      );
      return;
    }

    if (
      lowerMessage.includes('model_not_found') ||
      lowerMessage.includes('does not exist') ||
      lowerMessage.includes('do not have access')
    ) {
      setErrorMsg(
        'The selected AI model is unavailable. Please check the model configuration.'
      );
      return;
    }

    if (
      lowerMessage.includes('401') ||
      lowerMessage.includes('authentication')
    ) {
      setErrorMsg(
        'Authentication failed. Please check your Groq API key.'
      );
      return;
    }

    if (lowerMessage.includes('403')) {
      setErrorMsg(
        'Access denied. Please check your Groq API key permissions.'
      );
      return;
    }

    if (
      lowerMessage.includes('429') ||
      lowerMessage.includes('rate limit')
    ) {
      setErrorMsg(
        'Too many requests. Please wait a moment and try again.'
      );
      return;
    }

    if (
      lowerMessage.includes('failed to fetch') ||
      lowerMessage.includes('networkerror')
    ) {
      setErrorMsg(
        'Unable to connect to the AI service. Please check your internet connection.'
      );
      return;
    }

    if (lowerMessage.includes('500')) {
      setErrorMsg(
        'The AI service is temporarily unavailable. Please try again later.'
      );
      return;
    }

    setErrorMsg(
      'Something went wrong while contacting the AI. Please try again.'
    );
  };

  const handleSendMessage = async (
    content: string,
    regenerate = false
  ) => {
    const cleanContent = content.trim();

    if (!cleanContent) {
      return;
    }

    const resolvedKey =
      apiKey.trim() ||
      envApiKey.trim();

    if (!resolvedKey) {
      setErrorMsg(
        'Groq API Key missing. Please click the Settings gear icon in the sidebar to enter your key.'
      );
      return;
    }

    setErrorMsg(null);

    let currentSessionId =
      activeSessionId;

    let currentSession =
      activeSession;

    /*
     * Create a session automatically
     * if there is no active conversation.
     */
    if (
      !currentSessionId ||
      !currentSession
    ) {
      const newSessionId =
        crypto.randomUUID();

      const newSession: ChatSession = {
        id: newSessionId,
        title:
          cleanContent.length > 35
            ? cleanContent.slice(0, 35) + '...'
            : cleanContent,
        messages: [],
        createdAt: Date.now(),
      };

      setSessions(previous => [
        newSession,
        ...previous,
      ]);

      setActiveSessionId(
        newSessionId
      );

      currentSessionId =
        newSessionId;

      currentSession =
        newSession;
    }

    /*
     * Find the existing user message
     * when regenerating.
     */
    if (
      regenerate &&
      currentSession
    ) {
      const messages =
        currentSession.messages;

      const lastUserIndex =
        [...messages]
          .map((message, index) => ({
            message,
            index,
          }))
          .reverse()
          .find(
            item =>
              item.message.role ===
              'user'
          )?.index;

      if (
        lastUserIndex !== undefined
      ) {
        const lastUserMessage =
          messages[lastUserIndex];

        content =
          lastUserMessage.content;

        const messagesWithoutOldAssistant =
          messages.slice(
            0,
            lastUserIndex + 1
          );

        currentSession = {
          ...currentSession,
          messages:
            messagesWithoutOldAssistant,
        };

        setSessions(previous =>
          previous.map(session =>
            session.id ===
            currentSessionId
              ? {
                  ...session,
                  messages:
                    messagesWithoutOldAssistant,
                }
              : session
          )
        );
      }
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: cleanContent,
      timestamp: Date.now(),
    };

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    /*
     * Build the history BEFORE changing
     * the React state.
     */
    const previousMessages =
      currentSession.messages;

    let history;

    if (regenerate) {
      history =
        previousMessages.map(message => ({
          role: message.role,
          content: message.content,
        }));
    } else {
      history = [
        ...previousMessages.map(
          message => ({
            role: message.role,
            content: message.content,
          })
        ),
        {
          role: 'user' as const,
          content: cleanContent,
        },
      ];
    }

    /*
     * Add messages to the UI.
     */
    if (!regenerate) {
      setSessions(previous =>
        previous.map(session => {
          if (
            session.id !==
            currentSessionId
          ) {
            return session;
          }

          const title =
            session.messages.length === 0
              ? cleanContent.length > 35
                ? cleanContent.slice(
                    0,
                    35
                  ) + '...'
                : cleanContent
              : session.title;

          return {
            ...session,
            title,
            messages: [
              ...session.messages,
              userMessage,
              assistantMessage,
            ],
          };
        })
      );
    } else {
      setSessions(previous =>
        previous.map(session =>
          session.id ===
          currentSessionId
            ? {
                ...session,
                messages: [
                  ...session.messages,
                  assistantMessage,
                ],
              }
            : session
        )
      );
    }

    setIsStreaming(true);

    const abortController =
      new AbortController();

    abortControllerRef.current =
      abortController;

    try {
      const response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',

          headers: {
            Authorization:
              'Bearer ' + resolvedKey,
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            model:
              'openai/gpt-oss-120b',
            messages: history,
            stream: true,
          }),

          signal:
            abortController.signal,
        }
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        let readableError =
          errorText;

        try {
          const parsed =
            JSON.parse(errorText);

          readableError =
            parsed?.error?.message ||
            errorText;
        } catch {
          // Keep original error text
        }

        throw new Error(
          readableError ||
            'API request failed with status ' +
              response.status
        );
      }

      const reader =
        response.body?.getReader();

      if (!reader) {
        throw new Error(
          'Response stream reader unavailable.'
        );
      }

      const decoder =
        new TextDecoder('utf-8');

      let accumulatedContent =
        '';

      let buffer = '';

      let streamFinished =
        false;

      while (!streamFinished) {
        const result =
          await reader.read();

        if (result.done) {
          break;
        }

        if (!result.value) {
          continue;
        }

        buffer +=
          decoder.decode(
            result.value,
            {
              stream: true,
            }
          );

        const lines =
          buffer.split('\n');

        buffer =
          lines.pop() || '';

        for (const line of lines) {
          const cleaned =
            line.trim();

          if (!cleaned) {
            continue;
          }

          if (
            cleaned ===
            'data: [DONE]'
          ) {
            streamFinished =
              true;
            break;
          }

          if (
            !cleaned.startsWith(
              'data: '
            )
          ) {
            continue;
          }

          try {
            const parsed =
              JSON.parse(
                cleaned.slice(6)
              );

            const token =
              parsed?.choices?.[0]
                ?.delta?.content || '';

            if (!token) {
              continue;
            }

            accumulatedContent +=
              token;

            setSessions(previous =>
              previous.map(session => {
                if (
                  session.id !==
                  currentSessionId
                ) {
                  return session;
                }

                return {
                  ...session,
                  messages:
                    session.messages.map(
                      message =>
                        message.id ===
                        assistantMessage.id
                          ? {
                              ...message,
                              content:
                                accumulatedContent,
                            }
                          : message
                    ),
                };
              })
            );
          } catch {
            // Ignore incomplete JSON chunks
          }
        }
      }

      /*
       * Process any remaining complete
       * data in the buffer.
       */
      const remaining =
        buffer.trim();

      if (
        remaining.startsWith(
          'data: '
        ) &&
        remaining !==
          'data: [DONE]'
      ) {
        try {
          const parsed =
            JSON.parse(
              remaining.slice(6)
            );

          const token =
            parsed?.choices?.[0]
              ?.delta?.content || '';

          if (token) {
            accumulatedContent +=
              token;

            setSessions(previous =>
              previous.map(session => {
                if (
                  session.id !==
                  currentSessionId
                ) {
                  return session;
                }

                return {
                  ...session,
                  messages:
                    session.messages.map(
                      message =>
                        message.id ===
                        assistantMessage.id
                          ? {
                              ...message,
                              content:
                                accumulatedContent,
                            }
                          : message
                    ),
                };
              })
            );
          }
        } catch {
          // Ignore incomplete final data
        }
      }
    } catch (error: unknown) {
      if (
        error instanceof DOMException &&
        error.name === 'AbortError'
      ) {
        console.log(
          'AI response stopped.'
        );
      } else {
        handleApiError(error);
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current =
        null;
    }
  };

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-white dark:bg-[#07080b] text-gray-800 dark:text-gray-200">

      <Sidebar
        sessions={sessions}
        activeSessionId={
          activeSessionId
        }
        onSelectSession={
          setActiveSessionId
        }
        onCreateSession={
          createSession
        }
        onDeleteSession={
          deleteSession
        }
        onRenameSession={
          renameSession
        }
        onClearSessions={
          clearSessions
        }
        theme={theme}
        onToggleTheme={
          toggleTheme
        }
        apiKey={apiKey}
        onApiKeyChange={
          handleApiKeyChange
        }
      />

      <div className="flex-1 flex flex-col h-full relative min-w-0">

        <header className="flex items-center justify-between px-4 py-3 border-b border-gray-150 dark:border-gray-900 bg-white/70 dark:bg-[#07080b]/70 backdrop-blur-md z-10 flex-shrink-0">

          <div className="flex items-center gap-2">

            <div className="md:hidden w-8 h-8" />

            <div className="flex items-center gap-1.5 font-semibold text-gray-800 dark:text-gray-100">

              <Bot
                size={18}
                className="text-amber-500"
              />

              <span>
                GPT-OSS-120B
              </span>

            </div>

          </div>

          <div className="flex items-center gap-2">

            {activeSession && (
              <button
                onClick={
                  createSession
                }
                className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-[#121319] text-gray-600 dark:text-gray-300 font-medium transition-colors cursor-pointer"
              >
                New Chat
              </button>
            )}

          </div>

        </header>

        {!apiKey &&
          !envApiKey && (
            <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-800 dark:text-amber-400 px-4 py-3 flex items-center gap-3 text-xs md:text-sm">

              <KeyRound
                className="flex-shrink-0"
                size={18}
              />

              <div className="flex-1">

                <span>
                  <strong>
                    API Key Required:
                  </strong>{' '}
                  Enter your Groq API key
                  using the Settings icon
                  in the sidebar.
                </span>

              </div>

            </div>
          )}

        {errorMsg && (
          <div className="bg-red-500/15 border-b border-red-500/20 text-red-800 dark:text-red-400 px-4 py-3 flex items-center gap-3 text-xs md:text-sm">

            <AlertCircle
              className="flex-shrink-0"
              size={18}
            />

            <div className="flex-1 break-words">
              {errorMsg}
            </div>

          </div>
        )}

        <ChatArea
          messages={
            activeSession
              ? activeSession.messages
              : []
          }
          isStreaming={
            isStreaming
          }
          onSelectStarterPrompt={
            handleSendMessage
          }
          onRegenerate={() => {
            const messages =
              activeSession?.messages ||
              [];

            const lastUserMessage =
              [...messages]
                .reverse()
                .find(
                  message =>
                    message.role ===
                    'user'
                );

            if (lastUserMessage) {
              handleSendMessage(
                lastUserMessage.content,
                true
              );
            }
          }}
        />

        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-[#07080b] dark:via-[#07080b]/95 dark:to-transparent pt-8 pb-4 flex-shrink-0 z-10">

          <ChatInput
            onSendMessage={
              handleSendMessage
            }
            isStreaming={
              isStreaming
            }
            onStopStreaming={
              handleStopStreaming
            }
            disabled={
              !apiKey &&
              !envApiKey
            }
          />

          <div className="text-center mt-2.5 text-[10px] md:text-xs text-gray-400 dark:text-gray-600">
            Powered by Groq. Responses
            are generated by AI.
          </div>

        </div>

      </div>

    </div>
  );
}