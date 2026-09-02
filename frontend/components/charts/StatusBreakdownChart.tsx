"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { BOOKING_STATUS_LABEL, BOOKING_STATUS_COLOR_VAR } from "@/lib/format";
import type { BookingStatus } from "@/lib/types";

export function StatusBreakdownChart({
  data,
}: {
  data: { status: BookingStatus; count: number }[];
}) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="status"
            innerRadius={48}
            outerRadius={72}
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((d) => (
              <Cell key={d.status} fill={`var(--color-status-${d.status.replace(/_/g, "-")})`} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "var(--color-surface-raised)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--color-text-primary)",
            }}
            formatter={(value, _name, entry) => [
              value,
              BOOKING_STATUS_LABEL[
                (entry.payload as { status: BookingStatus }).status
              ],
            ]}
          />
        </PieChart>
      </ResponsiveContainer>

      <ul className="flex flex-col gap-2 text-xs">
        {data.map((d) => (
          <li key={d.status} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: BOOKING_STATUS_COLOR_VAR[d.status] }}
            />
            <span className="text-text-muted">{BOOKING_STATUS_LABEL[d.status]}</span>
            <span className="text-text-primary font-medium tabular-nums ml-auto">
              {d.count}
            </span>
            <span className="text-text-faint w-9 text-right tabular-nums">
              {total ? Math.round((d.count / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
