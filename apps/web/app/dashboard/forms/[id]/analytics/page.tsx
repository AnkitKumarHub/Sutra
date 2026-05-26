"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { IconArrowLeft, IconChartBar } from "@tabler/icons-react";

import { useAnalyticsWs } from "~/hooks/use-analytics-ws";
import {
  useAnalyticsSummary,
  useFieldBreakdown,
  useResponsesByDay,
  useResponsesOverTime,
  useRecentResponses,
} from "~/hooks/api/analytics";
import { useGetFormById } from "~/hooks/api/form";
import { trpc } from "~/trpc/client";

import { KPICard } from "./components/kpi-card";
import { ResponsesChart } from "./components/responses-chart";
import { ByDayChart } from "./components/by-day-chart";
import { FieldBreakdownSection } from "./components/field-breakdown";
import { RecentTable } from "./components/recent-table";
import { EmptyState } from "./components/empty-state";
import { WsStatus } from "./components/ws-status";

type DateRange = "7d" | "30d" | "all";

export default function AnalyticsPage() {
  const params = useParams<{ id: string }>();
  const formId = params.id;
  const router = useRouter();
  const utils = trpc.useUtils();

  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [pulsingKPI, setPulsingKPI] = useState(false);

  // ── Local state for optimistic real-time updates ──────────────────────────
  const [localTotalResponses, setLocalTotalResponses] = useState<number | null>(null);
  const [localRecentRows, setLocalRecentRows] = useState<
    Array<{ id: string; submittedAt: string; fields: Array<{ fieldId: string; fieldLabel: string; value: string }> }>
  >([]);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const { form } = useGetFormById(formId);
  const { summary, isLoading: summaryLoading } = useAnalyticsSummary(formId, dateRange);
  const { timeSeries, isLoading: timeLoading } = useResponsesOverTime(formId, dateRange);
  const { dayData, isLoading: dayLoading } = useResponsesByDay(formId);
  const { breakdown, isLoading: breakdownLoading } = useFieldBreakdown(formId);
  const { recent, isLoading: recentLoading } = useRecentResponses(formId, 10);

  // ── Seed local state from server data ─────────────────────────────────────
  useEffect(() => {
    if (summary?.totalResponses !== undefined) {
      setLocalTotalResponses(summary.totalResponses);
    }
  }, [summary?.totalResponses]);

  useEffect(() => {
    if (recent) {
      setLocalRecentRows(recent);
    }
  }, [recent]);

  // ── WebSocket real-time updates ───────────────────────────────────────────
  const { delta, status: wsStatus } = useAnalyticsWs(formId);
  const prevDeltaId = useRef<string | null>(null);

  useEffect(() => {
    if (!delta) return;
    const deltaId = delta.timestamp + delta.delta.newSubmission.id;
    if (prevDeltaId.current === deltaId) return;
    prevDeltaId.current = deltaId;

    // 1. Increment total count
    setLocalTotalResponses((prev) => (prev !== null ? prev + 1 : null));

    // 2. Pulse KPI card
    setPulsingKPI(true);
    setTimeout(() => setPulsingKPI(false), 700);

    // 3. Prepend to recent table (optimistic, no label lookup)
    setLocalRecentRows((prev) => {
      const newRow = {
        id: delta.delta.newSubmission.id,
        submittedAt: delta.delta.newSubmission.submittedAt,
        fields: delta.delta.newSubmission.values.map((v) => ({
          fieldId: v.fieldId,
          fieldLabel: v.fieldId, // will be replaced on next refetch
          value: String(v.value ?? ""),
        })),
      };
      return [newRow, ...prev].slice(0, 10);
    });

    // 4. Toast notification
    toast.success("🎉 New response received!", {
      description: "Your form just got a new submission.",
      duration: 3000,
    });

    // 5. Invalidate field breakdown for accurate update
    void utils.analytics.getFieldBreakdown.invalidate({ formId });
    void utils.analytics.getRecentResponses.invalidate({ formId, limit: 10 });
  }, [delta, formId, utils]);

  // ── Derived display values ────────────────────────────────────────────────
  const displayTotalResponses = localTotalResponses ?? summary?.totalResponses ?? 0;
  const displayTimeSeries = timeSeries ?? [];
  const displayDayData = dayData ?? [];
  const displayRecent = localRecentRows.length > 0 ? localRecentRows : (recent ?? []);

  const isEmpty = !summaryLoading && displayTotalResponses === 0;
  const isLoading = summaryLoading || timeLoading || dayLoading;

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center justify-between gap-4 px-4 lg:px-6 py-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/forms"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <IconArrowLeft className="size-4" />
              Forms
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <div className="flex items-center gap-2">
              <IconChartBar className="size-4 text-primary" />
              <span className="text-sm font-medium truncate max-w-[200px]">
                {form?.title ?? "Analytics"}
              </span>
            </div>
          </div>

          <WsStatus status={wsStatus} />
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-6 px-4 lg:px-6 py-6 max-w-7xl mx-auto w-full">

        {/* Empty state */}
        {isEmpty && !isLoading && (
          <EmptyState formId={formId} slug={form?.slug} />
        )}

        {/* KPI Cards — always shown (zero-state is fine) */}
        {!isEmpty && (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <KPICard
                label="Total Responses"
                value={displayTotalResponses}
                format="number"
                trend={summary?.trendPercentage}
                subtitle={summary?.lastResponseAt ? `Last: ${new Date(summary.lastResponseAt).toLocaleDateString()}` : undefined}
                index={0}
                isLoading={summaryLoading}
                isPulsing={pulsingKPI}
              />
              <KPICard
                label="Today"
                value={summary?.responsesToday ?? 0}
                format="number"
                index={1}
                isLoading={summaryLoading}
              />
              <KPICard
                label="This Week"
                value={summary?.responsesThisWeek ?? 0}
                format="number"
                index={2}
                isLoading={summaryLoading}
              />
              <KPICard
                label="Avg Fill Time"
                value={summary?.avgCompletionSeconds ?? 0}
                format="duration"
                index={3}
                isLoading={summaryLoading}
                subtitle={summary?.avgCompletionSeconds === 0 ? "Not enough data" : undefined}
              />
            </div>

            {/* Responses Over Time — full width hero chart */}
            <ResponsesChart
              data={displayTimeSeries}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              isLoading={timeLoading}
            />

            {/* By-day chart + field breakdown side-by-side on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ByDayChart data={displayDayData} isLoading={dayLoading} />

              {/* Breakdown preview — first field only in compact grid */}
              {breakdown && breakdown.length > 0 && (
                <FieldBreakdownSection
                  breakdown={breakdown.slice(0, 1)}
                  isLoading={breakdownLoading}
                />
              )}
            </div>

            {/* Full field breakdown */}
            {breakdown && breakdown.length > 1 && (
              <FieldBreakdownSection
                breakdown={breakdown.slice(1)}
                isLoading={breakdownLoading}
              />
            )}

            {/* Recent responses table */}
            <RecentTable responses={displayRecent} isLoading={recentLoading} />
          </>
        )}
      </div>
    </div>
  );
}
