"use client";

import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { IconStarFilled } from "@tabler/icons-react";

interface FieldBreakdownItem {
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
  breakdown: FieldBreakdownItem[];
  averageRating?: number;
}

interface FieldBreakdownSectionProps {
  breakdown: FieldBreakdown[];
  isLoading?: boolean;
}

// Donut chart for SELECT fields
function SelectFieldCard({ field }: { field: FieldBreakdown }) {
  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--primary)/0.7)",
    "hsl(var(--primary)/0.5)",
    "hsl(var(--primary)/0.35)",
    "hsl(var(--muted-foreground)/0.4)",
  ];

  const pieData = field.breakdown.slice(0, 5).map((b) => ({
    name: b.value,
    value: b.count,
    percentage: b.percentage,
  }));

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
      {pieData.length > 0 ? (
        <>
          <div className="shrink-0">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={62}
                  paddingAngle={2}
                  dataKey="value"
                  animationDuration={600}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "11px",
                  }}
                  formatter={(v: unknown, name: unknown) => [`${v as number} (${field.breakdown.find((b) => b.value === name)?.percentage ?? 0}%)`, name as string]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2 justify-center flex-1">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span
                  className="size-2.5 rounded-full shrink-0"
                  style={{ background: COLORS[i % COLORS.length] }}
                />
                <span className="truncate flex-1 text-xs">{item.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-xs text-muted-foreground italic">No answers yet.</p>
      )}
    </div>
  );
}

// Horizontal bar chart for RATING fields
function RatingFieldCard({ field }: { field: FieldBreakdown }) {
  const ratingData = [1, 2, 3, 4, 5].map((star) => {
    const found = field.breakdown.find((b) => b.value === String(star));
    return { label: `★${star}`, count: found?.count ?? 0 };
  });

  return (
    <div className="flex flex-col gap-3">
      {field.averageRating !== undefined && (
        <div className="flex items-center gap-2">
          <span className="text-2xl font-semibold tabular-nums">{field.averageRating}</span>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((s) => (
              <IconStarFilled
                key={s}
                className={`size-4 ${
                  s <= Math.round(field.averageRating ?? 0)
                    ? "text-amber-400"
                    : "text-muted-foreground/20"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">avg rating</span>
        </div>
      )}
      <ResponsiveContainer width="100%" height={130}>
        <BarChart
          data={ratingData}
          layout="vertical"
          margin={{ top: 0, right: 4, bottom: 0, left: 4 }}
        >
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={32} />
          <Tooltip
            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
            formatter={(v: unknown) => [v as number, "Responses"]}
          />
          <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} animationDuration={600} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Progress bars for TEXT/other fields
function TextFieldCard({ field }: { field: FieldBreakdown }) {
  const answeredPct = field.totalResponses > 0
    ? Math.round((field.totalAnswered / field.totalResponses) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Response rate</span>
        <span className="font-medium tabular-nums">{answeredPct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${answeredPct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full bg-primary"
        />
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>{field.totalAnswered} answered</span>
        {field.totalSkipped > 0 && <span>{field.totalSkipped} skipped</span>}
      </div>
    </div>
  );
}

export function FieldBreakdownSection({ breakdown, isLoading }: FieldBreakdownSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {breakdown.map((field, i) => {
        const isSelect = field.fieldType === "SINGLE_SELECT" || field.fieldType === "MULTI_SELECT";
        const isRating = field.fieldType === "RATING";

        return (
          <motion.div
            key={field.fieldId}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <CardTitle className="text-sm font-medium">{field.fieldLabel}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {field.totalAnswered}/{field.totalResponses} answered
                      {field.skipRate > 0 && ` · ${field.skipRate}% skipped`}
                    </p>
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide border border-border/60 rounded px-1.5 py-0.5 shrink-0">
                    {field.fieldType.replace(/_/g, " ")}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {isSelect ? (
                  <SelectFieldCard field={field} />
                ) : isRating ? (
                  <RatingFieldCard field={field} />
                ) : (
                  <TextFieldCard field={field} />
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
