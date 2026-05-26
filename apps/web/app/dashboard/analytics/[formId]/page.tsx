"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  IconArrowLeft,
  IconChartBar,
  IconEdit,
  IconExternalLink,
  IconCopy,
  IconCheck,
  IconDownload,
  IconLayoutGrid,
  IconListDetails,
  IconMessageCircle,
  IconPackageExport,
  IconUser,
  IconClock,
} from "@tabler/icons-react";

import { useAnalyticsWs } from "~/hooks/use-analytics-ws";
import {
  useAnalyticsSummary,
  useFieldBreakdown,
  useResponsesByDay,
  useResponsesOverTime,
  useRecentResponses,
} from "~/hooks/api/analytics";
import { useGetFormById } from "~/hooks/api/form";
import { useExportCsv } from "~/hooks/api/form";
import { trpc } from "~/trpc/client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";

import { KPICard } from "./components/kpi-card";
import { ResponsesChart } from "./components/responses-chart";
import { ByDayChart } from "./components/by-day-chart";
import { FieldBreakdownSection } from "./components/field-breakdown";
import { WsStatus } from "./components/ws-status";
import { EmptyState } from "./components/empty-state";
import { ResponseSheet } from "./components/response-sheet";

type DateRange = "7d" | "30d" | "all";

// ─── Copy Link Button ─────────────────────────────────────────────────────────

