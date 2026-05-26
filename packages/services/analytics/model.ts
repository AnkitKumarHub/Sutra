import { z } from "zod";

// ─── Input Schemas ────────────────────────────────────────────────────────────

export const dateRangeSchema = z.enum(["7d", "30d", "all"]);
export type DateRange = z.infer<typeof dateRangeSchema>;

export const getSummaryInput = z.object({
  formId: z.string().uuid(),
  userId: z.string().uuid(),
  dateRange: dateRangeSchema.optional().default("all"),
});
export type GetSummaryInputType = z.infer<typeof getSummaryInput>;

export const getFieldBreakdownInput = z.object({
  formId: z.string().uuid(),
  userId: z.string().uuid(),
});
export type GetFieldBreakdownInputType = z.infer<typeof getFieldBreakdownInput>;

export const getResponsesOverTimeInput = z.object({
  formId: z.string().uuid(),
  userId: z.string().uuid(),
  dateRange: dateRangeSchema.optional().default("30d"),
});
export type GetResponsesOverTimeInputType = z.infer<typeof getResponsesOverTimeInput>;

export const getResponsesByDayInput = z.object({
  formId: z.string().uuid(),
  userId: z.string().uuid(),
});
export type GetResponsesByDayInputType = z.infer<typeof getResponsesByDayInput>;

export const getRecentResponsesInput = z.object({
  formId: z.string().uuid(),
  userId: z.string().uuid(),
  limit: z.number().int().min(1).max(50).optional().default(10),
});
export type GetRecentResponsesInputType = z.infer<typeof getRecentResponsesInput>;

// ─── Output Types ─────────────────────────────────────────────────────────────

export interface AnalyticsSummary {
  totalResponses: number;
  completionRate: number;        // percentage 0-100
  avgCompletionSeconds: number;  // average seconds to fill
  responsesToday: number;
  responsesThisWeek: number;
  lastResponseAt: string | null; // ISO date string
  trendPercentage: number;       // % change vs previous equal period
}

export interface FieldBreakdownItem {
  value: string;
  count: number;
  percentage: number;
}

export interface FieldBreakdown {
  fieldId: string;
  fieldLabel: string;
  fieldType: string;
  totalResponses: number;
  totalAnswered: number;
  totalSkipped: number;
  skipRate: number;       // percentage 0-100
  breakdown: FieldBreakdownItem[];
  averageRating?: number; // only for RATING fields
}

export interface TimeSeriesPoint {
  date: string;  // ISO date string (YYYY-MM-DD)
  count: number;
}

export interface DayPoint {
  day: string;   // "Mon" | "Tue" | ... | "Sun"
  count: number;
}

export interface RecentResponseField {
  fieldId: string;
  fieldLabel: string;
  value: string; // stringified for display
}

export interface RecentResponse {
  id: string;
  submittedAt: string; // ISO date string
  fields: RecentResponseField[];
}

// ─── Overview (all-forms summary) ─────────────────────────────────────────────

export const getOverviewInput = z.object({
  userId: z.string().uuid(),
});
export type GetOverviewInputType = z.infer<typeof getOverviewInput>;

export interface FormOverviewItem {
  formId: string;
  title: string;
  description: string | null;
  slug: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  totalResponses: number;
  lastResponseAt: string | null;  // ISO date string
  sparkline: number[];            // last-7-days daily counts
  createdAt: string;              // ISO date string
}

export interface AnalyticsOverview {
  globalTotalForms: number;
  globalActiveForms: number;      // published + had response in last 30d
  globalTotalResponses: number;
  globalThisWeek: number;
  globalTrendPercentage: number;  // this week vs last week
  forms: FormOverviewItem[];
}

