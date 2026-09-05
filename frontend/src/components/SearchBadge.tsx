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
      className="mt-3 pt-3 border-t border-slate-800/80"
    >
      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mb-2">
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
            className="flex items-start justify-between gap-2 p-2 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors group"
          >
            <div className="overflow-hidden">
              <p className="text-xs text-slate-300 font-medium truncate group-hover:text-emerald-300 transition-colors">
                {src.title}
              </p>
              <p className="text-[10px] text-slate-500 truncate">{src.url}</p>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-slate-300 shrink-0 mt-0.5" />
          </a>
        ))}
      </div>
    </motion.div>
  );
};