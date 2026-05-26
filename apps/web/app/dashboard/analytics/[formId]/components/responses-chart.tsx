"use client";

import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

type DateRange = "7d" | "30d" | "all";

interface ResponsesChartProps {
  data: { date: string; count: number }[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  isLoading?: boolean;
}

function formatDate(dateStr: string, range: DateRange): string {
  const date = new Date(dateStr);
  if (range === "7d") {
    return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatXAxisTick(dateStr: string, range: DateRange): string {
  const date = new Date(dateStr);
  if (range === "7d") return date.toLocaleDateString(undefined, { weekday: "short" });
  if (range === "30d") return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const DATE_RANGES: { label: string; value: DateRange }[] = [
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
  { label: "All", value: "all" },
];

export function ResponsesChart({
  data,
  dateRange,
  onDateRangeChange,
  isLoading,
}: ResponsesChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-8 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.count), 1);
  // Show only every Nth label for long ranges
  const tickInterval = data.length > 20 ? Math.floor(data.length / 10) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.24 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium">Responses Over Time</CardTitle>
          <div className="flex items-center gap-1 rounded-lg border border-border/60 p-0.5 bg-muted/30">
            {DATE_RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => onDateRangeChange(r.value)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  dateRange === r.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="responseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                interval={tickInterval}
                tickFormatter={(v) => formatXAxisTick(v as string, dateRange)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                allowDecimals={false}
                domain={[0, maxVal + 1]}
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
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#responseGradient)"
                animationDuration={800}
                dot={false}
                activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
