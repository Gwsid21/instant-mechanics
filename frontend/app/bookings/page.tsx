"use client";

import { useCallback, useEffect, useState } from "react";
import { getBookings, exportBookingsCsvUrl } from "@/lib/api";
import { BookingsTable, useRecentlyUpdated } from "@/components/bookings/BookingsTable";
import { BookingsFilterBar } from "@/components/bookings/BookingsFilterBar";
import { Pagination } from "@/components/ui/Pagination";
import { Panel } from "@/components/ui/Panel";
import { ErrorState, EmptyState, Skeleton } from "@/components/ui/States";
import { useLiveEvent } from "@/lib/live-context";
import type { Booking, Paginated } from "@/lib/types";

const LIMIT = 15;

export default function BookingsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("-createdAt");
  const [page, setPage] = useState(1);

  const [result, setResult] = useState<Paginated<Booking> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [justUpdated, setJustUpdated] = useState<string[]>([]);

  const query = { search, status, category, sort, page, limit: LIMIT };

  const load = useCallback(() => {
    setLoading(true);
    getBookings(query)
      .then((res) => {
        setResult(res);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, category, sort, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount pattern
    load();
  }, [load]);

  // Reset to page 1 whenever a filter changes (not on page changes themselves).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount pattern
    setPage(1);
  }, [search, status, category, sort]);

  useLiveEvent<Booking>("booking:created", () => {
    if (page === 1) load();
  });
  useLiveEvent<Booking>("booking:updated", (updated) => {
    setJustUpdated((prev) => [...prev, updated._id]);
    setResult((prev) => {
      if (!prev) return prev;
      const exists = prev.items.some((b) => b._id === updated._id);
      if (!exists) return prev;
      return { ...prev, items: prev.items.map((b) => (b._id === updated._id ? updated : b)) };
    });
  });

  const recentlyUpdated = useRecentlyUpdated(justUpdated);

  function handleSortChange(field: string) {
    setSort((prev) => {
      const currentField = prev.replace("-", "");
      if (currentField !== field) return `-${field}`;
      return prev.startsWith("-") ? field : `-${field}`;
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold text-text-primary">
          Bookings
        </h1>
        <p className="text-sm text-text-muted mt-0.5">
          {result ? `${result.pagination.total} bookings total` : "Loading bookings…"}
        </p>
      </div>

      <Panel>
        <BookingsFilterBar
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          category={category}
          onCategoryChange={setCategory}
          onExport={() =>
            window.open(exportBookingsCsvUrl({ search, status, category }), "_blank")
          }
        />

        {error && <ErrorState message={error} onRetry={load} />}

        {!error && loading && !result && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}

        {!error && result && result.items.length === 0 && (
          <EmptyState
            title="No bookings match these filters"
            description="Try clearing the search or status filter."
          />
        )}

        {!error && result && result.items.length > 0 && (
          <>
            <BookingsTable
              bookings={result.items}
              sort={sort}
              onSortChange={handleSortChange}
              recentlyUpdatedIds={recentlyUpdated}
            />
            <Pagination
              page={result.pagination.page}
              totalPages={result.pagination.totalPages}
              total={result.pagination.total}
              limit={result.pagination.limit}
              onPageChange={setPage}
            />
          </>
        )}
      </Panel>
    </div>
  );
}
