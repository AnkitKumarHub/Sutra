import { analyticsService } from "../../services";
import { authenticatedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  analyticsSummaryInputModel,
  analyticsSummaryOutputModel,
  fieldBreakdownInputModel,
  fieldBreakdownOutputModel,
  responsesOverTimeInputModel,
  responsesOverTimeOutputModel,
  responsesByDayInputModel,
  responsesByDayOutputModel,
  recentResponsesInputModel,
  recentResponsesOutputModel,
  overviewInputModel,
  overviewOutputModel,
} from "./model";

const TAGS = ["Analytics"];
const getPath = generatePath("/analytics");

export const analyticsRouter = router({
  /** Overall form stats: totals, trend, avg fill time */
  getSummary: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/summary"),
        tags: TAGS,
        protect: true,
        summary: "Get analytics summary for a form",
      },
    })
    .input(analyticsSummaryInputModel)
    .output(analyticsSummaryOutputModel)
    .query(async ({ input, ctx }) => {
      return analyticsService.getSummary({
        formId: input.formId,
        userId: ctx.user.id,
        dateRange: input.dateRange,
      });
    }),

  /** Per-field value distribution breakdown */
  getFieldBreakdown: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/field-breakdown"),
        tags: TAGS,
        protect: true,
        summary: "Get per-field answer distribution for a form",
      },
    })
    .input(fieldBreakdownInputModel)
    .output(fieldBreakdownOutputModel)
    .query(async ({ input, ctx }) => {
      return analyticsService.getFieldBreakdown({
        formId: input.formId,
        userId: ctx.user.id,
      });
    }),

  /** Time series: responses grouped by day */
  getResponsesOverTime: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/over-time"),
        tags: TAGS,
        protect: true,
        summary: "Get response count time series (grouped by day)",
      },
    })
    .input(responsesOverTimeInputModel)
    .output(responsesOverTimeOutputModel)
    .query(async ({ input, ctx }) => {
      return analyticsService.getResponsesOverTime({
        formId: input.formId,
        userId: ctx.user.id,
        dateRange: input.dateRange,
      });
    }),

  /** Day-of-week distribution: Mon–Sun */
  getResponsesByDay: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/by-day"),
        tags: TAGS,
        protect: true,
        summary: "Get submission count grouped by day of week",
      },
    })
    .input(responsesByDayInputModel)
    .output(responsesByDayOutputModel)
    .query(async ({ input, ctx }) => {
      return analyticsService.getResponsesByDay({
        formId: input.formId,
        userId: ctx.user.id,
      });
    }),

  /** Latest N submissions with field labels */
  getRecentResponses: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/recent"),
        tags: TAGS,
        protect: true,
        summary: "Get the most recent form responses",
      },
    })
    .input(recentResponsesInputModel)
    .output(recentResponsesOutputModel)
    .query(async ({ input, ctx }) => {
      return analyticsService.getRecentResponses({
        formId: input.formId,
        userId: ctx.user.id,
        limit: input.limit,
      });
    }),

  /** All-forms overview: global KPIs + per-form sparklines */
  getOverview: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/overview"),
        tags: TAGS,
        protect: true,
        summary: "Get analytics overview across all forms",
      },
    })
    .input(overviewInputModel)
    .output(overviewOutputModel)
    .query(async ({ ctx }) => {
      return analyticsService.getOverview({
        userId: ctx.user.id,
      });
    }),
});
