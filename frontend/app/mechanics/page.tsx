"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { getMechanics } from "@/lib/api";
import { MechanicsGrid } from "@/components/mechanics/MechanicsGrid";
import { Pagination } from "@/components/ui/Pagination";
import { ErrorState, EmptyState, Skeleton } from "@/components/ui/States";
import { MECHANIC_STATUSES } from "@/lib/constants";
import { MECHANIC_STATUS_LABEL } from "@/lib/format";
import { useLiveEvent } from "@/lib/live-context";
import type { Mechanic, MechanicStatus, Paginated } from "@/lib/types";

const LIMIT = 12;

export default function MechanicsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Paginated<Mechanic> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getMechanics({ search, status, page, limit: LIMIT })
      .then((res) => {
        setResult(res);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [search, status, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount pattern
    load();
  }, [load]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount pattern
    setPage(1);
  }, [search, status]);

  useLiveEvent("mechanic:updated", load);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold text-text-primary">
          Mechanics
        </h1>
        <p className="text-sm text-text-muted mt-0.5">
          {result ? `${result.pagination.total} mechanics` : "Loading mechanics…"}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1 min-w-0">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-faint" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search mechanic name…"
            className="w-full rounded-md border border-border bg-graphite-950/40 py-2 pl-8 pr-3 text-sm text-text-primary placeholder:text-text-faint outline-none focus:border-accent"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-border bg-graphite-950/40 px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
        >
          <option value="">All statuses</option>
          {MECHANIC_STATUSES.map((s) => (
            <option key={s} value={s}>
              {MECHANIC_STATUS_LABEL[s as MechanicStatus]}
            </option>
          ))}
        </select>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      {!error && loading && !result && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      )}

      {!error && result && result.items.length === 0 && (
        <EmptyState title="No mechanics match these filters" />
      )}

      {!error && result && result.items.length > 0 && (
        <>
          <MechanicsGrid mechanics={result.items} />
          <Pagination
            page={result.pagination.page}
            totalPages={result.pagination.totalPages}
            total={result.pagination.total}
            limit={result.pagination.limit}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
