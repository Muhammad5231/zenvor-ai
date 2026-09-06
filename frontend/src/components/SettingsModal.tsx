"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sliders } from "lucide-react";

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
}) => {
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
            className="relative w-full max-w-md rounded-3xl bg-[#ffffff] dark:bg-[#18181a] p-6 border border-[#e5e5e7] dark:border-[#28292d] shadow-2xl z-10 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-[#e5e5e7] dark:border-[#28292d] pb-3">
              <div className="flex items-center gap-2 text-[#18181b] dark:text-[#ffffff] font-semibold text-base">
                <Sliders className="w-4 h-4 text-[#4d6bfe]" />
                <span>Engine Hyperparameters</span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-[#71717a] dark:text-[#9b9da1] hover:text-[#18181b] dark:hover:text-white hover:bg-[#f2f3f5] dark:hover:bg-[#26272b] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Temperature */}
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

              {/* GPU Layers */}
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

              {/* Context Window */}
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
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (onApply) onApply();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-[#4d6bfe] hover:bg-[#3f5be0] text-white font-medium text-xs shadow-lg shadow-[#4d6bfe]/20 transition-colors"
            >
              Apply & Reload Model
            </motion.button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
