import { trpc } from "~/trpc/client";

// ─── Summary ─────────────────────────────────────────────────────────────────

export const useAnalyticsSummary = (
  formId: string,
  dateRange: "7d" | "30d" | "all" = "all"
) => {
  const { data: summary, error, isFetching, isLoading, refetch } =
    trpc.analytics.getSummary.useQuery(
      { formId, dateRange },
      { enabled: Boolean(formId) }
    );

  return { summary, error, isFetching, isLoading, refetch };
};

// ─── Field Breakdown ──────────────────────────────────────────────────────────

export const useFieldBreakdown = (formId: string) => {
  const { data: breakdown, error, isFetching, isLoading, refetch } =
    trpc.analytics.getFieldBreakdown.useQuery(
      { formId },
      { enabled: Boolean(formId) }
    );

  return { breakdown, error, isFetching, isLoading, refetch };
};

// ─── Responses Over Time ──────────────────────────────────────────────────────

export const useResponsesOverTime = (
  formId: string,
  dateRange: "7d" | "30d" | "all" = "30d"
) => {
  const { data: timeSeries, error, isFetching, isLoading } =
    trpc.analytics.getResponsesOverTime.useQuery(
      { formId, dateRange },
      { enabled: Boolean(formId) }
    );

  return { timeSeries, error, isFetching, isLoading };
};

// ─── Responses By Day ─────────────────────────────────────────────────────────

export const useResponsesByDay = (formId: string) => {
  const { data: dayData, error, isFetching, isLoading } =
    trpc.analytics.getResponsesByDay.useQuery(
      { formId },
      { enabled: Boolean(formId) }
    );

  return { dayData, error, isFetching, isLoading };
};

// ─── Recent Responses ─────────────────────────────────────────────────────────

export const useRecentResponses = (formId: string, limit = 10) => {
  const { data: recent, error, isFetching, isLoading, refetch } =
    trpc.analytics.getRecentResponses.useQuery(
      { formId, limit },
      { enabled: Boolean(formId) }
    );

  return { recent, error, isFetching, isLoading, refetch };
};

// ─── Overview (all-forms) ─────────────────────────────────────────────────────

export const useAnalyticsOverview = () => {
  const { data: overview, error, isFetching, isLoading, refetch } =
    trpc.analytics.getOverview.useQuery({});

  return { overview, error, isFetching, isLoading, refetch };
};

