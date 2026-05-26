"use client";

import { motion } from "framer-motion";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { IconStar } from "@tabler/icons-react";

interface BreakdownItem {
  value: string;
  count: number;
  percentage: number;
}

interface FieldBreakdown {
  fieldId: string;
  fieldLabel: string;
  fieldType: string;
  totalResponses: number;
  totalAnswered: number;
  totalSkipped: number;
  skipRate: number;
  breakdown: BreakdownItem[];
  averageRating?: number;
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(221 83% 68%)",
  "hsl(258 90% 70%)",
  "hsl(30 90% 65%)",
  "hsl(160 84% 45%)",
  "hsl(0 72% 60%)",
];

function SelectFieldCard({ field, index }: { field: FieldBreakdown; index: number }) {
  const pieData = field.breakdown.slice(0, 6).map((b, i) => ({
    name: b.value,
    value: b.count,
    color: CHART_COLORS[i % CHART_COLORS.length]!,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.48 + index * 0.06 }}
    >
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {field.fieldLabel}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {field.totalAnswered} answered · {field.skipRate}% skipped
          </p>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4">
          {/* Donut chart */}
          <div className="shrink-0">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={32}
                  outerRadius={52}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  animationBegin={0}
                  animationDuration={700}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "11px",
                  }}
                  formatter={(v: unknown, name: unknown) => [`${v as number} (${field.breakdown.find(b => b.value === name)?.percentage ?? 0}%)`, name as string]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            {field.breakdown.slice(0, 5).map((item, i) => (
              <div key={item.value} className="flex items-center gap-2 text-xs">
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                />
                <span className="truncate text-foreground">{item.value}</span>
                <span className="ml-auto shrink-0 text-muted-foreground font-medium">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function RatingFieldCard({ field, index }: { field: FieldBreakdown; index: number }) {
  const barData = field.breakdown
    .map((b) => ({ label: `★ ${b.value}`, count: b.count, percentage: b.percentage }))
    .reverse();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.48 + index * 0.06 }}
    >
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {field.fieldLabel}
          </CardTitle>
          {field.averageRating !== undefined && (
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              <IconStar className="size-4 text-amber-400 fill-amber-400" />
              <span>{field.averageRating}</span>
              <span className="text-muted-foreground font-normal">avg rating</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={barData} layout="vertical" margin={{ left: 8, right: 8, top: 0, bottom: 0 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} allowDecimals={false} />
              <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={32} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                formatter={(v: unknown) => [v as number, "Responses"]}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} animationDuration={600} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TextFieldCard({ field, index }: { field: FieldBreakdown; index: number }) {
  const pct = field.totalResponses > 0
    ? Math.round((field.totalAnswered / field.totalResponses) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.48 + index * 0.06 }}
    >
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {field.fieldLabel}
          </CardTitle>
          <p className="text-xs text-muted-foreground">{field.totalAnswered} of {field.totalResponses} answered</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Response rate</span>
              <span className="font-semibold">{pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 + index * 0.06 }}
              />
            </div>
            {field.skipRate > 30 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 pt-1">
                💡 {field.skipRate}% skip rate — consider if this field is necessary
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface FieldBreakdownSectionProps {
  breakdown: FieldBreakdown[];
  isLoading?: boolean;
}

export function FieldBreakdownSection({ breakdown, isLoading }: FieldBreakdownSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-32 w-full rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!breakdown || breakdown.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold px-1">Question Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {breakdown.map((field, i) => {
          if (field.fieldType === "SINGLE_SELECT" || field.fieldType === "MULTI_SELECT") {
            return <SelectFieldCard key={field.fieldId} field={field} index={i} />;
          }
          if (field.fieldType === "RATING") {
            return <RatingFieldCard key={field.fieldId} field={field} index={i} />;
          }
          return <TextFieldCard key={field.fieldId} field={field} index={i} />;
        })}
      </div>
    </div>
  );
}
