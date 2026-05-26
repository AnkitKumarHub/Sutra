"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import CountUp from "react-countup"
import {
  IconClipboardText,
  IconCircleCheck,
  IconChartBar,
  IconTrendingUp,
  IconTrendingDown,
  IconPlus,
  IconLayoutGrid,
  IconEdit,
} from "@tabler/icons-react"

import { useUser } from "~/hooks/api/auth"
import { useAnalyticsOverview } from "~/hooks/api/analytics"
import { Skeleton } from "~/components/ui/skeleton"
import { Sparkline } from "~/app/dashboard/analytics/components/sparkline"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
  PUBLISHED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  DRAFT: "bg-muted text-muted-foreground border-border",
  ARCHIVED: "bg-amber-500/10 text-amber-600 border-amber-500/20",
}

const STATUS_LABEL: Record<string, string> = {
  PUBLISHED: "Published",
  DRAFT: "Draft",
  ARCHIVED: "Archived",
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KPICardProps {
  label: string
  value: number
  icon: React.ElementType
  trend?: number
  subtitle?: string
  index: number
  isLoading?: boolean
}

function KPICard({ label, value, icon: Icon, trend, subtitle, index, isLoading }: KPICardProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
        <Skeleton className="h-3.5 w-20 mb-4" />
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-24" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
      className="rounded-xl border border-border/60 bg-card p-5 shadow-sm flex flex-col gap-3 cursor-default"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <Icon className="size-4 text-muted-foreground/60" />
      </div>
      <div className="flex items-end gap-3">
        <p className="text-3xl font-semibold tabular-nums tracking-tight">
          <CountUp end={value} duration={0.8} separator="," />
        </p>
        {trend !== undefined && (
          <span
            className={`flex items-center gap-0.5 text-xs font-medium mb-1 ${
              trend >= 0 ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {trend >= 0 ? (
              <IconTrendingUp className="size-3.5" />
            ) : (
              <IconTrendingDown className="size-3.5" />
            )}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      )}
    </motion.div>
  )
}

// ─── Quick Action Card ─────────────────────────────────────────────────────────

function QuickActionCard({
  href,
  icon: Icon,
  label,
  description,
  index,
}: {
  href: string
  icon: React.ElementType
  label: string
  description: string
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.28 + index * 0.04, ease: "easeOut" }}
    >
      <Link
        href={href}
        className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4 hover:bg-muted/40 hover:border-border transition-colors group"
      >
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/8 text-primary group-hover:bg-primary/12 transition-colors shrink-0">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium leading-snug">{label}</p>
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        </div>
      </Link>
    </motion.div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="flex flex-col items-center justify-center py-16 gap-4 text-center"
    >
      <span className="text-5xl select-none" aria-hidden>📋</span>
      <div className="space-y-1">
        <p className="text-base font-medium">Create your first form</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          Share a link, collect responses, and see results — all in one place.
        </p>
      </div>
      <Link
        href="/dashboard/forms"
        className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <IconPlus className="size-4" />
        Create Form
      </Link>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useUser()
  const { overview, isLoading } = useAnalyticsOverview()

  const firstName = user?.fullName?.split(" ")[0] ?? ""
  const forms = overview?.forms ?? []
  const recentForms = forms.slice(0, 5)

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 px-4 lg:px-6 py-6 max-w-5xl mx-auto w-full space-y-8">

        {/* ── Greeting ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here&apos;s an overview of your forms.
          </p>
        </motion.div>

        {/* ── KPI Cards ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KPICard
            label="Total Forms"
            value={overview?.globalTotalForms ?? 0}
            icon={IconClipboardText}
            index={0}
            isLoading={isLoading}
          />
          <KPICard
            label="Active Forms"
            value={overview?.globalActiveForms ?? 0}
            icon={IconCircleCheck}
            index={1}
            isLoading={isLoading}
          />
          <KPICard
            label="Total Responses"
            value={overview?.globalTotalResponses ?? 0}
            icon={IconChartBar}
            index={2}
            isLoading={isLoading}
          />
          <KPICard
            label="This Week"
            value={overview?.globalThisWeek ?? 0}
            icon={IconTrendingUp}
            trend={overview?.globalTrendPercentage}
            index={3}
            isLoading={isLoading}
          />
        </div>

        {/* ── Quick Actions ──────────────────────────────────────── */}
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.24 }}
            className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3"
          >
            Quick Actions
          </motion.p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <QuickActionCard
              href="/dashboard/forms"
              icon={IconPlus}
              label="Create Form"
              description="Start collecting responses"
              index={0}
            />
            <QuickActionCard
              href="/dashboard/analytics"
              icon={IconChartBar}
              label="View Analytics"
              description="Insights across all forms"
              index={1}
            />
            <QuickActionCard
              href="/dashboard/forms"
              icon={IconLayoutGrid}
              label="All Forms"
              description="Manage your form library"
              index={2}
            />
          </div>
        </div>

        {/* ── Recent Forms ───────────────────────────────────────── */}
        <div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.38 }}
            className="flex items-center justify-between mb-3"
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Recent Forms
            </p>
            {forms.length > 5 && (
              <Link
                href="/dashboard/forms"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                View all →
              </Link>
            )}
          </motion.div>

          {isLoading ? (
            <div className="rounded-xl border border-border/60 overflow-hidden divide-y divide-border/30">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3.5">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : recentForms.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="rounded-xl border border-border/60 overflow-hidden divide-y divide-border/30">
              {recentForms.map((form, i) => (
                <motion.div
                  key={form.formId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.42 + i * 0.05 }}
                  className="flex items-center gap-4 px-4 py-3.5 hover:bg-muted/20 transition-colors group"
                >
                  {/* Title + badge */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/dashboard/forms/${form.formId}`}
                        className="text-sm font-medium hover:underline underline-offset-2 truncate max-w-[200px]"
                      >
                        {form.title}
                      </Link>
                      <span
                        className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium shrink-0 ${STATUS_BADGE[form.status] ?? ""}`}
                      >
                        {STATUS_LABEL[form.status] ?? form.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {form.totalResponses} {form.totalResponses === 1 ? "response" : "responses"}
                      {form.lastResponseAt && (
                        <span> · Last {new Date(form.lastResponseAt).toLocaleDateString()}</span>
                      )}
                    </p>
                  </div>

                  {/* Sparkline */}
                  {form.sparkline && form.sparkline.length > 0 && (
                    <div className="shrink-0 hidden sm:block">
                      <Sparkline data={form.sparkline} />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/dashboard/analytics/${form.formId}`}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <IconChartBar className="size-3" />
                      Analytics
                    </Link>
                    <Link
                      href={`/dashboard/forms/${form.formId}`}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <IconEdit className="size-3" />
                      Edit
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
