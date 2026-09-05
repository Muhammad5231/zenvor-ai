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
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-200 transition-all shadow-sm"
      >
        <Cpu className="w-3.5 h-3.5 text-indigo-400" />
        <span className="max-w-[130px] truncate">{activeModel || "No model selected"}</span>
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 mt-2 w-64 p-1.5 rounded-2xl glass-panel shadow-2xl z-50 space-y-1"
            >
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Available GGUF Models
              </div>
              {models.length === 0 ? (
                <div className="px-3 py-2 text-xs text-slate-500">No .gguf models found</div>
              ) : (
                models.map((m) => (
                  <button
                    key={m.filename}
                    onClick={() => handleSelect(m.filename)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors text-left ${
                      m.filename === activeModel
                        ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                        : "text-slate-300 hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="overflow-hidden pr-2">
                      <div className="font-medium truncate">{m.filename}</div>
                      <div className="text-[10px] text-slate-500">{m.size_gb}</div>
                    </div>
                    {m.filename === activeModel && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
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