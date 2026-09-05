"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("zenvor-theme");
    const isDarkMode = saved ? saved === "dark" : true;
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("zenvor-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("zenvor-theme", "light");
    }
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#e5e5e7] dark:border-[#28292d] bg-[#ffffff] dark:bg-[#1e1f21] text-[#71717a] dark:text-[#9b9da1] hover:text-[#18181b] dark:hover:text-[#ffffff] text-xs transition-colors"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
      <span className="font-medium">{isDark ? "Dark" : "Light"}</span>
    </button>
  );
};