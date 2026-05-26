"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { IconLock, IconArrowRight } from "@tabler/icons-react"
import { toast } from "sonner"

import { useListTemplates, useCreateFromTemplate } from "~/hooks/api/form"
import { Skeleton } from "~/components/ui/skeleton"

// ─── Template Card ─────────────────────────────────────────────────────────────

interface TemplateCardProps {
  id: string
  emoji: string | null
  title: string
  description: string | null
  isPaid: boolean
  index: number
  onUse: (id: string) => Promise<void>
  isLoading: boolean
}

function TemplateCard({ id, emoji, title, description, isPaid, index, onUse, isLoading }: TemplateCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 + index * 0.06, ease: "easeOut" }}
      className="group relative rounded-xl border border-border/60 bg-card p-4 flex flex-col gap-3 hover:border-border hover:bg-muted/20 transition-all"
    >
      {/* Paid badge */}
      {isPaid && (
        <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600">
          <IconLock className="size-2.5" />
          Pro
        </span>
      )}

      {/* Emoji + Title */}
      <div className="flex items-start gap-2.5">
        <span className="text-2xl leading-none select-none" aria-hidden>
          {emoji ?? "📋"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug truncate pr-8">{title}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Action */}
      {isPaid ? (
        <button
          className="mt-auto flex items-center gap-1 text-xs text-muted-foreground cursor-default"
          onClick={() => toast.info("Upgrade to Pro to use this template")}
          type="button"
        >
          <IconLock className="size-3" />
          Pro only
        </button>
      ) : (
        <button
          onClick={() => onUse(id)}
          disabled={isLoading}
          className="mt-auto flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
          type="button"
        >
          {isLoading ? "Creating…" : "Use this template"}
          <IconArrowRight className="size-3" />
        </button>
      )}
    </motion.div>
  )
}

// ─── Skeleton Cards ────────────────────────────────────────────────────────────

function TemplateCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
      <div className="flex items-start gap-2.5">
        <Skeleton className="size-8 rounded-md shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
      <Skeleton className="h-3 w-24" />
    </div>
  )
}

// ─── Section ───────────────────────────────────────────────────────────────────

export function TemplateSection() {
  const router = useRouter()
  const { templates, isLoading: templatesLoading } = useListTemplates()
  const { createFromTemplateAsync, isPending } = useCreateFromTemplate()

  const handleUse = async (templateId: string) => {
    try {
      const { id: formId } = await createFromTemplateAsync({ templateId })
      toast.success("Form created from template!")
      router.push(`/dashboard/forms/${formId}`)
    } catch {
      toast.error("Failed to create form. Please try again.")
    }
  }

  return (
    <div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.06 }}
        className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3"
      >
        Start from a template
      </motion.p>

      {templatesLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <TemplateCardSkeleton key={i} />)}
        </div>
      ) : templates.length === 0 ? (
        <p className="text-sm text-muted-foreground">No templates available.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {templates.map((t, i) => (
            <TemplateCard
              key={t.id}
              id={t.id}
              emoji={t.emoji}
              title={t.title}
              description={t.description}
              isPaid={t.isPaid}
              index={i}
              onUse={handleUse}
              isLoading={isPending}
            />
          ))}
        </div>
      )}
    </div>
  )
}
