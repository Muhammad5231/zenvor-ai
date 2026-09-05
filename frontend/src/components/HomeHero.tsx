"use client";

import React from "react";
import { Globe, Brain, Send, Square, Sparkles, Terminal, Cpu, Code2 } from "lucide-react";

interface HomeHeroProps {
  inputPrompt: string;
  setInputPrompt: (v: string) => void;
  onSend: () => void;
  enableSearch: boolean;
  setEnableSearch: (v: boolean) => void;
  enableMemory: boolean;
  setEnableMemory: (v: boolean) => void;
  isStreaming: boolean;
  onStop: () => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  inputPrompt,
  setInputPrompt,
  onSend,
  enableSearch,
  setEnableSearch,
  enableMemory,
  setEnableMemory,
  isStreaming,
  onStop,
}) => {
  const suggestions = [
    { icon: <Code2 className="w-3.5 h-3.5 text-[#4d6bfe]" />, title: "Write Python Script", prompt: "Write a clean Python script for local file management with error handling." },
    { icon: <Terminal className="w-3.5 h-3.5 text-emerald-400" />, title: "Debug Code", prompt: "Analyze this snippet and find performance bottlenecks or memory leaks." },
    { icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" />, title: "Explain Architecture", prompt: "Explain how GGUF quantization works with hardware layer offloading." },
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto px-4 text-center -mt-6 font-mono select-none">
      {/* Hero Badge / Header */}
      <div className="mb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f2f3f5] dark:bg-[#212224] border border-[#e5e5e7] dark:border-[#2d2e33] text-xs text-[#71717a] dark:text-[#9b9da1] shadow-sm">
          <Cpu className="w-3.5 h-3.5 text-[#4d6bfe]" />
          <span>ZENVOR Local GGUF Engine Active</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#18181b] dark:text-[#ffffff]">
          What would you like to build today?
        </h1>
        <p className="text-xs md:text-sm text-[#71717a] dark:text-[#9b9da1] max-w-md mx-auto">
          Private, secure, offline-first AI execution with live web grounding and persistent memory.
        </p>
      </div>

      {/* Main Input Box */}
      <div className="w-full rounded-2xl bg-[#f2f3f5] dark:bg-[#212224] border border-[#e5e5e7] dark:border-[#2d2e33] p-4 shadow-xl focus-within:border-[#4d6bfe] transition-all text-left">
        <textarea
          rows={3}
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="Message ZENVOR AI..."
          className="w-full bg-transparent resize-none outline-none text-[14px] text-[#18181b] dark:text-[#ffffff] placeholder-[#73757d] font-mono leading-relaxed"
          autoFocus
        />
        
        <div className="flex items-center justify-between pt-3 border-t border-[#e5e5e7] dark:border-[#2a2b2f]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEnableSearch(!enableSearch)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                enableSearch
                  ? "bg-[#4d6bfe]/15 text-[#4d6bfe] border-[#4d6bfe]/40 shadow-sm"
                  : "bg-transparent text-[#71717a] dark:text-[#9b9da1] border-[#d4d4d8] dark:border-[#36383e] hover:border-[#4d6bfe]"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
            <button
              type="button"
              onClick={() => setEnableMemory(!enableMemory)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                enableMemory
                  ? "bg-[#4d6bfe]/15 text-[#4d6bfe] border-[#4d6bfe]/40 shadow-sm"
                  : "bg-transparent text-[#71717a] dark:text-[#9b9da1] border-[#d4d4d8] dark:border-[#36383e] hover:border-[#4d6bfe]"
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Memory</span>
            </button>
          </div>

          {isStreaming ? (
            <button
              onClick={onStop}
              className="p-2 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-sm"
              title="Stop generating"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button
              onClick={onSend}
              disabled={!inputPrompt.trim()}
              className="p-2 rounded-xl bg-[#4d6bfe] text-white hover:bg-[#3f5be0] disabled:opacity-30 transition-all shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Suggestion Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mt-6">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => setInputPrompt(item.prompt)}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-[#f2f3f5]/50 dark:bg-[#212224]/50 hover:bg-[#f2f3f5] dark:hover:bg-[#212224] border border-[#e5e5e7]/60 dark:border-[#2d2e33]/60 text-left transition-all group shadow-sm hover:border-[#4d6bfe]/50"
          >
            <div className="p-2 rounded-lg bg-white dark:bg-[#18181a] shadow-sm">
              {item.icon}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-[#18181b] dark:text-white truncate group-hover:text-[#4d6bfe] transition-colors">
                {item.title}
              </p>
              <p className="text-[10px] text-[#71717a] dark:text-[#9b9da1] truncate">
                {item.prompt}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};