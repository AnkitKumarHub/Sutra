"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  IconChartBar,
  IconForms,
  IconActivity,
  IconTrendingUp,
  IconTrendingDown,
  IconSearch,
  IconExternalLink,
  IconEdit,
} from "@tabler/icons-react";
import CountUp from "react-countup";

import { useAnalyticsOverview } from "~/hooks/api/analytics";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Sparkline } from "./components/sparkline";

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusFilter = "ALL" | "PUBLISHED" | "DRAFT" | "ARCHIVED";
type SortOption = "recent" | "created" | "alpha";

// ─── KPI Card ────────────────────────────────────────────────────────────────

interface GlobalKPICardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  trend?: number;
  index: number;
  isLoading?: boolean;
}

function GlobalKPICard({ label, value, icon, trend, index, isLoading }: GlobalKPICardProps) {
  if (isLoading) {
    return <Skeleton className="h-28 rounded-xl" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
      className="rounded-xl border border-border/60 bg-card p-5 flex flex-col gap-3 shadow-sm cursor-default"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <span className="text-muted-foreground/60">{icon}</span>
      </div>
      <div className="flex items-end gap-3">
        <p className="text-3xl font-semibold tabular-nums tracking-tight">
          <CountUp end={value} duration={0.8} separator="," />
        </p>
        {trend !== undefined && (
          <span
            className={`flex items-center gap-0.5 text-xs font-medium mb-1 ${
              trend >= 0 ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {trend >= 0 ? (
              <IconTrendingUp className="size-3.5" />
            ) : (
              <IconTrendingDown className="size-3.5" />
            )}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ─── Form Card ────────────────────────────────────────────────────────────────

interface FormCardProps {
  form: {
    formId: string;
    title: string;
    description: string | null;
    slug: string | null;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    totalResponses: number;
    lastResponseAt: string | null;
    sparkline: number[];
    createdAt: string;
  };
  index: number;
}

const STATUS_CONFIG = {
  PUBLISHED: { label: "Published", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  DRAFT: { label: "Draft", className: "bg-muted text-muted-foreground border-border" },
  ARCHIVED: { label: "Archived", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
};

function FormCard({ form, index }: FormCardProps) {
  const statusCfg = STATUS_CONFIG[form.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 + index * 0.05, ease: "easeOut" }}
      className="group rounded-xl border border-border/60 bg-card p-5 flex flex-col gap-4 shadow-sm hover:shadow-md hover:border-border transition-all duration-200"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-sm truncate max-w-[200px]" title={form.title}>
              {form.title}
            </h3>
            <span
              className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${statusCfg.className}`}
            >
              {statusCfg.label}
            </span>
          </div>
          {form.description && (
            <p className="text-xs text-muted-foreground mt-1 truncate">{form.description}</p>
          )}
        </div>
        <Sparkline data={form.sparkline} />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground tabular-nums">
          {form.totalResponses.toLocaleString()}
        </span>
        <span>responses</span>
        {form.lastResponseAt ? (
          <>
            <span className="text-border">·</span>
            <span>
              Last{" "}
              {formatDistanceToNow(new Date(form.lastResponseAt), { addSuffix: true })}
            </span>
          </>
        ) : (
          <>
            <span className="text-border">·</span>
            <span className="italic">No responses yet</span>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-border/40">
        <Link
          href={`/dashboard/analytics/${form.formId}`}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-primary/8 hover:bg-primary/15 text-primary text-xs font-medium py-1.5 transition-colors"
        >
          <IconChartBar className="size-3.5" />
          View Analytics
        </Link>
        {form.slug && (
          <a
            href={`/f/${form.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-lg border border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground text-xs font-medium px-3 py-1.5 transition-colors"
            title="Open form"
          >
            <IconExternalLink className="size-3.5" />
          </a>
        )}
        <Link
          href={`/dashboard/forms/${form.formId}`}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground text-xs font-medium px-3 py-1.5 transition-colors"
          title="Edit form"
        >
          <IconEdit className="size-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Skeleton Cards ───────────────────────────────────────────────────────────

function FormCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="h-3 w-32" />
      <div className="flex gap-2 pt-1 border-t border-border/40">
        <Skeleton className="h-8 flex-1 rounded-lg" />
        <Skeleton className="h-8 w-10 rounded-lg" />
        <Skeleton className="h-8 w-10 rounded-lg" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AnalyticsOverviewPage() {
  const { overview, isLoading } = useAnalyticsOverview();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sort, setSort] = useState<SortOption>("recent");

  const filteredForms = useMemo(() => {
    if (!overview?.forms) return [];

    let forms = [...overview.forms];

    // Filter by status
    if (statusFilter !== "ALL") {
      forms = forms.filter((f) => f.status === statusFilter);
    }

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      forms = forms.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          (f.description?.toLowerCase().includes(q) ?? false)
      );
    }

    // Sort
    forms.sort((a, b) => {
      if (sort === "recent") {
        const aTime = a.lastResponseAt ? new Date(a.lastResponseAt).getTime() : 0;
        const bTime = b.lastResponseAt ? new Date(b.lastResponseAt).getTime() : 0;
        return bTime - aTime;
      }
      if (sort === "created") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      // alpha
      return a.title.localeCompare(b.title);
    });

    return forms;
  }, [overview?.forms, search, statusFilter, sort]);

  const filterPills: { label: string; value: StatusFilter }[] = [
    { label: "All", value: "ALL" },
    { label: "Published", value: "PUBLISHED" },
    { label: "Draft", value: "DRAFT" },
    { label: "Archived", value: "ARCHIVED" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="px-4 lg:px-6 py-6 border-b border-border/50">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track performance across all your forms.
          </p>
        </motion.div>
      </div>

      <div className="flex-1 flex flex-col gap-6 px-4 lg:px-6 py-6 max-w-7xl mx-auto w-full">

        {/* ── Global KPI Row ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <GlobalKPICard
            label="Total Forms"
            value={overview?.globalTotalForms ?? 0}
            icon={<IconForms className="size-4" />}
            index={0}
            isLoading={isLoading}
          />
          <GlobalKPICard
            label="Active Forms"
            value={overview?.globalActiveForms ?? 0}
            icon={<IconActivity className="size-4" />}
            index={1}
            isLoading={isLoading}
          />
          <GlobalKPICard
            label="Total Responses"
            value={overview?.globalTotalResponses ?? 0}
            icon={<IconChartBar className="size-4" />}
            index={2}
            isLoading={isLoading}
          />
          <GlobalKPICard
            label="This Week"
            value={overview?.globalThisWeek ?? 0}
            icon={<IconTrendingUp className="size-4" />}
            trend={overview?.globalTrendPercentage}
            index={3}
            isLoading={isLoading}
          />
        </div>

        {/* ── Search + Sort + Filters ─────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search forms…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
          >
            <option value="recent">Recently Active</option>
            <option value="created">Recently Created</option>
            <option value="alpha">Alphabetical</option>
          </select>

          {/* Filter pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {filterPills.map((pill) => (
              <button
                key={pill.value}
                onClick={() => setStatusFilter(pill.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  statusFilter === pill.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Form Cards Grid ─────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <FormCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredForms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 gap-3 text-center"
          >
            <span className="text-5xl" aria-hidden>📋</span>
            <p className="text-muted-foreground text-sm">
              {search || statusFilter !== "ALL"
                ? "No forms match your search or filter."
                : "No forms yet. Create your first form to see analytics."}
            </p>
            {!search && statusFilter === "ALL" && (
              <Link
                href="/dashboard/forms"
                className="mt-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Go to Forms
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredForms.map((form, i) => (
              <FormCard key={form.formId} form={form} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
