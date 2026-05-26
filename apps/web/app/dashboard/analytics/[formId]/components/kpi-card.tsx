"use client";

import { motion } from "framer-motion";
import CountUp from "react-countup";
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";
import { Skeleton } from "~/components/ui/skeleton";

interface KPICardProps {
  label: string;
  value: number;
  format: "number" | "duration" | "percentage";
  trend?: number;
  subtitle?: string;
  index: number;
  isLoading?: boolean;
  isPulsing?: boolean;
}

function formatDuration(seconds: number): string {
  if (seconds === 0) return "0s";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export function KPICard({
  label,
  value,
  format,
  trend,
  subtitle,
  index,
  isLoading,
  isPulsing,
}: KPICardProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
        <Skeleton className="h-3.5 w-24 mb-4" />
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-20" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
      className={`rounded-xl border bg-card p-5 flex flex-col gap-3 shadow-sm cursor-default transition-all duration-300 ${
        isPulsing
          ? "border-primary/60 shadow-primary/10 shadow-md"
          : "border-border/60"
      }`}
    >
      <p className="text-sm text-muted-foreground font-medium">{label}</p>
      <div className="flex items-end gap-3">
        <p className="text-3xl font-semibold tabular-nums tracking-tight">
          {format === "duration" ? (
            formatDuration(value)
          ) : format === "percentage" ? (
            <><CountUp end={value} duration={0.8} />%</>
          ) : (
            <CountUp end={value} duration={0.8} separator="," />
          )}
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
      {subtitle && (
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      )}
    </motion.div>
  );
}
