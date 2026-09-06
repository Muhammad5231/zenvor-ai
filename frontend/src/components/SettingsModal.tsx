"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sliders,
  Type,
  Database,
  Keyboard,
  Download,
  Trash2,
  Loader2,
  AlertTriangle,
  Check,
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: () => void;
  temperature: number;
  setTemperature: (v: number) => void;
  gpuLayers: number;
  setGpuLayers: (v: number) => void;
  contextSize: number;
  setContextSize: (v: number) => void;
  onExportData: () => Promise<void>;
  onDeleteAllData: () => Promise<void>;
}

type FontSize = "0.9" | "1" | "1.15";

const FONT_SIZE_OPTIONS: { label: string; value: FontSize }[] = [
  { label: "Small", value: "0.9" },
  { label: "Medium", value: "1" },
  { label: "Large", value: "1.15" },
];

function SectionLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-[#71717a] dark:text-[#9b9da1] uppercase tracking-wider mb-3">
      {icon}
      <span>{children}</span>
    </div>
  );
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onApply,
  temperature,
  setTemperature,
  gpuLayers,
  setGpuLayers,
  contextSize,
  setContextSize,
  onExportData,
  onDeleteAllData,
}) => {
  const [fontSize, setFontSize] = useState<FontSize>("1");
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  // Read the persisted font scale once on mount so the button state
  // reflects what's actually applied (set earlier by the inline
  // layout.tsx script, before hydration).
  useEffect(() => {
    try {
      const saved = localStorage.getItem("zenvor-font-scale") as FontSize | null;
      if (saved) setFontSize(saved);
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setConfirmingDelete(false);
      setExportDone(false);
    }
  }, [isOpen]);

  const handleFontSizeChange = (value: FontSize) => {
    setFontSize(value);
    document.documentElement.style.setProperty("--chat-font-scale", value);
    try {
      localStorage.setItem("zenvor-font-scale", value);
    } catch (e) {
      // ignore
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportDone(false);
    try {
      await onExportData();
      setExportDone(true);
    } catch (e) {
      console.error("Export failed:", e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    setIsDeleting(true);
    try {
      await onDeleteAllData();
      setConfirmingDelete(false);
    } catch (e) {
      console.error("Delete failed:", e);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md rounded-3xl bg-[#ffffff] dark:bg-[#18181a] border border-[#e5e5e7] dark:border-[#28292d] shadow-2xl z-10 flex flex-col max-h-[85vh]"
          >
            <div className="flex items-center justify-between border-b border-[#e5e5e7] dark:border-[#28292d] px-6 py-4 shrink-0">
              <div className="flex items-center gap-2 text-[#18181b] dark:text-[#ffffff] font-semibold text-base">
                <Sliders className="w-4 h-4 text-[#4d6bfe]" />
                <span>Settings</span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-[#71717a] dark:text-[#9b9da1] hover:text-[#18181b] dark:hover:text-white hover:bg-[#f2f3f5] dark:hover:bg-[#26272b] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-5 space-y-6">
              {/* Model Engine */}
              <div>
                <SectionLabel icon={<Sliders className="w-3.5 h-3.5" />}>Model Engine</SectionLabel>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-[#71717a] dark:text-[#9b9da1]">Sampling Temperature</span>
                      <span className="text-[#4d6bfe] font-mono">{temperature}</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.5"
                      step="0.05"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full accent-[#4d6bfe] bg-[#e5e5e7] dark:bg-[#26272b] h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-[#71717a] dark:text-[#9b9da1]">GPU Offload Layers (VRAM)</span>
                      <span className="text-[#4d6bfe] font-mono">
                        {gpuLayers === -1 ? "All (-1)" : gpuLayers}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-1"
                      max="64"
                      step="1"
                      value={gpuLayers}
                      onChange={(e) => setGpuLayers(parseInt(e.target.value))}
                      className="w-full accent-[#4d6bfe] bg-[#e5e5e7] dark:bg-[#26272b] h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-[#71717a] dark:text-[#9b9da1]">Context Window Tokens</span>
                      <span className="text-[#4d6bfe] font-mono">{contextSize}</span>
                    </div>
                    <select
                      value={contextSize}
                      onChange={(e) => setContextSize(parseInt(e.target.value))}
                      className="w-full bg-[#f2f3f5] dark:bg-[#212224] border border-[#e5e5e7] dark:border-[#2d2e33] rounded-xl px-3 py-2 text-xs text-[#18181b] dark:text-[#e3e4e8] outline-none focus:border-[#4d6bfe] transition-colors"
                    >
                      <option value={2048}>2,048 Tokens</option>
                      <option value={4096}>4,096 Tokens</option>
                      <option value={8192}>8,192 Tokens</option>
                      <option value={16384}>16,384 Tokens</option>
                    </select>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      if (onApply) onApply();
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#4d6bfe] hover:bg-[#3f5be0] text-white font-medium text-xs shadow-lg shadow-[#4d6bfe]/20 transition-colors"
                  >
                    Apply & Reload Model
                  </motion.button>
                </div>
              </div>

              <div className="h-px bg-[#e5e5e7] dark:bg-[#28292d]" />

              {/* Appearance */}
              <div>
                <SectionLabel icon={<Type className="w-3.5 h-3.5" />}>Appearance</SectionLabel>
                <div className="flex justify-between text-xs font-medium mb-2">
                  <span className="text-[#71717a] dark:text-[#9b9da1]">Chat font size</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {FONT_SIZE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleFontSizeChange(opt.value)}
                      className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                        fontSize === opt.value
                          ? "bg-[#4d6bfe]/15 text-[#4d6bfe] border-[#4d6bfe]/40"
                          : "bg-[#f2f3f5] dark:bg-[#212224] text-[#71717a] dark:text-[#9b9da1] border-[#e5e5e7] dark:border-[#2d2e33] hover:border-[#4d6bfe]/40"
                      }`}
                      style={{ fontSize: `calc(12px * ${opt.value})` }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-[#e5e5e7] dark:bg-[#28292d]" />

              {/* Data */}
              <div>
                <SectionLabel icon={<Database className="w-3.5 h-3.5" />}>Data</SectionLabel>
                <div className="space-y-2">
                  <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#f2f3f5] dark:bg-[#212224] border border-[#e5e5e7] dark:border-[#2d2e33] hover:border-[#4d6bfe]/40 text-xs font-medium text-[#18181b] dark:text-[#e3e4e8] transition-all disabled:opacity-60"
                  >
                    <span>Export all chat data</span>
                    {isExporting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4d6bfe]" />
                    ) : exportDone ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-[#4d6bfe]" />
                    )}
                  </button>

                  {!confirmingDelete ? (
                    <button
                      onClick={() => setConfirmingDelete(true)}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#f2f3f5] dark:bg-[#212224] border border-[#e5e5e7] dark:border-[#2d2e33] hover:border-rose-500/40 text-xs font-medium text-rose-500 transition-all"
                    >
                      <span>Delete all chat data</span>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2.5">
                      <div className="flex items-start gap-2 text-xs text-rose-500">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>
                          This permanently deletes every conversation. This can't be undone.
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmingDelete(false)}
                          disabled={isDeleting}
                          className="flex-1 py-1.5 rounded-lg bg-[#ffffff] dark:bg-[#26272b] border border-[#e5e5e7] dark:border-[#33353a] text-xs font-medium text-[#18181b] dark:text-[#e3e4e8] transition-colors disabled:opacity-60"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteConfirmed}
                          disabled={isDeleting}
                          className="flex-1 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
                        >
                          {isDeleting && <Loader2 className="w-3 h-3 animate-spin" />}
                          <span>Delete everything</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="h-px bg-[#e5e5e7] dark:bg-[#28292d]" />

              {/* Shortcuts */}
              <div>
                <SectionLabel icon={<Keyboard className="w-3.5 h-3.5" />}>Keyboard Shortcuts</SectionLabel>
                <div className="space-y-2 text-xs">
                  {[
                    { keys: ["Enter"], label: "Send message" },
                    { keys: ["Shift", "Enter"], label: "New line" },
                    { keys: ["Ctrl", "B"], label: "Toggle sidebar" },
                    { keys: ["Ctrl", ","], label: "Open settings" },
                    { keys: ["Esc"], label: "Close dialogs" },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-[#71717a] dark:text-[#9b9da1]">{s.label}</span>
                      <span className="flex gap-1">
                        {s.keys.map((k, j) => (
                          <kbd
                            key={j}
                            className="px-1.5 py-0.5 rounded-md bg-[#f2f3f5] dark:bg-[#212224] border border-[#e5e5e7] dark:border-[#2d2e33] text-[10px] font-mono text-[#18181b] dark:text-[#e3e4e8]"
                          >
                            {k}
                          </kbd>
                        ))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
