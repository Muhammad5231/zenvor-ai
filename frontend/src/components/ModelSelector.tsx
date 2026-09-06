"use client";

import React, { useState } from "react";
import { Cpu, ChevronDown, Check, Loader2 } from "lucide-react";
import { ModelInfo } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface ModelSelectorProps {
  models: ModelInfo[];
  activeModel: string;
  onSelectModel: (filename: string) => Promise<void>;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  activeModel,
  onSelectModel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelect = async (filename: string) => {
    if (filename === activeModel) {
      setIsOpen(false);
      return;
    }
    try {
      setIsLoading(true);
      await onSelectModel(filename);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#f2f3f5] dark:bg-[#212224] border border-[#e5e5e7] dark:border-[#2d2e33] hover:border-[#4d6bfe]/50 text-xs font-medium text-[#18181b] dark:text-[#e3e4e8] transition-all shadow-sm"
      >
        <Cpu className="w-3.5 h-3.5 text-[#4d6bfe]" />
        <span className="max-w-[130px] truncate">{activeModel || "No model selected"}</span>
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4d6bfe]" />
        ) : (
          <ChevronDown className={`w-3.5 h-3.5 text-[#71717a] dark:text-[#9b9da1] transition-transform ${isOpen ? "rotate-180" : ""}`} />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 mt-2 w-64 p-1.5 rounded-2xl bg-[#ffffff] dark:bg-[#1e1f21] border border-[#e5e5e7] dark:border-[#2d2e33] shadow-2xl z-50 space-y-1"
            >
              <div className="px-2 py-1 text-[11px] font-semibold text-[#71717a] dark:text-[#9b9da1] uppercase tracking-wider">
                Available GGUF Models
              </div>
              {models.length === 0 ? (
                <div className="px-3 py-2 text-xs text-[#a1a1aa] dark:text-[#6e7078]">No .gguf models found</div>
              ) : (
                models.map((m) => (
                  <button
                    key={m.filename}
                    onClick={() => handleSelect(m.filename)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors text-left ${
                      m.filename === activeModel
                        ? "bg-[#4d6bfe]/15 text-[#4d6bfe] border border-[#4d6bfe]/30"
                        : "text-[#18181b] dark:text-[#d1d2d6] hover:bg-[#f2f3f5] dark:hover:bg-[#26272b] border border-transparent"
                    }`}
                  >
                    <div className="overflow-hidden pr-2">
                      <div className="font-medium truncate">{m.filename}</div>
                      <div className="text-[10px] text-[#71717a] dark:text-[#9b9da1]">{m.size_gb}</div>
                    </div>
                    {m.filename === activeModel && <Check className="w-3.5 h-3.5 text-[#4d6bfe] shrink-0" />}
                  </button>
                ))
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
