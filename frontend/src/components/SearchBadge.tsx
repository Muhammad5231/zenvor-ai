"use client";

import React from "react";
import { motion } from "framer-motion";
import { Globe, ExternalLink } from "lucide-react";

interface SearchBadgeProps {
  sources: Array<{ title: string; url: string; snippet: string }>;
}

export const SearchBadge: React.FC<SearchBadgeProps> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 pt-3 border-t border-[#e5e5e7] dark:border-[#28292d]"
    >
      <div className="flex items-center gap-1.5 text-xs text-[#4d6bfe] font-medium mb-2">
        <Globe className="w-3.5 h-3.5" />
        <span>Live Web Citations</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sources.map((src, i) => (
          <a
            key={i}
            href={src.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start justify-between gap-2 p-2 rounded-lg bg-[#f2f3f5] dark:bg-[#1e1f22] border border-[#e5e5e7] dark:border-[#2d2e33] hover:border-[#4d6bfe]/50 transition-colors group"
          >
            <div className="overflow-hidden">
              <p className="text-xs text-[#18181b] dark:text-[#d1d2d6] font-medium truncate group-hover:text-[#4d6bfe] transition-colors">
                {src.title}
              </p>
              <p className="text-[10px] text-[#71717a] dark:text-[#9b9da1] truncate">{src.url}</p>
            </div>
            <ExternalLink className="w-3 h-3 text-[#71717a] dark:text-[#9b9da1] group-hover:text-[#4d6bfe] shrink-0 mt-0.5 transition-colors" />
          </a>
        ))}
      </div>
    </motion.div>
  );
};
