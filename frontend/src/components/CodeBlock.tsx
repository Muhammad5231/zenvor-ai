"use client";

import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";

// Cast to bypass React 18/19 type definition mismatches in @types/react-syntax-highlighter
const Highlighter = SyntaxHighlighter as unknown as React.ComponentType<any>;

interface CodeBlockProps {
  language: string;
  value: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-4 rounded-xl overflow-hidden border border-slate-800 bg-[#0c1017]">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800/80 text-xs text-slate-400">
        <span className="font-mono uppercase tracking-wider text-[11px] text-indigo-400 font-semibold">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-[11px]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[11px]">Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="text-[13px] font-mono leading-relaxed overflow-x-auto">
        <Highlighter
          language={language || "text"}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: "1rem",
            background: "transparent",
            fontSize: "13px",
          }}
          wrapLongLines={false}
        >
          {value}
        </Highlighter>
      </div>
    </div>
  );
};