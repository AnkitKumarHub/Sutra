"use client";

import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

interface TimeSeriesPoint {
  date: string;
  count: number;
}

interface ResponsesChartProps {
  data: TimeSeriesPoint[];
  dateRange: "7d" | "30d" | "all";
  onDateRangeChange: (range: "7d" | "30d" | "all") => void;
  isLoading?: boolean;
}

function formatDate(dateStr: string, dateRange: "7d" | "30d" | "all") {
  const d = new Date(dateStr);
  if (dateRange === "7d") {
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const RANGE_OPTIONS: { label: string; value: "7d" | "30d" | "all" }[] = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "All Time", value: "all" },
];

export function ResponsesChart({ data, dateRange, onDateRangeChange, isLoading }: ResponsesChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[240px] w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.32, ease: "easeOut" }}
    >
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>Responses Over Time</CardTitle>
            <CardDescription>Daily submission count</CardDescription>
          </div>
          {/* Date range toggle */}
          <div className="flex items-center gap-1 rounded-lg border p-1 bg-muted/40">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onDateRangeChange(opt.value)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                  dateRange === opt.value
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <motion.div
            key={dateRange} // re-mount chart when range changes for crossfade
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v) => formatDate(v, dateRange)}
                  minTickGap={40}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "hsl(var(--foreground))",
                  }}
                  labelFormatter={(v) => formatDate(v as string, dateRange)}
                  formatter={(v: unknown) => [v as number, "Responses"]}
                  cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                />
                <Area
                  dataKey="count"
                  type="monotone"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#analyticsGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: "hsl(var(--primary))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
                  animationDuration={800}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
