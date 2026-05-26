import { z } from "zod";

// ─── Shared ───────────────────────────────────────────────────────────────────

export const dateRangeModel = z.enum(["7d", "30d", "all"]).describe("Time window for filtering");

// ─── getSummary ───────────────────────────────────────────────────────────────

export const analyticsSummaryInputModel = z.object({
  formId: z.string().uuid().describe("Form to get summary for"),
  dateRange: dateRangeModel.optional().default("all"),
});

export const analyticsSummaryOutputModel = z.object({
  totalResponses: z.number().describe("Total number of submissions"),
  completionRate: z.number().describe("Percentage of respondents who completed the form"),
  avgCompletionSeconds: z.number().describe("Average seconds to fill the form"),
  responsesToday: z.number().describe("Responses submitted today"),
  responsesThisWeek: z.number().describe("Responses submitted this week"),
  lastResponseAt: z.string().nullable().describe("ISO timestamp of most recent response"),
  trendPercentage: z.number().describe("Percentage change vs previous equal period"),
});

// ─── getFieldBreakdown ────────────────────────────────────────────────────────

export const fieldBreakdownInputModel = z.object({
  formId: z.string().uuid().describe("Form to get field breakdown for"),
});

const fieldBreakdownItemModel = z.object({
  value: z.string(),
  count: z.number(),
  percentage: z.number(),
});

const fieldBreakdownModel = z.object({
  fieldId: z.string(),
  fieldLabel: z.string(),
  fieldType: z.string(),
  totalResponses: z.number(),
  totalAnswered: z.number(),
  totalSkipped: z.number(),
  skipRate: z.number(),
  breakdown: z.array(fieldBreakdownItemModel),
  averageRating: z.number().optional(),
});

export const fieldBreakdownOutputModel = z.array(fieldBreakdownModel);

// ─── getResponsesOverTime ─────────────────────────────────────────────────────

export const responsesOverTimeInputModel = z.object({
  formId: z.string().uuid().describe("Form to get time series for"),
  dateRange: dateRangeModel.optional().default("30d"),
});

export const responsesOverTimeOutputModel = z.array(
  z.object({
    date: z.string().describe("YYYY-MM-DD"),
    count: z.number(),
  })
);

// ─── getResponsesByDay ────────────────────────────────────────────────────────

export const responsesByDayInputModel = z.object({
  formId: z.string().uuid().describe("Form to get day-of-week distribution for"),
});

export const responsesByDayOutputModel = z.array(
  z.object({
    day: z.string().describe("Mon | Tue | ... | Sun"),
    count: z.number(),
  })
);

// ─── getRecentResponses ───────────────────────────────────────────────────────

export const recentResponsesInputModel = z.object({
  formId: z.string().uuid().describe("Form to get recent responses for"),
  limit: z.number().int().min(1).max(50).optional().default(10),
});

export const recentResponsesOutputModel = z.array(
  z.object({
    id: z.string(),
    submittedAt: z.string(),
    fields: z.array(
      z.object({
        fieldId: z.string(),
        fieldLabel: z.string(),
        value: z.string(),
      })
    ),
  })
);

// ─── getOverview (all-forms) ──────────────────────────────────────────────────

export const overviewInputModel = z.object({});

const formOverviewItemModel = z.object({
  formId: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  slug: z.string().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  totalResponses: z.number(),
  lastResponseAt: z.string().nullable(),
  sparkline: z.array(z.number()).length(7),
  createdAt: z.string(),
});

export const overviewOutputModel = z.object({
  globalTotalForms: z.number(),
  globalActiveForms: z.number(),
  globalTotalResponses: z.number(),
  globalThisWeek: z.number(),
  globalTrendPercentage: z.number(),
  forms: z.array(formOverviewItemModel),
});

