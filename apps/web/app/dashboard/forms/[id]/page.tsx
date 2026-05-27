"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  PencilIcon, Trash2Icon, GlobeIcon, CopyIcon,
  ShareIcon, ShieldIcon, PlusIcon, GripVerticalIcon,
  XIcon, LockIcon, LockOpenIcon,
  FileTextIcon, ClockIcon, ChevronsUpDownIcon, ChevronLeftIcon,
} from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import {
  useCreateField,
  useDeleteField,
  useGetFields,
  useUpdateField,
  useGetFormById,
  useUpdateForm,
  usePublishForm,
  useSetFormVisibility,
  useUpdateFormLimits,
  useUpdateFormNotificationSettings,
  useUnpublishForm,
  useDeleteForm,
  useSetFormPassword,
  useGetPagesByFormId,
  useCreatePage,
  useDeletePage,
  useReorderPages,
  useAssignFieldToPage,
  useReorderFields,
} from "~/hooks/api/form"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Checkbox } from "~/components/ui/checkbox"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Textarea } from "~/components/ui/textarea"
import { Collapsible, CollapsibleContent } from "~/components/ui/collapsible"

// ── Types ────────────────────────────────────────────────────────────────────

type FieldType =
  | "SHORT_TEXT" | "LONG_TEXT" | "EMAIL" | "NUMBER"
  | "SINGLE_SELECT" | "MULTI_SELECT" | "CHECKBOX" | "RATING" | "DATE"

type CreateFieldValues = {
  label: string; description?: string; placeholder?: string
  type: FieldType; isRequired: boolean;
  optionValues?: string;
  maxWords?: number;
  ratingMin?: number;
  ratingMax?: number;
  ratingStep?: number;
  dateMode?: "single" | "range";
}
type UpdateFieldValues = {
  label: string; description?: string; placeholder?: string
  type: FieldType; isRequired: boolean;
  optionValues?: string;
  maxWords?: number;
  ratingMin?: number;
  ratingMax?: number;
  ratingStep?: number;
  dateMode?: "single" | "range";
}
type PasswordFormValues = { password: string | null; unlockDurationMinutes: number }

// ── Helpers ──────────────────────────────────────────────────────────────────

const OPTION_ENABLED_TYPES: FieldType[] = ["SINGLE_SELECT", "MULTI_SELECT", "CHECKBOX", "RATING", "DATE"]
const DEFAULT_OPTION_ROWS = ["Option 1", "Option 2"]
const supportsOptionRows = (type: FieldType) => OPTION_ENABLED_TYPES.includes(type)

