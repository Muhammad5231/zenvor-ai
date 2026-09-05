"use client";

import React, { useState } from "react";
import { ChevronDown, Globe, ExternalLink, Compass } from "lucide-react";

interface ThinkingBlockProps {
  thinking?: string | null;
  sources?: string | null;
  isStreaming?: boolean;
}

export const ThinkingBlock: React.FC<ThinkingBlockProps> = ({ thinking, sources, isStreaming }) => {
  const [isOpen, setIsOpen] = useState(false);

  const parsedSources = React.useMemo(() => {
    if (!sources) return [];
    try {
      return JSON.parse(sources);
    } catch {
      return [];
    }
  }, [sources]);

  if (!thinking && parsedSources.length === 0 && !isStreaming) return null;

  return (
    <div className="my-2 space-y-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-xs text-[#71717a] dark:text-[#9b9da1] hover:text-[#18181b] dark:hover:text-[#ffffff] transition-colors"
      >
        <Compass className={`w-3.5 h-3.5 text-[#4d6bfe] ${isStreaming ? "animate-spin" : ""}`} />
        <span className="font-medium">
          {isStreaming ? "Thinking..." : "Thought process"}
        </span>
        {parsedSources.length > 0 && (
          <span className="text-[11px] text-[#4d6bfe]">
            ({parsedSources.length} sources)
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="p-3 rounded-xl bg-[#f2f3f5] dark:bg-[#1e1f22] border border-[#e5e5e7] dark:border-[#28292d] text-xs space-y-2.5">
          {parsedSources.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 font-semibold text-[#4d6bfe] uppercase text-[10px]">
                <Globe className="w-3 h-3" />
                <span>Web Sources</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {parsedSources.map((src: any, i: number) => (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-[#ffffff] dark:bg-[#26272b] border border-[#e5e5e7] dark:border-[#33353a] hover:border-[#4d6bfe] transition-colors"
                  >
                    <span className="truncate text-[11px] text-[#18181b] dark:text-[#d1d2d6]">{src.title}</span>
                    <ExternalLink className="w-3 h-3 shrink-0 text-[#71717a]" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {thinking && (
            <div className="pt-2 border-t border-[#e5e5e7] dark:border-[#28292d] font-mono text-[12px] text-[#71717a] dark:text-[#9b9da1] whitespace-pre-wrap leading-relaxed">
              {thinking}
            </div>
          )}
        </div>
      )}
    </div>
  );
};