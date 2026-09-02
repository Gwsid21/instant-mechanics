import { AlertTriangle, Inbox } from "lucide-react";
import type { ReactNode } from "react";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-surface-raised ${className ?? ""}`}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <Skeleton className="h-3 w-20 mb-3" />
      <Skeleton className="h-7 w-16" />
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-surface py-12 text-center">
      <AlertTriangle size={20} className="text-status-cancelled" />
      <p className="text-sm text-text-primary">Couldn&apos;t load this data</p>
      <p className="text-xs text-text-muted max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 rounded-md border border-border px-3 py-1.5 text-xs text-text-primary hover:bg-surface-raised"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
      <Inbox size={20} className="text-text-faint" />
      <p className="text-sm text-text-primary">{title}</p>
      {description && (
        <p className="text-xs text-text-muted max-w-sm">{description}</p>
      )}
      {action}
    </div>
  );
}
