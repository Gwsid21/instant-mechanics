"use client";

import { LiveProvider } from "@/lib/live-context";
import { ThemeProvider } from "@/lib/theme-context";
import { AppShell } from "./AppShell";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LiveProvider>
        <AppShell>{children}</AppShell>
      </LiveProvider>
    </ThemeProvider>
  );
}
