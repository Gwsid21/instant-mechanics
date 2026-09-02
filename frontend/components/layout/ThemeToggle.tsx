"use client";

import { useTheme } from "@/lib/theme-context";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10" />;
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center rounded-lg border border-border p-2 transition-colors hover:bg-surface-raised"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun size={18} className="text-text-primary" />
      ) : (
        <Moon size={18} className="text-text-primary" />
      )}
    </button>
  );
}
