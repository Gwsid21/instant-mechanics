import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  accentVar = "var(--color-accent)",
  hint,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  accentVar?: string;
  hint?: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-lg border border-border bg-surface pl-4 pr-4 py-3.5"
      style={{ borderLeft: `3px solid ${accentVar}` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted">{label}</span>
        <Icon size={14} className="text-text-faint" strokeWidth={2} />
      </div>
      <div className="mt-1.5 font-[family-name:var(--font-display)] text-2xl font-semibold text-text-primary tabular-nums">
        {value}
      </div>
      {hint && <div className="mt-0.5 text-[11px] text-text-faint">{hint}</div>}
    </div>
  );
}
