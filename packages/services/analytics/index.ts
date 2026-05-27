import { and, db, desc, eq, gte, sql } from "@repo/database";
import { formFieldsTable } from "@repo/database/models/form-field";
import { formSubmissionTable } from "@repo/database/models/form-submission";
import { formTables } from "@repo/database/models/form";

import {
  type GetSummaryInputType,
  type GetFieldBreakdownInputType,
  type GetResponsesOverTimeInputType,
  type GetResponsesByDayInputType,
  type GetRecentResponsesInputType,
  type GetOverviewInputType,
  type AnalyticsSummary,
  type FieldBreakdown,
  type TimeSeriesPoint,
  type DayPoint,
  type RecentResponse,
  type AnalyticsOverview,
  type FormOverviewItem,
  getSummaryInput,
  getFieldBreakdownInput,
  getResponsesOverTimeInput,
  getResponsesByDayInput,
  getRecentResponsesInput,
  getOverviewInput,
} from "./model";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function getDateRangeCutoff(dateRange: "7d" | "30d" | "all"): Date | null {
  if (dateRange === "all") return null;
  const days = dateRange === "7d" ? 7 : 30;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  cutoff.setHours(0, 0, 0, 0);
  return cutoff;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

class AnalyticsService {
  /** Verify form ownership — throws if not found */
  private async assertOwnership(formId: string, userId: string) {
    const [form] = await db
      .select({ id: formTables.id })
      .from(formTables)
      .where(and(eq(formTables.id, formId), eq(formTables.createdBy, userId)))
      .limit(1);

    if (!form) {
      throw new Error(`Form not found or access denied`);
    }
    return form;
  }

  // ─── 1. getSummary ────────────────────────────────────────────────────────
  public async getSummary(payload: GetSummaryInputType): Promise<AnalyticsSummary> {
    const { formId, userId, dateRange } = await getSummaryInput.parseAsync(payload);
    await this.assertOwnership(formId, userId);

    const cutoff = getDateRangeCutoff(dateRange);

    // Fetch all submissions (optionally filtered by date range)
    const submissionsQuery = db
      .select({
        id: formSubmissionTable.id,
        createdAt: formSubmissionTable.createdAt,
        startedAt: formSubmissionTable.startedAt,
        values: formSubmissionTable.values,
      })
      .from(formSubmissionTable)
      .where(
        cutoff
          ? and(
              eq(formSubmissionTable.formId, formId),
              gte(formSubmissionTable.createdAt, cutoff)
            )
          : eq(formSubmissionTable.formId, formId)
      )
      .orderBy(desc(formSubmissionTable.createdAt));

    const submissions = await submissionsQuery;
    const totalResponses = submissions.length;

    // Compute avg completion time (only for submissions that have startedAt)
    const completionTimes = submissions
      .filter((s) => s.startedAt && s.createdAt)
      .map((s) => {
        const diffMs = (s.createdAt?.getTime() ?? 0) - (s.startedAt?.getTime() ?? 0);
        return diffMs > 0 ? diffMs / 1000 : 0; // convert to seconds
      });

    const avgCompletionSeconds =
      completionTimes.length > 0
        ? Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length)
        : 0;

    // Responses today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const responsesToday = submissions.filter(
      (s) => s.createdAt && s.createdAt >= todayStart
    ).length;

    // Responses this week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);
    const responsesThisWeek = submissions.filter(
      (s) => s.createdAt && s.createdAt >= weekStart
    ).length;

    // Last response
    const lastResponseAt =
      submissions[0]?.createdAt?.toISOString() ?? null;

    // Trend: compare current period vs previous equal period
    let trendPercentage = 0;
    if (dateRange !== "all" && totalResponses >= 0) {
      const days = dateRange === "7d" ? 7 : 30;
      const prevCutoff = new Date();
      prevCutoff.setDate(prevCutoff.getDate() - days * 2);
      prevCutoff.setHours(0, 0, 0, 0);

      const currentCutoff = cutoff!;
      const prevSubmissions = await db
        .select({ id: formSubmissionTable.id })
        .from(formSubmissionTable)
        .where(
          and(
            eq(formSubmissionTable.formId, formId),
            gte(formSubmissionTable.createdAt, prevCutoff),
            sql`${formSubmissionTable.createdAt} < ${currentCutoff}`
          )
        );

      const prevCount = prevSubmissions.length;
      if (prevCount === 0) {
        trendPercentage = totalResponses > 0 ? 100 : 0;
      } else {
        trendPercentage = Math.round(((totalResponses - prevCount) / prevCount) * 100);
      }
    }

    // Completion rate: % of submissions that have at least one value (all were validated on submit)
    // Since server validates required fields, every stored submission is "complete"
    // We approximate: completionRate = 100% if any submissions exist
    const completionRate = totalResponses > 0 ? 100 : 0;

    return {
      totalResponses,
      completionRate,
      avgCompletionSeconds,
      responsesToday,
      responsesThisWeek,
      lastResponseAt,
      trendPercentage,
    };
  }

  // ─── 2. getFieldBreakdown ─────────────────────────────────────────────────
  public async getFieldBreakdown(payload: GetFieldBreakdownInputType): Promise<FieldBreakdown[]> {
    const { formId, userId } = await getFieldBreakdownInput.parseAsync(payload);
    await this.assertOwnership(formId, userId);

    // Get all fields for the form
    const fields = await db
      .select({
        id: formFieldsTable.id,
        label: formFieldsTable.label,
        type: formFieldsTable.type,
        isRequired: formFieldsTable.isRequired,
        options: formFieldsTable.config,
      })
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(formFieldsTable.index);

    if (fields.length === 0) return [];

    // Get all submissions
    const submissions = await db
      .select({ values: formSubmissionTable.values })
      .from(formSubmissionTable)
      .where(eq(formSubmissionTable.formId, formId));

    const totalSubmissions = submissions.length;
    if (totalSubmissions === 0) {
      return fields.map((f) => ({
        fieldId: f.id,
        fieldLabel: f.label,
        fieldType: f.type,
        totalResponses: 0,
        totalAnswered: 0,
        totalSkipped: 0,
        skipRate: 0,
        breakdown: [],
      }));
    }

    const results: FieldBreakdown[] = [];

    for (const field of fields) {
      const valueCounts = new Map<string, number>();
      let totalAnswered = 0;

      for (const sub of submissions) {
        const entry = (sub.values ?? []).find((v) => v.fieldId === field.id);
        const val = entry?.value;

        const isEmpty =
          val === undefined ||
          val === null ||
          (typeof val === "string" && val.trim() === "") ||
          (Array.isArray(val) && val.length === 0);

        if (!isEmpty) {
          totalAnswered++;

          // Only build distribution for select/rating/checkbox — not free text
          if (
            field.type === "SINGLE_SELECT" ||
            field.type === "RATING" ||
            field.type === "CHECKBOX"
          ) {
            const key = formatValue(val);
            valueCounts.set(key, (valueCounts.get(key) ?? 0) + 1);
          } else if (field.type === "MULTI_SELECT" && Array.isArray(val)) {
            for (const item of val) {
              const key = String(item);
              valueCounts.set(key, (valueCounts.get(key) ?? 0) + 1);
            }
          }
        }
      }

      const totalSkipped = totalSubmissions - totalAnswered;
      const skipRate =
        totalSubmissions > 0
          ? Math.round((totalSkipped / totalSubmissions) * 100)
          : 0;

      // Build breakdown sorted by count desc
      const breakdown = Array.from(valueCounts.entries())
        .sort(([, a], [, b]) => b - a)
        .map(([value, count]) => ({
          value,
          count,
          percentage:
            totalAnswered > 0 ? Math.round((count / totalAnswered) * 100) : 0,
        }));

      // Average rating for RATING fields
      let averageRating: number | undefined;
      if (field.type === "RATING" && totalAnswered > 0) {
        const sum = Array.from(valueCounts.entries()).reduce(
          (acc, [val, cnt]) => acc + Number(val) * cnt,
          0
        );
        averageRating = Math.round((sum / totalAnswered) * 10) / 10;
      }

      results.push({
        fieldId: field.id,
        fieldLabel: field.label,
        fieldType: field.type,
        totalResponses: totalSubmissions,
        totalAnswered,
        totalSkipped,
        skipRate,
        breakdown,
        ...(averageRating !== undefined ? { averageRating } : {}),
      });
    }

    return results;
  }

  // ─── 3. getResponsesOverTime ──────────────────────────────────────────────
  public async getResponsesOverTime(
    payload: GetResponsesOverTimeInputType
  ): Promise<TimeSeriesPoint[]> {
    const { formId, userId, dateRange } = await getResponsesOverTimeInput.parseAsync(payload);
    await this.assertOwnership(formId, userId);

    const cutoff = getDateRangeCutoff(dateRange);

    const submissions = await db
      .select({ createdAt: formSubmissionTable.createdAt })
      .from(formSubmissionTable)
      .where(
        cutoff
          ? and(
              eq(formSubmissionTable.formId, formId),
              gte(formSubmissionTable.createdAt, cutoff)
            )
          : eq(formSubmissionTable.formId, formId)
      );

    // Group by day
    const counts = new Map<string, number>();
    for (const sub of submissions) {
      if (!sub.createdAt) continue;
      const dateKey = sub.createdAt.toISOString().split("T")[0]!;
      counts.set(dateKey, (counts.get(dateKey) ?? 0) + 1);
    }

    // Fill all days in the range with zero if no submissions
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : null;
    const result: TimeSeriesPoint[] = [];

    if (days !== null) {
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split("T")[0]!;
        result.push({ date: key, count: counts.get(key) ?? 0 });
      }
    } else {
      // "all" — return actual data sorted by date
      const sortedKeys = Array.from(counts.keys()).sort();
      for (const date of sortedKeys) {
        result.push({ date, count: counts.get(date) ?? 0 });
      }
    }

    return result;
  }

  // ─── 4. getResponsesByDay ─────────────────────────────────────────────────
  public async getResponsesByDay(payload: GetResponsesByDayInputType): Promise<DayPoint[]> {
    const { formId, userId } = await getResponsesByDayInput.parseAsync(payload);
    await this.assertOwnership(formId, userId);

    const submissions = await db
      .select({ createdAt: formSubmissionTable.createdAt })
      .from(formSubmissionTable)
      .where(eq(formSubmissionTable.formId, formId));

    // Index 0 = Sun, 1 = Mon, ..., 6 = Sat
    const counts = [0, 0, 0, 0, 0, 0, 0];
    for (const sub of submissions) {
      if (!sub.createdAt) continue;
      const dow = sub.createdAt.getDay(); // 0=Sun
      counts[dow] = (counts[dow] ?? 0) + 1;
    }

    // Return Mon-Sun order
    return [1, 2, 3, 4, 5, 6, 0].map((dow) => ({
      day: DAY_LABELS[dow]!,
      count: counts[dow] ?? 0,
    }));
  }

  // ─── 5. getRecentResponses ────────────────────────────────────────────────
  public async getRecentResponses(
    payload: GetRecentResponsesInputType
  ): Promise<RecentResponse[]> {
    const { formId, userId, limit } = await getRecentResponsesInput.parseAsync(payload);
    await this.assertOwnership(formId, userId);

    const [fields, submissions] = await Promise.all([
      db
        .select({ id: formFieldsTable.id, label: formFieldsTable.label })
        .from(formFieldsTable)
        .where(eq(formFieldsTable.formId, formId))
        .orderBy(formFieldsTable.index),

      db
        .select({
          id: formSubmissionTable.id,
          createdAt: formSubmissionTable.createdAt,
          values: formSubmissionTable.values,
        })
        .from(formSubmissionTable)
        .where(eq(formSubmissionTable.formId, formId))
        .orderBy(desc(formSubmissionTable.createdAt))
        .limit(limit),
    ]);

    const fieldMap = new Map(fields.map((f) => [f.id, f.label]));

    return submissions.map((sub) => ({
      id: sub.id,
      submittedAt: sub.createdAt?.toISOString() ?? new Date().toISOString(),
      fields: (sub.values ?? [])
        .filter((v) => fieldMap.has(v.fieldId))
        .map((v) => ({
          fieldId: v.fieldId,
          fieldLabel: fieldMap.get(v.fieldId) ?? v.fieldId,
          value: formatValue(v.value),
        })),
    }));
  }
  // ─── 6. getOverview (all forms) ───────────────────────────────────────────
  public async getOverview(payload: GetOverviewInputType): Promise<AnalyticsOverview> {
    const { userId } = await getOverviewInput.parseAsync(payload);

    // Fetch all user's non-deleted forms
    const forms = await db
      .select({
        id: formTables.id,
        title: formTables.title,
        description: formTables.description,
        slug: formTables.slug,
        status: formTables.status,
        createdAt: formTables.createdAt,
      })
      .from(formTables)
      .where(
        and(
          eq(formTables.createdBy, userId),
          sql`${formTables.deletedAt} IS NULL`
        )
      );

    if (forms.length === 0) {
      return {
        globalTotalForms: 0,
        globalActiveForms: 0,
        globalTotalResponses: 0,
        globalThisWeek: 0,
        globalTrendPercentage: 0,
        forms: [],
      };
    }

    const formIds = forms.map((f) => f.id);

    // Fetch all submissions for all forms in one query
    const allSubmissions = await db
      .select({
        id: formSubmissionTable.id,
        formId: formSubmissionTable.formId,
        createdAt: formSubmissionTable.createdAt,
      })
      .from(formSubmissionTable)
      .where(sql`${formSubmissionTable.formId} = ANY(${sql.raw(`ARRAY[${formIds.map((id) => `'${id}'`).join(",")}]::uuid[]`)})`);

    // Build per-form stats
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    const lastWeekStart = new Date(now);
    lastWeekStart.setDate(now.getDate() - 14);
    lastWeekStart.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // Group submissions by formId
    const submissionsByForm = new Map<string, Array<{ id: string; createdAt: Date | null }>>(); 
    for (const sub of allSubmissions) {
      if (!sub.formId) continue;
      const existing = submissionsByForm.get(sub.formId) ?? [];
      existing.push({ id: sub.id, createdAt: sub.createdAt });
      submissionsByForm.set(sub.formId, existing);
    }

    // Global stats
    let globalTotalResponses = 0;
    let globalThisWeek = 0;
    let globalLastWeek = 0;
    let globalActiveForms = 0;

    const formItems: FormOverviewItem[] = [];

    for (const form of forms) {
      const subs = submissionsByForm.get(form.id) ?? [];
      const totalResponses = subs.length;

      // Last 7 days sparkline
      const sparkline: number[] = [0, 0, 0, 0, 0, 0, 0];
      for (const sub of subs) {
        if (!sub.createdAt) continue;
        const diffDays = Math.floor((now.getTime() - sub.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 7) {
          sparkline[6 - diffDays] = (sparkline[6 - diffDays] ?? 0) + 1;
        }
      }

      // Last response
      const sortedSubs = subs
        .filter((s) => s.createdAt !== null)
        .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
      const lastResponseAt = sortedSubs[0]?.createdAt?.toISOString() ?? null;

      // Active: published + had a response in last 30d
      const hasRecentResponse = subs.some(
        (s) => s.createdAt && s.createdAt >= thirtyDaysAgo
      );
      if (form.status === "PUBLISHED" && hasRecentResponse) globalActiveForms++;

      // Global accumulation
      globalTotalResponses += totalResponses;
      globalThisWeek += subs.filter((s) => s.createdAt && s.createdAt >= weekStart).length;
      globalLastWeek += subs.filter((s) => s.createdAt && s.createdAt >= lastWeekStart && s.createdAt < weekStart).length;

      formItems.push({
        formId: form.id,
        title: form.title,
        description: form.description,
        slug: form.slug,
        status: form.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
        totalResponses,
        lastResponseAt,
        sparkline,
        createdAt: form.createdAt?.toISOString() ?? new Date().toISOString(),
      });
    }

    const globalTrendPercentage =
      globalLastWeek === 0
        ? globalThisWeek > 0 ? 100 : 0
        : Math.round(((globalThisWeek - globalLastWeek) / globalLastWeek) * 100);

    return {
      globalTotalForms: forms.length,
      globalActiveForms,
      globalTotalResponses,
      globalThisWeek,
      globalTrendPercentage,
      forms: formItems,
    };
  }
}

export default AnalyticsService;
