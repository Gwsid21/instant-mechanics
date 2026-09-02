"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { getCustomers } from "@/lib/api";
import { Panel } from "@/components/ui/Panel";
import { Pagination } from "@/components/ui/Pagination";
import { ErrorState, EmptyState, Skeleton } from "@/components/ui/States";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Customer, Paginated } from "@/lib/types";

const LIMIT = 15;

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Paginated<Customer> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getCustomers({ search, page, limit: LIMIT })
      .then((res) => {
        setResult(res);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount pattern
    load();
  }, [load]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount pattern
    setPage(1);
  }, [search]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold text-text-primary">
          Customers
        </h1>
        <p className="text-sm text-text-muted mt-0.5">
          {result ? `${result.pagination.total} customers` : "Loading customers…"}
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-faint" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or email…"
          className="w-full rounded-md border border-border bg-graphite-950/40 py-2 pl-8 pr-3 text-sm text-text-primary placeholder:text-text-faint outline-none focus:border-accent"
        />
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      {!error && loading && !result && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      )}

      {!error && result && result.items.length === 0 && (
        <EmptyState title="No customers match this search" />
      )}

      {!error && result && result.items.length > 0 && (
        <Panel>
          <div className="overflow-x-auto -m-4 md:-m-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-graphite-950/40 text-left">
                  <th className="px-4 py-2.5 font-medium text-text-muted">Name</th>
                  <th className="px-4 py-2.5 font-medium text-text-muted">Email</th>
                  <th className="px-4 py-2.5 font-medium text-text-muted">City</th>
                  <th className="px-4 py-2.5 font-medium text-text-muted">Bookings</th>
                  <th className="px-4 py-2.5 font-medium text-text-muted">Total spend</th>
                  <th className="px-4 py-2.5 font-medium text-text-muted">Joined</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((c) => (
                  <tr key={c._id} className="border-b border-border-soft last:border-b-0 hover:bg-surface-raised/60">
                    <td className="px-4 py-2.5 whitespace-nowrap text-text-primary">{c.name}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-text-muted">{c.email}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-text-muted">{c.city}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-text-primary tabular-nums">
                      {c.totalBookings}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-text-primary tabular-nums">
                      {formatCurrency(c.totalSpend)}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-text-muted tabular-nums">
                      {formatDate(c.joinedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={result.pagination.page}
            totalPages={result.pagination.totalPages}
            total={result.pagination.total}
            limit={result.pagination.limit}
            onPageChange={setPage}
          />
        </Panel>
      )}
    </div>
  );
}