function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const formUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/f/${slug}`;

  const copy = async () => {
    await navigator.clipboard.writeText(formUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span key="check" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-1.5 text-emerald-500">
            <IconCheck className="size-3.5" /> Copied!
          </motion.span>
        ) : (
          <motion.span key="copy" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-1.5">
            <IconCopy className="size-3.5" /> Copy Link
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({
  formId,
  summary,
  summaryLoading,
  timeSeries,
  timeLoading,
  dayData,
  dayLoading,
  displayTotalResponses,
  dateRange,
  setDateRange,
  pulsingKPI,
}: {
  formId: string;
  summary: ReturnType<typeof useAnalyticsSummary>["summary"];
  summaryLoading: boolean;
  timeSeries: { date: string; count: number }[];
  timeLoading: boolean;
  dayData: { day: string; count: number }[];
  dayLoading: boolean;
  displayTotalResponses: number;
  dateRange: DateRange;
  setDateRange: (r: DateRange) => void;
  pulsingKPI: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-6 pt-6"
    >
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPICard
          label="Total Responses"
          value={displayTotalResponses}
          format="number"
          trend={summary?.trendPercentage}
          subtitle={summary?.lastResponseAt
            ? `Last: ${new Date(summary.lastResponseAt).toLocaleDateString()}`
            : undefined}
          index={0}
          isLoading={summaryLoading}
          isPulsing={pulsingKPI}
        />
        <KPICard label="Today" value={summary?.responsesToday ?? 0} format="number" index={1} isLoading={summaryLoading} />
        <KPICard label="This Week" value={summary?.responsesThisWeek ?? 0} format="number" index={2} isLoading={summaryLoading} />
        <KPICard
          label="Avg Fill Time"
          value={summary?.avgCompletionSeconds ?? 0}
          format="duration"
          index={3}
          isLoading={summaryLoading}
          subtitle={summary?.avgCompletionSeconds === 0 ? "Not enough data" : undefined}
        />
      </div>

      {/* Trend chart */}
      <ResponsesChart
        data={timeSeries}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        isLoading={timeLoading}
      />

      {/* Day-of-week chart */}
      <div className="max-w-lg">
        <ByDayChart data={dayData} isLoading={dayLoading} />
      </div>
    </motion.div>
  );
}

// ─── Questions Tab ────────────────────────────────────────────────────────────

function QuestionsTab({ formId }: { formId: string }) {
  const { breakdown, isLoading } = useFieldBreakdown(formId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="pt-6"
    >
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
        </div>
      ) : !breakdown || breakdown.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          No field data available yet.
        </p>
      ) : (
        <FieldBreakdownSection breakdown={breakdown} isLoading={false} />
      )}
    </motion.div>
  );
}

// ─── Responses Tab ────────────────────────────────────────────────────────────

interface RecentResponseRow {
  id: string;
  submittedAt: string;
  fields: Array<{ fieldId: string; fieldLabel: string; value: string }>;
}

function ResponsesTab({
  liveRows,
}: {
  liveRows: RecentResponseRow[];
}) {
  const [selectedResponse, setSelectedResponse] = useState<RecentResponseRow | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const openResponse = (row: RecentResponseRow, index: number) => {
    setSelectedResponse(row);
    setSelectedIndex(index + 1);
    setSheetOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="pt-6 space-y-4"
    >
      {liveRows.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          No responses yet.
        </p>
      ) : (
        <div className="rounded-xl border border-border/60 overflow-hidden">
          <div className="px-4 py-3 bg-muted/30 border-b border-border/40 flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {liveRows.length} Responses
            </span>
          </div>
          <div className="divide-y divide-border/30">
            <AnimatePresence initial={false}>
              {liveRows.map((row, i) => (
                <motion.div
                  key={row.id}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-muted/20 transition-colors"
                >
                  {/* Index + avatar */}
                  <div className="flex items-center justify-center size-7 rounded-full bg-muted text-muted-foreground text-xs font-medium shrink-0">
                    <IconUser className="size-3.5" />
                  </div>

                  {/* Response preview */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Response #{liveRows.length - i}
                      </span>
                      <span className="text-border text-xs">·</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <IconClock className="size-3" />
                        {formatDistanceToNow(new Date(row.submittedAt), { addSuffix: true })}
                      </span>
                    </div>
                    {row.fields.length > 0 && (
                      <p className="text-sm truncate mt-0.5">
                        {row.fields[0]?.value || (
                          <span className="text-muted-foreground italic">No preview</span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* View button */}
                  <button
                    onClick={() => openResponse(row, i)}
                    className="shrink-0 px-3 py-1 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    View
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      <ResponseSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        response={selectedResponse}
        responseIndex={selectedIndex}
      />
    </motion.div>
  );
}

// ─── Exports Tab ──────────────────────────────────────────────────────────────

function ExportsTab({ formId, slug }: { formId: string; slug?: string | null }) {
  const { exportCsvAsync, status: exportStatus } = useExportCsv();
  const [exportDone, setExportDone] = useState(false);

  const handleExport = async () => {
    try {
      const result = await exportCsvAsync({ formId });
      const csv = result as unknown as string;
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `responses-${formId}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 3000);
      toast.success("CSV exported successfully");
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="pt-6 max-w-md space-y-4"
    >
      {/* Export CSV */}
      <div className="rounded-xl border border-border/60 p-5 flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <p className="text-sm font-medium">Export CSV</p>
          <p className="text-xs text-muted-foreground">Download all responses as a spreadsheet.</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exportStatus === "pending"}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {exportDone ? <IconCheck className="size-4" /> : <IconDownload className="size-4" />}
          {exportStatus === "pending" ? "Exporting…" : exportDone ? "Done!" : "Export"}
        </button>
      </div>

      {/* Share link */}
      {slug && (
        <div className="rounded-xl border border-border/60 p-5 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Share Form</p>
            <p className="text-xs text-muted-foreground font-mono text-muted-foreground/80">
              /f/{slug}
            </p>
          </div>
          <div className="flex gap-2">
            <CopyLinkButton slug={slug} />
            <a
              href={`/f/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <IconExternalLink className="size-3.5" />
              Open
            </a>
          </div>
        </div>
      )}

      {/* Edit form */}
      <div className="rounded-xl border border-border/60 p-5 flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <p className="text-sm font-medium">Edit Form</p>
          <p className="text-xs text-muted-foreground">Modify questions, settings, and design.</p>
        </div>
        <Link
          href={`/dashboard/forms/${formId}`}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <IconEdit className="size-4" />
          Edit
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { value: "overview", label: "Overview", icon: IconLayoutGrid },
  { value: "questions", label: "Questions", icon: IconMessageCircle },
  { value: "responses", label: "Responses", icon: IconListDetails },
  { value: "exports", label: "Exports", icon: IconPackageExport },
];

const STATUS_BADGE: Record<string, string> = {
  PUBLISHED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  DRAFT: "bg-muted text-muted-foreground border-border",
  ARCHIVED: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

export default function FormAnalyticsPage() {
  const params = useParams<{ formId: string }>();
  const formId = params.formId;
  const utils = trpc.useUtils();

  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [pulsingKPI, setPulsingKPI] = useState(false);
  const [localTotalResponses, setLocalTotalResponses] = useState<number | null>(null);
  const [localRecentRows, setLocalRecentRows] = useState<
    Array<{ id: string; submittedAt: string; fields: Array<{ fieldId: string; fieldLabel: string; value: string }> }>
  >([]);

  // ── Data ──────────────────────────────────────────────────────────────────
  const { form } = useGetFormById(formId);
  const { summary, isLoading: summaryLoading } = useAnalyticsSummary(formId, dateRange);
  const { timeSeries, isLoading: timeLoading } = useResponsesOverTime(formId, dateRange);
  const { dayData, isLoading: dayLoading } = useResponsesByDay(formId);
  const { recent, isLoading: recentLoading } = useRecentResponses(formId, 50);

  // Seed local state from server
  useEffect(() => {
    if (summary?.totalResponses !== undefined) setLocalTotalResponses(summary.totalResponses);
  }, [summary?.totalResponses]);

  useEffect(() => {
    if (recent) setLocalRecentRows(recent);
  }, [recent]);

  // ── WebSocket real-time ────────────────────────────────────────────────────
  const { delta, status: wsStatus } = useAnalyticsWs(formId);
  const prevDeltaId = useRef<string | null>(null);

  useEffect(() => {
    if (!delta) return;
    const deltaId = delta.timestamp + delta.delta.newSubmission.id;
    if (prevDeltaId.current === deltaId) return;
    prevDeltaId.current = deltaId;

    setLocalTotalResponses((prev) => (prev !== null ? prev + 1 : null));
    setPulsingKPI(true);
    setTimeout(() => setPulsingKPI(false), 700);

    setLocalRecentRows((prev) => {
      const newRow = {
        id: delta.delta.newSubmission.id,
        submittedAt: delta.delta.newSubmission.submittedAt,
        fields: delta.delta.newSubmission.values.map((v) => ({
          fieldId: v.fieldId,
          fieldLabel: v.fieldId,
          value: String(v.value ?? ""),
        })),
      };
      return [newRow, ...prev].slice(0, 50);
    });

    toast.success("🎉 New response received!", { duration: 3000 });
    void utils.analytics.getFieldBreakdown.invalidate({ formId });
    void utils.analytics.getRecentResponses.invalidate({ formId, limit: 50 });
  }, [delta, formId, utils]);

  const displayTotalResponses = localTotalResponses ?? summary?.totalResponses ?? 0;
  const displayTimeSeries = timeSeries ?? [];
  const displayDayData = dayData ?? [];
  const displayRecent = localRecentRows.length > 0 ? localRecentRows : (recent ?? []);
  const isEmpty = !summaryLoading && displayTotalResponses === 0;

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Sticky Header ─────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 lg:px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href="/dashboard/analytics"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <IconArrowLeft className="size-4" />
              Analytics
            </Link>
            <span className="text-muted-foreground/40 text-sm">/</span>
            <div className="flex items-center gap-2 min-w-0">
              <IconChartBar className="size-4 text-primary shrink-0" />
              {form ? (
                <>
                  <span className="text-sm font-medium truncate max-w-[180px]">{form.title}</span>
                  <span
                    className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium shrink-0 ${STATUS_BADGE[form.status] ?? ""}`}
                  >
                    {form.status}
                  </span>
                </>
              ) : (
                <Skeleton className="h-4 w-32" />
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <WsStatus status={wsStatus} />
            {form?.slug && <CopyLinkButton slug={form.slug} />}
            <Link
              href={`/dashboard/forms/${formId}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <IconEdit className="size-3.5" />
              Edit Form
            </Link>
          </div>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="flex-1 px-4 lg:px-6 max-w-7xl mx-auto w-full">
        {isEmpty && !summaryLoading ? (
          <div className="py-6">
            <EmptyState formId={formId} slug={form?.slug} />
          </div>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            {/* Tab bar */}
            <div className="pt-4 pb-0 border-b border-border/40">
              <TabsList variant="line" className="gap-0 h-auto bg-transparent p-0 w-full justify-start rounded-none">
                {TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-none text-sm data-[state=active]:text-foreground"
                  >
                    <tab.icon className="size-3.5" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="overview">
              <OverviewTab
                formId={formId}
                summary={summary}
                summaryLoading={summaryLoading}
                timeSeries={displayTimeSeries}
                timeLoading={timeLoading}
                dayData={displayDayData}
                dayLoading={dayLoading}
                displayTotalResponses={displayTotalResponses}
                dateRange={dateRange}
                setDateRange={setDateRange}
                pulsingKPI={pulsingKPI}
              />
            </TabsContent>

            <TabsContent value="questions">
              <QuestionsTab formId={formId} />
            </TabsContent>

            <TabsContent value="responses">
              <ResponsesTab liveRows={displayRecent} />
            </TabsContent>

            <TabsContent value="exports">
              <ExportsTab formId={formId} slug={form?.slug} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
