"use client";

import { motion } from "framer-motion";
import CountUp from "react-countup";
import { IconTrendingUp, IconTrendingDown, IconMinus } from "@tabler/icons-react";
import { Card, CardHeader, CardDescription, CardTitle, CardFooter } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

interface KPICardProps {
  label: string;
  value: number;
  /** Format: "number" | "percent" | "seconds" | "duration" */
  format?: "number" | "percent" | "seconds" | "duration";
  trend?: number; // positive = up, negative = down, 0 = flat
  subtitle?: string;
  index?: number; // stagger index
  isLoading?: boolean;
  isPulsing?: boolean; // true briefly after a real-time update
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export function KPICard({
  label,
  value,
  format = "number",
  trend,
  subtitle,
  index = 0,
  isLoading = false,
  isPulsing = false,
}: KPICardProps) {
  if (isLoading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-20 mt-2" />
        </CardHeader>
        <CardFooter>
          <Skeleton className="h-3 w-40" />
        </CardFooter>
      </Card>
    );
  }

  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;
  const isFlat = trend !== undefined && trend === 0;

  const formattedValue =
    format === "duration"
      ? formatDuration(value)
      : format === "percent"
      ? `${value}%`
      : undefined; // CountUp handles number + seconds

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
      style={{ transformOrigin: "center" }}
    >
      <motion.div
        animate={isPulsing ? { boxShadow: ["0 0 0 0 hsl(var(--primary)/0.3)", "0 0 0 8px hsl(var(--primary)/0)", "0 0 0 0 hsl(var(--primary)/0)"] } : {}}
        transition={{ duration: 0.6 }}
        className="rounded-xl"
      >
        <Card className="@container/card transition-shadow duration-200 hover:shadow-md">
          <CardHeader>
            <CardDescription>{label}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {format === "duration" || format === "percent" ? (
                formattedValue
              ) : (
                <CountUp
                  end={value}
                  duration={0.7}
                  separator=","
                  suffix={format === "seconds" ? "s" : ""}
                  preserveValue
                />
              )}
            </CardTitle>
            {trend !== undefined && (
              <div className="flex items-center gap-1 text-sm font-medium">
                {isPositive && (
                  <>
                    <IconTrendingUp className="size-4 text-emerald-500" />
                    <span className="text-emerald-500">+{trend}%</span>
                  </>
                )}
                {isNegative && (
                  <>
                    <IconTrendingDown className="size-4 text-rose-500" />
                    <span className="text-rose-500">{trend}%</span>
                  </>
                )}
                {isFlat && (
                  <>
                    <IconMinus className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">0%</span>
                  </>
                )}
              </div>
            )}
          </CardHeader>
          {subtitle && (
            <CardFooter className="text-xs text-muted-foreground pt-0">
              {subtitle}
            </CardFooter>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}
