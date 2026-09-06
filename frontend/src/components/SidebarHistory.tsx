"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  MessageSquare,
  Trash2,
  PanelLeftClose,
  Pin,
  PinOff,
  Edit2,
  Check,
  X,
  CheckSquare,
  Square,
} from "lucide-react";
import { SessionItem } from "@/lib/api";
import { ThemeToggle } from "@/components/ThemeToggle";

interface SidebarHistoryProps {
  sessions: SessionItem[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChatClick: () => void;
  onDeleteSession: (id: string) => void;
  onBatchDelete: (ids: string[]) => void;
  onUpdateSession: (id: string, data: { title?: string; is_pinned?: boolean }) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const SidebarHistory: React.FC<SidebarHistoryProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChatClick,
  onDeleteSession,
  onBatchDelete,
  onUpdateSession,
  isOpen,
  onToggleOpen,
}) => {
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitleText, setEditTitleText] = useState("");

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === sessions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sessions.map((s) => s.id));
    }
  };

  const executeBatchDelete = () => {
    if (selectedIds.length === 0) return;
    onBatchDelete(selectedIds);
    setSelectedIds([]);
    setIsMultiSelectMode(false);
  };

  const startRenaming = (session: SessionItem) => {
    setEditingId(session.id);
    setEditTitleText(session.title);
  };

  const saveRenaming = (id: string) => {
    if (editTitleText.trim()) {
      onUpdateSession(id, { title: editTitleText.trim() });
    }
    setEditingId(null);
  };

  const pinnedSessions = sessions.filter((s) => s.is_pinned);
  const recentSessions = sessions.filter((s) => !s.is_pinned);

  return (
    <aside className="w-[280px] h-screen bg-[#f7f7f8] dark:bg-[#131415] border-r border-[#e5e5e7] dark:border-[#222325] flex flex-col justify-between overflow-hidden shrink-0 select-none z-30 font-mono">
      <div className="p-3.5 flex flex-col h-full">
        {/* Header */}
        <div className="space-y-3 pb-3">
          <div className="flex items-center justify-between px-1">
            <span className="font-bold text-[16px] tracking-wider text-[#18181b] dark:text-[#ffffff] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4d6bfe]"></span>
              ZENVOR AI
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setIsMultiSelectMode(!isMultiSelectMode);
                  setSelectedIds([]);
                }}
                className="text-[11px] text-[#71717a] dark:text-[#9b9da1] hover:text-[#18181b] dark:hover:text-[#ffffff] px-1.5 py-0.5 rounded transition-colors"
              >
                {isMultiSelectMode ? "Done" : "Select"}
              </button>
              <button
                onClick={onToggleOpen}
                className="p-1 rounded text-[#71717a] dark:text-[#9b9da1] hover:text-[#18181b] dark:hover:text-[#ffffff] transition-colors"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onNewChatClick}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#ffffff] dark:bg-[#222325] hover:bg-[#ebebee] dark:hover:bg-[#2b2d30] border border-[#e5e5e7] dark:border-[#28292d] text-[#18181b] dark:text-[#ffffff] font-medium text-xs shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4 text-[#4d6bfe]" />
            <span>New chat</span>
          </motion.button>
        </div>

        {/* Multi-Select Bar */}
        {isMultiSelectMode && (
          <div className="flex items-center justify-between py-2 px-1 border-b border-[#e5e5e7] dark:border-[#28292d] text-xs">
            <button onClick={handleSelectAll} className="text-[#71717a] dark:text-[#9b9da1] hover:underline">
              {selectedIds.length === sessions.length ? "Deselect All" : "Select All"}
            </button>
            <button
              onClick={executeBatchDelete}
              disabled={selectedIds.length === 0}
              className="text-rose-500 hover:text-rose-400 disabled:opacity-40 font-medium"
            >
              Delete ({selectedIds.length})
            </button>
          </div>
        )}

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto py-2 space-y-4 pr-1">
          {pinnedSessions.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-semibold text-[#71717a] dark:text-[#9b9da1] uppercase px-2 mb-1 tracking-wider flex items-center gap-1">
                <Pin className="w-2.5 h-2.5" /> Pinned
              </div>
              <AnimatePresence initial={false}>
                {pinnedSessions.map((s) => renderSessionItem(s))}
              </AnimatePresence>
            </div>
          )}

          <div className="space-y-1">
            {pinnedSessions.length > 0 && (
              <div className="text-[10px] font-semibold text-[#71717a] dark:text-[#9b9da1] uppercase px-2 mb-1 tracking-wider">
                Recent
              </div>
            )}
            {recentSessions.length === 0 && pinnedSessions.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-[#a1a1aa] dark:text-[#6e7078]">
                No conversations yet
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {recentSessions.map((s) => renderSessionItem(s))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#e5e5e7] dark:border-[#222325] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-[#71717a] dark:text-[#9b9da1]">Local Hub</span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );

  function renderSessionItem(s: SessionItem) {
    const isActive = s.id === activeSessionId;
    const isEditing = editingId === s.id;
    const isSelected = selectedIds.includes(s.id);

    return (
      <motion.div
        key={s.id}
        layout
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -8 }}
        transition={{ duration: 0.18 }}
        className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
          isActive
            ? "bg-[#ebecee] dark:bg-[#222325] text-[#18181b] dark:text-[#ffffff] font-medium shadow-sm border border-[#d4d4d8]/40 dark:border-[#33353a]/60"
            : "text-[#71717a] dark:text-[#9b9da1] hover:bg-[#f0f0f2] dark:hover:bg-[#1a1b1d] hover:text-[#18181b] dark:hover:text-[#ffffff]"
        }`}
        onClick={() => {
          if (isMultiSelectMode) {
            handleToggleSelect(s.id);
          } else {
            onSelectSession(s.id);
          }
        }}
      >
        {isActive && (
          <motion.span
            layoutId="active-session-bar"
            className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-full bg-[#4d6bfe]"
            transition={{ duration: 0.2 }}
          />
        )}
        {isMultiSelectMode && (
          <div className="mr-2 text-[#4d6bfe]">
            {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5 text-[#71717a]" />}
          </div>
        )}

        {isEditing ? (
          <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={editTitleText}
              onChange={(e) => setEditTitleText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveRenaming(s.id)}
              className="w-full bg-[#ffffff] dark:bg-[#131415] border border-[#4d6bfe] rounded px-1.5 py-0.5 text-xs text-[#18181b] dark:text-white outline-none"
              autoFocus
            />
            <button onClick={() => saveRenaming(s.id)} className="text-emerald-500 p-0.5">
              <Check className="w-3 h-3" />
            </button>
            <button onClick={() => setEditingId(null)} className="text-[#71717a] p-0.5">
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <>
            {/* Full title visible with line-clamp/ellipsis and hover tooltip */}
            <div className="flex items-center gap-2.5 overflow-hidden pr-2 flex-1">
              <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70 text-[#4d6bfe]" />
              <span className="truncate flex-1 tracking-normal" title={s.title}>
                {s.title}
              </span>
            </div>

            {!isMultiSelectMode && (
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity bg-gradient-to-l from-[#f7f7f8] dark:from-[#131415] pl-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateSession(s.id, { is_pinned: !s.is_pinned });
                  }}
                  className="p-1 hover:text-[#4d6bfe] rounded hover:bg-black/5 dark:hover:bg-white/5"
                  title={s.is_pinned ? "Unpin" : "Pin"}
                >
                  {s.is_pinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startRenaming(s);
                  }}
                  className="p-1 hover:text-[#4d6bfe] rounded hover:bg-black/5 dark:hover:bg-white/5"
                  title="Rename"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(s.id);
                  }}
                  className="p-1 hover:text-rose-500 rounded hover:bg-black/5 dark:hover:bg-white/5"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </>
        )}
      </motion.div>
    );
  }
};