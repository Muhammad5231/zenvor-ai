"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Copy,
  Check,
  Pencil,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
  Send,
} from "lucide-react";
import { CodeBlock } from "./CodeBlock";
import { ThinkingBlock } from "./ThinkingBlock";
import { useAutoResizeTextarea } from "@/hooks/useAutoResizeTextarea";

export interface TurnVersion {
  prompt: string;
  response: string;
  thinking?: string | null;
  sources?: string | null;
}

export interface ChatTurnItem {
  id: string;
  versions: TurnVersion[];
  currentIndex: number;
}

interface ChatTurnProps {
  turn: ChatTurnItem;
  turnIndex: number;
  onEditPrompt: (turnIndex: number, newPrompt: string) => void;
  onNavigateVersion: (turnIndex: number, newVersionIndex: number) => void;
  onRegenerate: (turnIndex: number) => void;
  isStreaming: boolean;
  isLastTurn: boolean;
}

export const ChatTurnBubble: React.FC<ChatTurnProps> = ({
  turn,
  turnIndex,
  onEditPrompt,
  onNavigateVersion,
  onRegenerate,
  isStreaming,
  isLastTurn,
}) => {
  const currentVersion = turn.versions[turn.currentIndex] || turn.versions[0];
  const totalVersions = turn.versions.length;
  const currentVersionNum = turn.currentIndex + 1;

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(currentVersion.prompt);
  const [promptCopied, setPromptCopied] = useState(false);
  const [responseCopied, setResponseCopied] = useState(false);
  const editTextareaRef = useAutoResizeTextarea<HTMLTextAreaElement>(editText, {
    minHeight: 60,
    maxHeight: 320,
  });

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(currentVersion.prompt);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(currentVersion.response);
    setResponseCopied(true);
    setTimeout(() => setResponseCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6 max-w-3xl mx-auto w-full"
    >
      {/* User Bubble */}
      <div className="flex flex-col items-end group">
        <div className="max-w-[85%] w-full">
          {isEditing ? (
            <div className="p-3 bg-[#f2f3f5] dark:bg-[#26272b] border border-[#d4d4d8] dark:border-[#3b3d42] rounded-2xl shadow-md space-y-2.5">
              <textarea
                ref={editTextareaRef}
                rows={1}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full bg-transparent resize-none border-0 outline-none ring-0 shadow-none leading-relaxed text-[#18181b] dark:text-[#ffffff] placeholder-[#8e9096] zv-scalable-text"
                autoFocus
              />
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e5e5e7] dark:border-[#33353a]">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium text-[#71717a] dark:text-[#9b9da1] hover:bg-[#e5e5e7] dark:hover:bg-[#33353a]"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    onEditPrompt(turnIndex, editText);
                  }}
                  disabled={!editText.trim() || isStreaming}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-[#4d6bfe] hover:bg-[#3f5be0] text-white disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" /> Submit
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-end">
              <div className="bg-[#f2f3f5] dark:bg-[#26272b] text-[#18181b] dark:text-[#ffffff] px-4 py-3 rounded-2xl rounded-tr-none leading-relaxed shadow-sm whitespace-pre-wrap zv-scalable-text">
                {currentVersion.prompt}
              </div>

              {/* Version Controls < 1 / 2 > */}
              <div className="flex items-center gap-2 mt-1.5 px-1 opacity-70 group-hover:opacity-100 transition-opacity text-xs text-[#71717a] dark:text-[#9b9da1]">
                {totalVersions > 1 && (
                  <div className="flex items-center gap-1 bg-[#e5e5e7] dark:bg-[#212224] px-2 py-0.5 rounded-md text-[11px] font-mono text-[#18181b] dark:text-[#ffffff]">
                    <button
                      onClick={() => onNavigateVersion(turnIndex, turn.currentIndex - 1)}
                      disabled={turn.currentIndex === 0 || isStreaming}
                      className="hover:text-[#4d6bfe] disabled:opacity-30 p-0.5"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <span>
                      {currentVersionNum} / {totalVersions}
                    </span>
                    <button
                      onClick={() => onNavigateVersion(turnIndex, turn.currentIndex + 1)}
                      disabled={turn.currentIndex === totalVersions - 1 || isStreaming}
                      className="hover:text-[#4d6bfe] disabled:opacity-30 p-0.5"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <button onClick={handleCopyPrompt} className="p-1 hover:text-[#18181b] dark:hover:text-[#ffffff]">
                  {promptCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => {
                    setEditText(currentVersion.prompt);
                    setIsEditing(true);
                  }}
                  disabled={isStreaming}
                  className="p-1 hover:text-[#18181b] dark:hover:text-[#ffffff] disabled:opacity-30"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Response: Directly on canvas without container box */}
      {(currentVersion.response || (isStreaming && isLastTurn)) && (
        <div className="space-y-2 group">
          <ThinkingBlock
            thinking={currentVersion.thinking}
            sources={currentVersion.sources}
            isStreaming={isStreaming && isLastTurn}
          />

          <div className="leading-relaxed text-[#18181b] dark:text-[#d1d2d6] zv-scalable-text">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <CodeBlock language={match[1]} value={String(children).replace(/\n$/, "")} />
                  ) : !inline && String(children).includes("\n") ? (
                    <CodeBlock language="text" value={String(children).replace(/\n$/, "")} />
                  ) : (
                    <code
                      className="px-1.5 py-0.5 mx-0.5 rounded bg-[#f2f3f5] dark:bg-[#26272b] text-[#18181b] dark:text-[#e3e4e8] font-mono text-[13px] border border-[#e5e5e7] dark:border-[#33353a]"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                table: ({ children }) => (
                  <div className="overflow-x-auto my-3 rounded-lg border border-[#e5e5e7] dark:border-[#28292d]">
                    <table className="w-full text-left border-collapse text-[13.5px]">{children}</table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-[#f2f3f5] dark:bg-[#202124] text-[#18181b] dark:text-[#ffffff] font-semibold border-b border-[#e5e5e7] dark:border-[#28292d]">
                    {children}
                  </thead>
                ),
                th: ({ children }) => <th className="p-2.5 font-medium">{children}</th>,
                td: ({ children }) => <td className="p-2.5 border-b border-[#e5e5e7] dark:border-[#28292d]">{children}</td>,
                h1: ({ children }) => <h1 className="text-xl font-bold text-[#18181b] dark:text-[#ffffff] mt-6 mb-3">{children}</h1>,
                h2: ({ children }) => <h2 className="text-[18px] font-bold text-[#18181b] dark:text-[#ffffff] mt-5 mb-2.5">{children}</h2>,
                h3: ({ children }) => <h3 className="text-[16px] font-semibold text-[#18181b] dark:text-[#ffffff] mt-4 mb-2">{children}</h3>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-[#4d6bfe] pl-3.5 my-2.5 text-[#71717a] dark:text-[#9b9da1] italic">
                    {children}
                  </blockquote>
                ),
                ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2 pl-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2 pl-1">{children}</ol>,
                li: ({ children }) => <li className="text-[#18181b] dark:text-[#d1d2d6] leading-relaxed">{children}</li>,
                p: ({ children }) => <p className="leading-relaxed my-2">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-[#18181b] dark:text-[#ffffff]">{children}</strong>,
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#4d6bfe] hover:underline">
                    {children}
                  </a>
                ),
              }}
            >
              {currentVersion.response}
            </ReactMarkdown>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopyResponse}
              className="p-1.5 rounded-lg text-[#71717a] dark:text-[#9b9da1] hover:text-[#18181b] dark:hover:text-[#ffffff] hover:bg-[#f2f3f5] dark:hover:bg-[#26272b] transition-colors"
              title="Copy response"
            >
              {responseCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => onRegenerate(turnIndex)}
              disabled={isStreaming}
              className="p-1.5 rounded-lg text-[#71717a] dark:text-[#9b9da1] hover:text-[#18181b] dark:hover:text-[#ffffff] hover:bg-[#f2f3f5] dark:hover:bg-[#26272b] transition-colors disabled:opacity-40"
              title="Try Again"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};