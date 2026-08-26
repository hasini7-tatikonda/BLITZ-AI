import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Settings, 
  Sun, 
  Moon, 
  PanelLeftClose, 
  PanelLeft, 
  Check, 
  X,
  Edit2
} from 'lucide-react';
import type { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onClearSessions: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onRenameSession,
  onClearSessions,
  theme,
  onToggleTheme,
  apiKey,
  onApiKeyChange,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const startEditing = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingId(session.id);
    setEditTitle(session.title);
  };

  const saveRename = (id: string, e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setIsEditingId(null);
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingId(null);
  };

  return (
    <>
      {/* Mobile absolute menu toggle */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-100 dark:bg-[#1a1c24] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all cursor-pointer shadow-sm md:flex"
          title="Open Sidebar"
        >
          <PanelLeft size={20} />
        </button>
      )}

      <div
        className={`fixed inset-y-0 left-0 z-40 flex flex-col w-72 bg-white dark:bg-[#0b0c10] border-r border-gray-200 dark:border-gray-900 transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 flex-shrink-0 h-screen`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-150 dark:border-gray-900">
          <div className="flex items-center gap-2.5">
            {/* BLITZLogo */}
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 text-white font-bold text-lg shadow-md shadow-amber-500/10">
              B
            </div>
            <div>
              <h1 className="font-semibold text-white leading-tight">BLITZ</h1>
              <span className="text-[10px] text-amber-600 dark:text-amber-500 font-medium uppercase tracking-wider">AI Chat</span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#151722] transition-colors cursor-pointer"
            title="Collapse Sidebar"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={onCreateSession}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-dashed border-amber-600/40 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 hover:text-white hover:bg-amber-600 dark:hover:bg-amber-600 font-medium transition-all duration-200 cursor-pointer group shadow-sm"
          >
            <Plus size={18} className="transition-transform group-hover:rotate-90" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400 dark:text-gray-500 italic">
              No conversations yet
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const isEditing = session.id === isEditingId;

              return (
                <div
                  key={session.id}
                  onClick={() => !isEditing && onSelectSession(session.id)}
                  className={`group relative flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-amber-50/50 dark:bg-amber-950/15 border-l-3 border-amber-500 text-amber-950 dark:text-amber-300 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#121319]'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <MessageSquare
                      size={16}
                      className={isActive ? 'text-amber-600 dark:text-amber-500' : 'text-gray-400 dark:text-gray-500'}
                    />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveRename(session.id, e)}
                        autoFocus
                        className="w-full text-sm bg-white dark:bg-[#1a1c26] border border-amber-500 rounded px-1.5 py-0.5 text-gray-800 dark:text-gray-150 outline-none"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="text-sm truncate select-none">{session.title}</span>
                    )}
                  </div>

                  {/* Actions */}
                  {!isEditing && (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 bg-gradient-to-l from-white via-white dark:from-[#0b0c10] dark:via-[#0b0c10] pl-4">
                      <button
                        onClick={(e) => startEditing(session, e)}
                        className="p-1 rounded text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-gray-100 dark:hover:bg-[#1a1c26] cursor-pointer"
                        title="Rename"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="p-1 rounded text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-[#1a1c26] cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}

                  {isEditing && (
                    <div className="flex items-center gap-0.5 pl-2 z-10 bg-white dark:bg-[#0b0c10]">
                      <button
                        onClick={(e) => saveRename(session.id, e)}
                        className="p-1 rounded text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 cursor-pointer"
                      >
                        <Check size={13} />
                      </button>
                      <button
                        onClick={cancelRename}
                        className="p-1 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-gray-150 dark:border-gray-900 space-y-2 bg-gray-50/50 dark:bg-[#08090d]">
          {sessions.length > 0 && (
            <button
              onClick={onClearSessions}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/10 transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Clear conversations</span>
            </button>
          )}

          <button
            onClick={onToggleTheme}
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#151722] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              {theme === 'light' ? <Sun size={16} /> : <Moon size={16} />}
              <span>{theme === 'light' ? 'Light theme' : 'Dark theme'}</span>
            </div>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest">
            {theme === 'light' ? 'DARK' : 'LIGHT'}</span>          
            </button>

          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#151722] transition-colors cursor-pointer"
          >
            <Settings size={16} />
            <span>Groq API Key Settings</span>
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#151720] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">API Configuration</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Groq API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => onApiKeyChange(e.target.value)}
                  placeholder="Paste your gsk_... key here"
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-[#1c1e2b] border border-gray-200 dark:border-gray-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-gray-900 dark:text-white outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600"
                />
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                The key is used directly in the browser via client-side fetch calls to connect to Groq. 
                If set, it will prioritize this custom key over the `.env` value.
                It is stored in memory and won't be sent to any third party except Groq itself.
              </p>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-amber-500/10 cursor-pointer"
                >
                  Save & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