const buildFieldConfig = (values: CreateFieldValues | UpdateFieldValues) => {
  if (values.type === "SHORT_TEXT" || values.type === "LONG_TEXT") {
    return { maxWords: values.maxWords || undefined };
  }
  if (supportsOptionRows(values.type)) {
    return {
      options: (values.optionValues ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
  }
  return {};
};

// ── Sortable Page Item ────────────────────────────────────────────────────────

interface Page { id: string; title: string; order: number }

type FormFieldRow = {
  id: string
  label: string
  pageId: string | null
  index: string
  type: FieldType
  isRequired: boolean
  description: string | null
  placeholder: string | null
  config: {
    maxWords?: number
    options?: string[]
    min?: number
    max?: number
    step?: number
    mode?: "single" | "range"
  }
}

const sortFieldsByIndex = (list: FormFieldRow[]) =>
  [...list].sort((a, b) => parseFloat(a.index) - parseFloat(b.index))

function SortableFieldItem({
  field,
  onEdit,
  onDelete,
  isDeleting,
}: {
  field: FormFieldRow
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  isDeleting: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between gap-2 rounded-md border bg-muted/30 px-2 py-1.5 text-sm"
    >
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          className="cursor-grab text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVerticalIcon className="h-3.5 w-3.5" />
        </button>
        <span className="truncate">{field.label}</span>
      </div>
      <div className="flex items-center gap-1">
        <Button type="button" size="icon-sm" variant="outline" onClick={() => onEdit(field.id)}>
          <PencilIcon className="h-3.5 w-3.5" />
        </Button>
        <Button type="button" size="icon-sm" variant="destructive" disabled={isDeleting} onClick={() => onDelete(field.id)}>
          <Trash2Icon className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

function SortablePageItem({
  page, onDelete,
}: {
  page: Page
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: page.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-2 rounded-lg border bg-card px-3 py-2.5 shadow-sm"
    >
      <button
        type="button"
        className="cursor-grab text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="h-4 w-4" />
      </button>
      <span className="flex-1 truncate text-sm font-medium">{page.title}</span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => onDelete(page.id)}
          className="rounded p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
        >
          <XIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function FormBuilderPage() {
  const params = useParams<{ id: string }>()
  const formId = Array.isArray(params.id) ? params.id[0] : params.id
  const router = useRouter()

  // ── Data ──────────────────────────────────────────────────────────────────
  const { form, isLoading: isFormLoading } = useGetFormById(formId ?? "")
  const { fields } = useGetFields(formId ?? "")
  const { pages: serverPages, isLoading: isPagesLoading } = useGetPagesByFormId(formId ?? "")

  // Local page order for optimistic DnD
  const [localPageOrder, setLocalPageOrder] = useState<Page[] | null>(null)
  const pages: Page[] = useMemo(() => localPageOrder ?? serverPages ?? [], [localPageOrder, serverPages])

  // ── Mutations ─────────────────────────────────────────────────────────────
  const { createFieldAsync, status: createStatus } = useCreateField(formId ?? "")
  const { updateFieldAsync, status: updateStatus } = useUpdateField(formId ?? "")
  const { deleteFieldAsync, status: deleteStatus } = useDeleteField(formId ?? "")
  const { updateFormAsync, status: updateFormStatus } = useUpdateForm(formId ?? "")
  const { publishFormAsync, status: publishStatus } = usePublishForm(formId ?? "")
  const { setFormVisibilityAsync, status: visibilityStatus } = useSetFormVisibility(formId ?? "")
  const { unpublishFormAsync, status: unpublishStatus } = useUnpublishForm(formId ?? "")
  const { deleteFormAsync, status: deleteFormStatus } = useDeleteForm()
  const { mutateAsync: updateFormLimitsAsync, status: updateLimitsStatus } = useUpdateFormLimits(formId ?? "")
  const { mutateAsync: updateNotifAsync, status: updateNotifStatus } = useUpdateFormNotificationSettings(formId ?? "")
  const { setFormPasswordAsync, isPending: isSettingPassword } = useSetFormPassword(formId ?? "")
  const { createPageAsync, isPending: isCreatingPage } = useCreatePage(formId ?? "")
  const { deletePageAsync } = useDeletePage(formId ?? "")
  const { reorderPagesAsync } = useReorderPages(formId ?? "")
  const { assignFieldToPageAsync } = useAssignFieldToPage(formId ?? "")
  const { reorderFieldsAsync } = useReorderFields(formId ?? "")

  const ensuredDefaultPageRef = useRef(false)
  const migratedUnassignedRef = useRef(false)

  // ── UI State ──────────────────────────────────────────────────────────────
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [newPageTitle, setNewPageTitle] = useState("New Page")
  const [createOptions, setCreateOptions] = useState<string[]>(DEFAULT_OPTION_ROWS)
  const [editOptions, setEditOptions] = useState<string[]>(DEFAULT_OPTION_ROWS)
  const [isFormSettingsOpen, setIsFormSettingsOpen] = useState(true)
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const [localFieldOrder, setLocalFieldOrder] = useState<Record<string, string[]>>({})
  const [formTitleDraft, setFormTitleDraft] = useState("")
  const [formDescriptionDraft, setFormDescriptionDraft] = useState("")
  const [formSlugDraft, setFormSlugDraft] = useState("")

  // ── Forms ─────────────────────────────────────────────────────────────────
  const createFieldForm = useForm<CreateFieldValues>({
    defaultValues: { label: "", description: "", placeholder: "", type: "SHORT_TEXT", isRequired: false, optionValues: "", dateMode: "single", ratingMin: 1, ratingMax: 5, ratingStep: 1 },
  })
  const updateFieldForm = useForm<UpdateFieldValues>({
    defaultValues: { label: "", description: "", placeholder: "", type: "SHORT_TEXT", isRequired: false, optionValues: "", dateMode: "single", ratingMin: 1, ratingMax: 5, ratingStep: 1 },
  })
  const passwordForm = useForm<PasswordFormValues>({
    defaultValues: { password: "", unlockDurationMinutes: 30 },
  })
  const createFieldType = createFieldForm.watch("type")
  const updateFieldType = updateFieldForm.watch("type")

  // ── Memos ─────────────────────────────────────────────────────────────────
  const editingField = useMemo(() => fields?.find((f) => f.id === editingFieldId), [fields, editingFieldId])
  const selectedField = useMemo(() => fields?.find((f) => f.id === selectedFieldId) ?? null, [fields, selectedFieldId])

  const publicUrl = useMemo(() => {
    if (typeof window === "undefined") return ""
    return `${window.location.origin}/f/${form?.slug ?? ""}`
  }, [form?.slug])

  useEffect(() => {
    if (supportsOptionRows(createFieldType) && createOptions.length === 0) {
      setCreateOptions(DEFAULT_OPTION_ROWS)
    }
  }, [createFieldType, createOptions.length])

  useEffect(() => {
    if (!fields?.length) {
      setSelectedFieldId(null)
      return
    }
    if (!selectedFieldId || !fields.some((f) => f.id === selectedFieldId)) {
      setSelectedFieldId(fields[0]!.id)
    }
  }, [fields, selectedFieldId])

  useEffect(() => {
    setLocalFieldOrder({})
  }, [fields])

  useEffect(() => {
    if (!form) return
    setFormTitleDraft(form.title ?? "")
    setFormDescriptionDraft(form.description ?? "")
    setFormSlugDraft(form.slug ?? "")
  }, [form, form?.id, form?.title, form?.description, form?.slug])

  useEffect(() => {
    if (!formId || isPagesLoading || ensuredDefaultPageRef.current) return
    if (pages.length > 0) {
      ensuredDefaultPageRef.current = true
      return
    }
    ensuredDefaultPageRef.current = true
    void createPageAsync({ formId, title: "Page 1" })
  }, [formId, isPagesLoading, pages.length, createPageAsync])

  useEffect(() => {
    const firstPageId = pages[0]?.id
    if (!firstPageId || !fields || migratedUnassignedRef.current) return
    const unassigned = fields.filter((f) => !f.pageId)
    if (unassigned.length === 0) {
      migratedUnassignedRef.current = true
      return
    }
    void (async () => {
      try {
        await Promise.all(
          unassigned.map((field) => assignFieldToPageAsync({ fieldId: field.id, pageId: firstPageId })),
        )
        migratedUnassignedRef.current = true
      } catch {
        toast.error("Failed to move unassigned fields to default page")
      }
    })()
  }, [pages, fields, assignFieldToPageAsync])

  // ── Status flags ──────────────────────────────────────────────────────────
  const isCreating = createStatus === "pending"
  const isUpdating = updateStatus === "pending"
  const isDeleting = deleteStatus === "pending"
  const isUpdatingForm = updateFormStatus === "pending"
  const isTogglingPublish = publishStatus === "pending" || unpublishStatus === "pending"
  const isUpdatingVisibility = visibilityStatus === "pending"
  const isDeletingForm = deleteFormStatus === "pending"
  const isUpdatingLimits = updateLimitsStatus === "pending"
  const isUpdatingNotif = updateNotifStatus === "pending"

  // ── Slug copy ─────────────────────────────────────────────────────────────
  const handleCopyLink = useCallback(() => {
    if (!form?.slug) return
    navigator.clipboard.writeText(publicUrl)
    toast.success("Link copied!", { description: publicUrl, duration: 2500 })
  }, [form?.slug, publicUrl])

  // ── Field handlers ────────────────────────────────────────────────────────
  const handleCreateField = async (values: CreateFieldValues) => {
    if (!formId) return
    try {
      const optionValues = supportsOptionRows(values.type)
        ? createOptions.map((o) => o.trim()).filter(Boolean).join(", ")
        : values.optionValues
      const created = await createFieldAsync({
        formId, label: values.label,
        description: values.description || null,
        placeholder: values.placeholder || null,
        type: values.type, isRequired: values.isRequired,
        config: buildFieldConfig({ ...values, optionValues }),
      })
      const defaultPageId = pages[0]?.id
      if (defaultPageId) {
        await assignFieldToPageAsync({ fieldId: created.id, pageId: defaultPageId })
      }
      toast.success("Field created")
      createFieldForm.reset({ label: "", description: "", placeholder: "", type: "SHORT_TEXT", isRequired: false, optionValues: "", dateMode: "single", ratingMin: 1, ratingMax: 5, ratingStep: 1 })
      setCreateOptions(DEFAULT_OPTION_ROWS)
    } catch {
      toast.error("Failed to create field")
    }
  }

  const openEditDialog = (fieldId: string) => {
    const field = fields?.find((f) => f.id === fieldId)
    if (!field) return
    setEditingFieldId(fieldId)
    updateFieldForm.reset({
      label: field.label, description: field.description ?? "",
      placeholder: field.placeholder ?? "", type: field.type,
      isRequired: field.isRequired,
      optionValues: (field.config?.options ?? []).join(", "),
      maxWords: field.config?.maxWords,
      ratingMin: field.config?.min ?? 1,
      ratingMax: field.config?.max ?? 5,
      ratingStep: field.config?.step ?? 1,
      dateMode: field.config?.mode ?? "single",
    })
    setEditOptions((field.config?.options && field.config.options.length > 0) ? field.config.options : DEFAULT_OPTION_ROWS)
  }

  const closeEditDialog = () => {
    setEditingFieldId(null)
    updateFieldForm.reset({ label: "", description: "", placeholder: "", type: "SHORT_TEXT", isRequired: false, optionValues: "", dateMode: "single", ratingMin: 1, ratingMax: 5, ratingStep: 1 })
    setEditOptions(DEFAULT_OPTION_ROWS)
  }

  const handleUpdateField = async (values: UpdateFieldValues) => {
    if (!editingFieldId) return
    try {
      const optionValues = supportsOptionRows(values.type)
        ? editOptions.map((o) => o.trim()).filter(Boolean).join(", ")
        : values.optionValues
      await updateFieldAsync({
        fieldId: editingFieldId, label: values.label,
        description: values.description || null,
        placeholder: values.placeholder || null,
        type: values.type, isRequired: values.isRequired,
        config: buildFieldConfig({ ...values, optionValues }),
      })
      toast.success("Field updated")
      closeEditDialog()
    } catch {
      toast.error("Failed to update field")
    }
  }

  const handleDeleteField = async (fieldId: string) => {
    if (!window.confirm("Delete this field?")) return
    try {
      await deleteFieldAsync({ fieldId })
      toast.success("Field deleted")
      if (editingFieldId === fieldId) closeEditDialog()
    } catch {
      toast.error("Failed to delete field")
    }
  }

  const handleOptionRowChange = (
    target: "create" | "edit",
    index: number,
    value: string,
  ) => {
    const setter = target === "create" ? setCreateOptions : setEditOptions
    setter((prev) => prev.map((item, i) => (i === index ? value : item)))
  }

  const addOptionRow = (target: "create" | "edit") => {
    const setter = target === "create" ? setCreateOptions : setEditOptions
    setter((prev) => [...prev, `Option ${prev.length + 1}`])
  }

  const removeOptionRow = (target: "create" | "edit", index: number) => {
    const setter = target === "create" ? setCreateOptions : setEditOptions
    setter((prev) => {
      if (prev.length <= 2) return prev
      return prev.filter((_, i) => i !== index)
    })
  }

  // ── Form settings handlers ────────────────────────────────────────────────
  const saveInlineFormSettings = async (options?: { silent?: boolean }) => {
    if (!formId || !form) return
    try {
      await updateFormAsync({
        formId,
        title: formTitleDraft.trim() || form.title,
        description: formDescriptionDraft.trim() || null,
        slug: formSlugDraft.trim() || undefined,
      })
      if (!options?.silent) {
        toast.success("Form settings updated")
      }
    } catch {
      toast.error("Failed to update form settings")
    }
  }

  const handleHeaderSave = async () => {
    await saveInlineFormSettings({ silent: true })
    router.refresh()
    toast.success("Changes saved")
  }

  const handleTogglePublish = async () => {
    if (!formId || !form) return
    try {
      if (form.status === "PUBLISHED") {
        await unpublishFormAsync({ formId })
        toast.success("Form unpublished")
      } else {
        await publishFormAsync({ formId })
        toast.success("Form published! 🎉")
      }
    } catch {
      toast.error("Failed to update form status")
    }
  }

  const handleVisibilityChange = async (visibility: "PUBLIC" | "UNLISTED") => {
    if (!formId || !form) return
    if (form.visibility === visibility) return

    try {
      await setFormVisibilityAsync({ formId, visibility })
      toast.success(`Visibility set to ${visibility.toLowerCase()}`)
    } catch {
      toast.error("Failed to update form visibility")
    }
  }

  const handleDeleteForm = async () => {
    if (!formId) return
    if (!window.confirm("Are you sure you want to delete this form? This action cannot be undone.")) return
    try {
      await deleteFormAsync({ formId })
      toast.success("Form deleted")
      router.push("/dashboard/forms")
    } catch {
      toast.error("Failed to delete form")
    }
  }

  const handleToggleNotif = async (key: "notifyCreatorOnSubmission" | "sendRespondentConfirmation", value: boolean) => {
    if (!formId) return
    try {
      await updateNotifAsync({ formId, [key]: value })
      toast.success("Notification settings updated")
    } catch {
      toast.error("Failed to update notification settings")
    }
  }

  // ── Password handlers ─────────────────────────────────────────────────────
  const openPasswordDialog = () => {
    passwordForm.reset({
      password: "",
      unlockDurationMinutes: form?.unlockDurationMinutes ?? 30,
    })
    setIsPasswordDialogOpen(true)
  }

  const handleSetPassword = async (values: PasswordFormValues) => {
    if (!formId) return
    const pw = values.password === "" ? null : values.password
    try {
      await setFormPasswordAsync({
        formId,
        password: pw,
        unlockDurationMinutes: values.unlockDurationMinutes,
      })
      toast.success(pw ? "Password protection enabled" : "Password protection removed")
      setIsPasswordDialogOpen(false)
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to set password")
    }
  }

  // ── Page / DnD handlers ───────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = pages.findIndex((p) => p.id === active.id)
    const newIndex = pages.findIndex((p) => p.id === over.id)
    if (oldIndex < 0 || newIndex < 0 || !formId) return
    const reordered = arrayMove(pages, oldIndex, newIndex)
    setLocalPageOrder(reordered)

    try {
      await reorderPagesAsync({ formId, pageIds: reordered.map((p) => p.id) })
    } catch {
      setLocalPageOrder(null)
      toast.error("Failed to reorder pages")
    }
  }, [pages, formId, reorderPagesAsync])

  const handleAddPage = async () => {
    if (!formId || !newPageTitle.trim()) return
    try {
      await createPageAsync({ formId, title: newPageTitle.trim() })
      toast.success(`Page "${newPageTitle.trim()}" added`)
      setNewPageTitle("New Page")
    } catch {
      toast.error("Failed to add page")
    }
  }

  const handleDeletePage = async (pageId: string) => {
    if (!window.confirm("Delete this page? Fields on this page will become unassigned.")) return
    try {
      await deletePageAsync({ pageId })
      setLocalPageOrder(null)
      toast.success("Page deleted")
    } catch {
      toast.error("Failed to delete page")
    }
  }

  const handleFieldDragEnd = useCallback(async (pageId: string, event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id || !formId) return

    const pageFields = sortFieldsByIndex((fields ?? []).filter((f) => f.pageId === pageId))
    const oldIndex = pageFields.findIndex((f) => f.id === active.id)
    const newIndex = pageFields.findIndex((f) => f.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    const reordered = arrayMove(pageFields, oldIndex, newIndex)
    setLocalFieldOrder((prev) => ({ ...prev, [pageId]: reordered.map((f) => f.id) }))
    try {
      await reorderFieldsAsync({
        formId,
        pageId,
        fieldIds: reordered.map((f) => f.id),
      })
    } catch {
      setLocalFieldOrder((prev) => {
        const next = { ...prev }
        delete next[pageId]
        return next
      })
      toast.error("Failed to reorder fields")
    }
  }, [fields, formId, reorderFieldsAsync])

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6">

          <Link
            href="/dashboard/forms"
            className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Forms
          </Link>

          {/* ── Header Card ── */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between p-6">
              <div className="space-y-2 min-w-0">
                {isFormLoading ? (
                  <div className="h-8 w-48 animate-pulse rounded bg-muted" />
                ) : (
                  <>
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-2xl font-semibold tracking-tight truncate">{form?.title}</h1>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-xl line-clamp-2">
                      {form?.description || "No description provided."}
                    </p>
                    {/* ── Slug bar (always visible) ── */}
                    {form?.slug ? (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1.5 rounded-md border bg-muted/50 px-3 py-1.5 text-xs font-mono text-muted-foreground min-w-0 max-w-xs">
                          <GlobeIcon className="h-3 w-3 shrink-0 text-primary/60" />
                          <span className="truncate">/f/{form.slug}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyLink}
                          title="Copy public link"
                          className="flex items-center gap-1 rounded-md border bg-muted/50 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <CopyIcon className="h-3 w-3" />
                          Copy
                        </button>
                        {form.status === "PUBLISHED" && (
                          <Link
                            href={`/f/${form.slug}`}
                            target="_blank"
                            className="flex items-center gap-1 rounded-md border bg-muted/50 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          >
                            <ShareIcon className="h-3 w-3" />
                            View
                          </Link>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground/60 mt-1 italic">
                        No slug set. Add one in Form Settings.
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button variant="default" size="sm" onClick={() => void handleHeaderSave()} disabled={isUpdatingForm}>
                  Save
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/dashboard/forms/${formId}/submissions`}>
                    <FileTextIcon className="mr-1.5 h-3.5 w-3.5" />
                    Responses
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/dashboard/forms/${formId}/preview`}>
                    Preview
                  </Link>
                </Button>
                <Button variant="destructive" size="icon" className="h-8 w-8" onClick={handleDeleteForm} disabled={isDeletingForm}>
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* ── Grid ── */}
          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-4">
            <div className="space-y-6 xl:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Add Field</CardTitle>
                  <CardDescription>Create a new field for this form.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="flex flex-col gap-4" onSubmit={createFieldForm.handleSubmit(handleCreateField)}>
                    <Field>
                      <FieldLabel htmlFor="new-label">Label</FieldLabel>
                      <Input id="new-label" maxLength={100} placeholder="Full Name" required {...createFieldForm.register("label", { required: true })} />
                    </Field>
                    <Field>
                      <FieldLabel>Type</FieldLabel>
                      <Controller control={createFieldForm.control} name="type" render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full"><SelectValue placeholder="Select type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SHORT_TEXT">Short Text</SelectItem>
                            <SelectItem value="LONG_TEXT">Long Text</SelectItem>
                            <SelectItem value="NUMBER">Number</SelectItem>
                            <SelectItem value="EMAIL">Email</SelectItem>
                            <SelectItem value="SINGLE_SELECT">Single Select</SelectItem>
                            <SelectItem value="MULTI_SELECT">Multi Select</SelectItem>
                            <SelectItem value="CHECKBOX">Checkbox</SelectItem>
                            <SelectItem value="RATING">Rating</SelectItem>
                            <SelectItem value="DATE">Date</SelectItem>
                          </SelectContent>
                        </Select>
                      )} />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="new-placeholder">Placeholder</FieldLabel>
                      <Input id="new-placeholder" placeholder="Enter value" {...createFieldForm.register("placeholder")} />
                    </Field>
                    {supportsOptionRows(createFieldType) && (
                      <Field>
                        <div className="mb-2 flex items-center justify-between">
                          <FieldLabel>Options</FieldLabel>
                          <Button type="button" size="sm" variant="outline" onClick={() => addOptionRow("create")}>Add Option</Button>
                        </div>
                        <div className="space-y-2">
                          {createOptions.map((value, index) => (
                            <div key={`create-opt-${index}`} className="flex items-center gap-2">
                              <Input value={value} onChange={(e) => handleOptionRowChange("create", index, e.target.value)} />
                              <Button type="button" size="icon-sm" variant="outline" onClick={() => removeOptionRow("create", index)} disabled={createOptions.length <= 2}>
                                <XIcon className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </Field>
                    )}
                    {(createFieldType === "SHORT_TEXT" || createFieldType === "LONG_TEXT") && (
                      <Field>
                        <FieldLabel htmlFor="new-max-words">Word Limit</FieldLabel>
                        <Input id="new-max-words" type="number" min={1} {...createFieldForm.register("maxWords", { valueAsNumber: true })} />
                      </Field>
                    )}
                    <Field>
                      <FieldLabel htmlFor="new-description">Description</FieldLabel>
                      <Textarea id="new-description" placeholder="Optional field hint" {...createFieldForm.register("description")} />
                    </Field>
                    <Field orientation="horizontal">
                      <Controller control={createFieldForm.control} name="isRequired" render={({ field }) => (
                        <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                      )} />
                      <FieldDescription>Required field</FieldDescription>
                    </Field>
                    <div className="pt-2">
                      <Button className="w-full" type="submit" disabled={isCreating || !formId}>
                        {isCreating ? "Creating..." : "Create Field"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

            </div>

            <div className="space-y-6 xl:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Multi-Page Builder</CardTitle>
                  <CardDescription>Create pages and drag fields to reorder within each page.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Page title..."
                      value={newPageTitle}
                      onChange={(e) => setNewPageTitle(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void handleAddPage() } }}
                      className="flex-1"
                    />
                    <Button type="button" onClick={() => void handleAddPage()} disabled={isCreatingPage || !newPageTitle.trim()}>
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </div>

                  {pages.length > 0 && (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event) => void handleDragEnd(event)}>
                      <SortableContext items={pages.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                          {pages.map((page) => {
                            const pageFields = sortFieldsByIndex((fields ?? []).filter((f) => f.pageId === page.id))
                            const orderedIds = localFieldOrder[page.id]
                            const pageFieldsById = new Map(pageFields.map((field) => [field.id, field]))
                            const displayFields = orderedIds
                              ? orderedIds.map((id) => pageFieldsById.get(id)).filter((f): f is FormFieldRow => Boolean(f))
                              : pageFields
                            return (
                              <div key={page.id} className="rounded-lg border p-3">
                                <SortablePageItem page={page} onDelete={(id) => void handleDeletePage(id)} />
                                <DndContext
                                  sensors={sensors}
                                  collisionDetection={closestCenter}
                                  onDragEnd={(event) => void handleFieldDragEnd(page.id, event)}
                                >
                                  <SortableContext items={displayFields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                                    <div className="mt-2 space-y-2">
                                      {displayFields.map((field) => (
                                        <SortableFieldItem
                                          key={field.id}
                                          field={field}
                                          onEdit={openEditDialog}
                                          onDelete={handleDeleteField}
                                          isDeleting={isDeleting}
                                        />
                                      ))}
                                      {displayFields.length === 0 && (
                                        <p className="text-xs text-muted-foreground">No fields on this page yet.</p>
                                      )}
                                    </div>
                                  </SortableContext>
                                </DndContext>
                              </div>
                            )
                          })}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6 xl:col-span-1">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Form Settings</CardTitle>
                      <CardDescription>Core form controls in one place.</CardDescription>
                    </div>
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => setIsFormSettingsOpen((prev) => !prev)}>
                      <ChevronsUpDownIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Collapsible open={isFormSettingsOpen} onOpenChange={setIsFormSettingsOpen}>
                    <CollapsibleContent className="space-y-4">
                      <Field>
                        <FieldLabel>Title</FieldLabel>
                        <Input
                          value={formTitleDraft}
                          maxLength={55}
                          onChange={(e) => setFormTitleDraft(e.target.value)}
                          onBlur={() => void saveInlineFormSettings()}
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Description</FieldLabel>
                        <Textarea
                          value={formDescriptionDraft}
                          maxLength={255}
                          onChange={(e) => setFormDescriptionDraft(e.target.value)}
                          onBlur={() => void saveInlineFormSettings()}
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Custom Slug</FieldLabel>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground shrink-0 select-none font-mono">/f/</span>
                          <Input
                            value={formSlugDraft}
                            maxLength={255}
                            placeholder="my-form"
                            onChange={(e) => setFormSlugDraft(e.target.value)}
                            onBlur={() => void saveInlineFormSettings()}
                          />
                        </div>
                      </Field>
                      <Field>
                        <FieldLabel>Visibility</FieldLabel>
                        <Select
                          value={form?.visibility ?? "UNLISTED"}
                          onValueChange={(v: "PUBLIC" | "UNLISTED") => void handleVisibilityChange(v)}
                          disabled={isFormLoading || isUpdatingVisibility}
                        >
                          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UNLISTED">Unlisted</SelectItem>
                            <SelectItem value="PUBLIC">Public</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <div className="flex items-center gap-2">
                        <Button
                          variant={form?.status === "PUBLISHED" ? "secondary" : "default"}
                          onClick={handleTogglePublish}
                          disabled={isFormLoading || isTogglingPublish}
                        >
                          <GlobeIcon className="mr-1.5 h-3.5 w-3.5" />
                          {form?.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                        </Button>
                        <Button variant="outline" onClick={openPasswordDialog} disabled={isFormLoading}>
                          {form?.isPasswordProtected
                            ? <><LockOpenIcon className="mr-1.5 h-3.5 w-3.5" />Password</>
                            : <><ShieldIcon className="mr-1.5 h-3.5 w-3.5" />Protect</>}
                        </Button>
                      </div>
                      <Field>
                        <FieldLabel>Expires At</FieldLabel>
                        <Input
                          type="datetime-local"
                          value={form?.expiresAt ? new Date(form.expiresAt).toISOString().slice(0, 16) : ""}
                          onChange={async (e) => {
                            if (!formId) return
                            await updateFormLimitsAsync({ formId, expiresAt: e.target.value ? new Date(e.target.value).toISOString() : null })
                          }}
                          disabled={isUpdatingLimits}
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Max Responses</FieldLabel>
                        <Input
                          type="number"
                          min={1}
                          value={form?.maxResponses ?? ""}
                          onChange={async (e) => {
                            if (!formId) return
                            const v = e.target.value ? Number(e.target.value) : null
                            await updateFormLimitsAsync({ formId, maxResponses: v })
                          }}
                          disabled={isUpdatingLimits}
                        />
                      </Field>
                      <Field orientation="horizontal">
                        <Checkbox
                          checked={Boolean(form?.notifyCreatorOnSubmission)}
                          onCheckedChange={(v) => void handleToggleNotif("notifyCreatorOnSubmission", Boolean(v))}
                          disabled={isUpdatingNotif}
                        />
                        <FieldDescription>Notify creator on submission</FieldDescription>
                      </Field>
                      <Field orientation="horizontal">
                        <Checkbox
                          checked={Boolean(form?.sendRespondentConfirmation)}
                          onCheckedChange={(v) => void handleToggleNotif("sendRespondentConfirmation", Boolean(v))}
                          disabled={isUpdatingNotif}
                        />
                        <FieldDescription>Send confirmation email</FieldDescription>
                      </Field>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Field Validation</CardTitle>
                  <CardDescription>Validation controls for selected field.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={selectedFieldId ?? ""} onValueChange={setSelectedFieldId}>
                    <SelectTrigger><SelectValue placeholder="Select field" /></SelectTrigger>
                    <SelectContent>
                      {fields?.map((field) => (
                        <SelectItem key={field.id} value={field.id}>{field.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedField && (
                    <>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedField.isRequired}
                          onCheckedChange={async (value) => {
                            await updateFieldAsync({
                              fieldId: selectedField.id,
                              label: selectedField.label,
                              description: selectedField.description,
                              placeholder: selectedField.placeholder,
                              type: selectedField.type,
                              isRequired: Boolean(value),
                              config: selectedField.config ?? {},
                            })
                          }}
                        />
                        <FieldDescription>Required field</FieldDescription>
                      </div>
                      {(selectedField.type === "SHORT_TEXT" || selectedField.type === "LONG_TEXT") && (
                        <Field>
                          <FieldLabel>Word Limit</FieldLabel>
                          <Input
                            type="number"
                            min={1}
                            defaultValue={selectedField.config?.maxWords ?? ""}
                            onBlur={async (e) => {
                              const maxWords = e.target.value ? Number(e.target.value) : undefined
                              await updateFieldAsync({
                                fieldId: selectedField.id,
                                label: selectedField.label,
                                description: selectedField.description,
                                placeholder: selectedField.placeholder,
                                type: selectedField.type,
                                isRequired: selectedField.isRequired,
                                config: { ...selectedField.config, maxWords },
                              })
                            }}
                          />
                        </Field>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Field Dialog ── */}
      <Dialog open={Boolean(editingFieldId)} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Field</DialogTitle>
            <DialogDescription>Update field configuration.</DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-6" onSubmit={updateFieldForm.handleSubmit(handleUpdateField)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="edit-label">Label</FieldLabel>
                <Input id="edit-label" maxLength={100} required {...updateFieldForm.register("label", { required: true })} />
              </Field>
              <Field>
                <FieldLabel>Type</FieldLabel>
                <Controller control={updateFieldForm.control} name="type" render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SHORT_TEXT">Short Text</SelectItem>
                      <SelectItem value="LONG_TEXT">Long Text</SelectItem>
                      <SelectItem value="NUMBER">Number</SelectItem>
                      <SelectItem value="EMAIL">Email</SelectItem>
                      <SelectItem value="SINGLE_SELECT">Single Select</SelectItem>
                      <SelectItem value="MULTI_SELECT">Multi Select</SelectItem>
                      <SelectItem value="CHECKBOX">Checkbox</SelectItem>
                      <SelectItem value="RATING">Rating</SelectItem>
                      <SelectItem value="DATE">Date</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-placeholder">Placeholder</FieldLabel>
                <Input id="edit-placeholder" {...updateFieldForm.register("placeholder")} />
              </Field>
              {supportsOptionRows(updateFieldType) && (
                <Field>
                  <div className="mb-2 flex items-center justify-between">
                    <FieldLabel>Options</FieldLabel>
                    <Button type="button" size="sm" variant="outline" onClick={() => addOptionRow("edit")}>Add Option</Button>
                  </div>
                  <div className="space-y-2">
                    {editOptions.map((value, index) => (
                      <div key={`edit-opt-${index}`} className="flex items-center gap-2">
                        <Input value={value} onChange={(e) => handleOptionRowChange("edit", index, e.target.value)} />
                        <Button type="button" size="icon-sm" variant="outline" onClick={() => removeOptionRow("edit", index)} disabled={editOptions.length <= 2}>
                          <XIcon className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </Field>
              )}
              <Field>
                <FieldLabel htmlFor="edit-description">Description</FieldLabel>
                <Textarea id="edit-description" {...updateFieldForm.register("description")} />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeEditDialog} disabled={isUpdating}>Cancel</Button>
              <Button type="submit" disabled={isUpdating}>{isUpdating ? "Saving..." : "Save Changes"}</Button>
            </DialogFooter>
          </form>
          {editingField && <p className="text-xs text-muted-foreground">Field key: {editingField.labelKey}</p>}
        </DialogContent>
      </Dialog>

      {/* ── Password Protection Dialog ── */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldIcon className="h-5 w-5 text-amber-500" />
              Password Protection
            </DialogTitle>
            <DialogDescription>
              {form?.isPasswordProtected
                ? "This form is currently password protected. Update or remove the password."
                : "Require respondents to enter a password before accessing this form."}
            </DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-5" onSubmit={passwordForm.handleSubmit(handleSetPassword)}>
            <Field>
              <FieldLabel htmlFor="pw-input">
                {form?.isPasswordProtected ? "New Password" : "Password"}
              </FieldLabel>
              <Input
                id="pw-input"
                type="password"
                placeholder={form?.isPasswordProtected ? "Enter new password to change" : "Enter password"}
                {...passwordForm.register("password")}
              />
              {form?.isPasswordProtected && (
                <FieldDescription>Leave blank to keep current password.</FieldDescription>
              )}
            </Field>
            <Field>
              <FieldLabel className="flex items-center gap-1.5">
                <ClockIcon className="h-3.5 w-3.5 text-muted-foreground" />
                Unlock Duration
              </FieldLabel>
              <Controller
                control={passwordForm.control}
                name="unlockDurationMinutes"
                render={({ field }) => (
                  <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes (default)</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="360">6 hours</SelectItem>
                      <SelectItem value="1440">24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldDescription>How long the form stays unlocked after entering the password.</FieldDescription>
            </Field>
            <DialogFooter className="flex flex-col gap-2 sm:flex-row">
              {form?.isPasswordProtected && (
                <Button
                  type="button"
                  variant="outline"
                  className="text-destructive hover:text-destructive border-destructive/30"
                  disabled={isSettingPassword}
                  onClick={() => passwordForm.handleSubmit((v) =>
                    handleSetPassword({ ...v, password: null })
                  )()}
                >
                  <LockOpenIcon className="mr-1.5 h-3.5 w-3.5" />
                  Remove Password
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => setIsPasswordDialogOpen(false)} disabled={isSettingPassword}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSettingPassword}>
                {isSettingPassword ? "Saving..." : (
                  <><LockIcon className="mr-1.5 h-3.5 w-3.5" />{form?.isPasswordProtected ? "Update" : "Enable"}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}
