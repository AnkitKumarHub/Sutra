"use client"

import { useCallback, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  PencilIcon, Trash2Icon, TypeIcon, HashIcon, MailIcon,
  ToggleLeftIcon, KeyIcon, GlobeIcon, SettingsIcon, CopyIcon,
  ShareIcon, ShieldIcon, PlusIcon, GripVerticalIcon, CheckIcon,
  XIcon, LayersIcon, ChevronRightIcon, LockIcon, LockOpenIcon,
  FileTextIcon, ClockIcon,
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
  useUnpublishForm,
  useDeleteForm,
  useSetFormPassword,
  useGetPagesByFormId,
  useCreatePage,
  useUpdatePage,
  useDeletePage,
  useReorderPages,
} from "~/hooks/api/form"
import { Badge } from "~/components/ui/badge"
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

// ── Types ────────────────────────────────────────────────────────────────────

type FieldType =
  | "SHORT_TEXT" | "LONG_TEXT" | "EMAIL" | "NUMBER"
  | "SINGLE_SELECT" | "MULTI_SELECT" | "CHECKBOX" | "RATING" | "DATE"

type CreateFieldValues = {
  label: string; description?: string; placeholder?: string
  type: FieldType; isRequired: boolean; options?: string
}
type UpdateFieldValues = {
  label: string; description?: string; placeholder?: string
  type: FieldType; isRequired: boolean; options?: string
}
type EditFormValues = { title: string; description?: string; slug?: string }
type PasswordFormValues = { password: string | null; unlockDurationMinutes: number }

// ── Helpers ──────────────────────────────────────────────────────────────────

const getFieldIcon = (type: FieldType) => {
  switch (type) {
    case "SHORT_TEXT": case "LONG_TEXT": return <TypeIcon className="h-4 w-4" />
    case "NUMBER": case "RATING": return <HashIcon className="h-4 w-4" />
    case "EMAIL": return <MailIcon className="h-4 w-4" />
    case "CHECKBOX": return <ToggleLeftIcon className="h-4 w-4" />
    case "SINGLE_SELECT": case "MULTI_SELECT": return <KeyIcon className="h-4 w-4" />
    default: return <TypeIcon className="h-4 w-4" />
  }
}

// ── Sortable Page Item ────────────────────────────────────────────────────────

interface Page { id: string; title: string; order: number }

function SortablePageItem({
  page, onRename, onDelete,
}: {
  page: Page
  onRename: (id: string, currentTitle: string) => void
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
          onClick={() => onRename(page.id, page.title)}
          className="rounded p-1 hover:bg-muted text-muted-foreground"
        >
          <PencilIcon className="h-3.5 w-3.5" />
        </button>
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
  const { fields, isLoading: isFieldsLoading, isFetching: isFieldsFetching, error: fieldsError } = useGetFields(formId ?? "")
  const { pages: serverPages, isLoading: isPagesLoading } = useGetPagesByFormId(formId ?? "")

  // Local page order for optimistic DnD
  const [localPageOrder, setLocalPageOrder] = useState<Page[] | null>(null)
  const pages: Page[] = localPageOrder ?? serverPages ?? []

  // ── Mutations ─────────────────────────────────────────────────────────────
  const { createFieldAsync, status: createStatus } = useCreateField(formId ?? "")
  const { updateFieldAsync, status: updateStatus } = useUpdateField(formId ?? "")
  const { deleteFieldAsync, status: deleteStatus } = useDeleteField(formId ?? "")
  const { updateFormAsync, status: updateFormStatus } = useUpdateForm(formId ?? "")
  const { publishFormAsync, status: publishStatus } = usePublishForm(formId ?? "")
  const { unpublishFormAsync, status: unpublishStatus } = useUnpublishForm(formId ?? "")
  const { deleteFormAsync, status: deleteFormStatus } = useDeleteForm()
  const { setFormPasswordAsync, isPending: isSettingPassword } = useSetFormPassword(formId ?? "")
  const { createPageAsync, isPending: isCreatingPage } = useCreatePage(formId ?? "")
  const { updatePageAsync } = useUpdatePage(formId ?? "")
  const { deletePageAsync } = useDeletePage(formId ?? "")
  const { reorderPagesAsync } = useReorderPages(formId ?? "")

  // ── UI State ──────────────────────────────────────────────────────────────
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null)
  const [isEditingForm, setIsEditingForm] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [isPagesDialogOpen, setIsPagesDialogOpen] = useState(false)
  const [renamingPageId, setRenamingPageId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [newPageTitle, setNewPageTitle] = useState("New Page")

  // ── Forms ─────────────────────────────────────────────────────────────────
  const createFieldForm = useForm<CreateFieldValues>({
    defaultValues: { label: "", description: "", placeholder: "", type: "SHORT_TEXT", isRequired: false, options: "" },
  })
  const updateFieldForm = useForm<UpdateFieldValues>({
    defaultValues: { label: "", description: "", placeholder: "", type: "SHORT_TEXT", isRequired: false, options: "" },
  })
  const editFormForm = useForm<EditFormValues>({
    defaultValues: { title: "", description: "" },
  })
  const passwordForm = useForm<PasswordFormValues>({
    defaultValues: { password: "", unlockDurationMinutes: 30 },
  })

  // ── Memos ─────────────────────────────────────────────────────────────────
  const editingField = useMemo(() => fields?.find((f) => f.id === editingFieldId), [fields, editingFieldId])

  const publicUrl = useMemo(() => {
    if (typeof window === "undefined") return ""
    return `${window.location.origin}/f/${form?.slug ?? ""}`
  }, [form?.slug])

  // ── Status flags ──────────────────────────────────────────────────────────
  const isCreating = createStatus === "pending"
  const isUpdating = updateStatus === "pending"
  const isDeleting = deleteStatus === "pending"
  const isUpdatingForm = updateFormStatus === "pending"
  const isTogglingPublish = publishStatus === "pending" || unpublishStatus === "pending"
  const isDeletingForm = deleteFormStatus === "pending"

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
      await createFieldAsync({
        formId, label: values.label,
        description: values.description || null,
        placeholder: values.placeholder || null,
        type: values.type, isRequired: values.isRequired,
        options: values.options || null,
      })
      toast.success("Field created")
      createFieldForm.reset({ label: "", description: "", placeholder: "", type: "SHORT_TEXT", isRequired: false, options: "" })
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
      isRequired: field.isRequired, options: field.options ?? "",
    })
  }

  const closeEditDialog = () => {
    setEditingFieldId(null)
    updateFieldForm.reset({ label: "", description: "", placeholder: "", type: "SHORT_TEXT", isRequired: false, options: "" })
  }

  const handleUpdateField = async (values: UpdateFieldValues) => {
    if (!editingFieldId) return
    try {
      await updateFieldAsync({
        fieldId: editingFieldId, label: values.label,
        description: values.description || null,
        placeholder: values.placeholder || null,
        type: values.type, isRequired: values.isRequired,
        options: values.options || null,
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

  // ── Form settings handlers ────────────────────────────────────────────────
  const openEditFormDialog = () => {
    if (!form) return
    editFormForm.reset({ title: form.title, description: form.description ?? "", slug: form.slug ?? "" })
    setIsEditingForm(true)
  }

  const handleUpdateForm = async (values: EditFormValues) => {
    if (!formId) return
    try {
      await updateFormAsync({ formId, title: values.title, description: values.description || null, slug: values.slug || undefined })
      toast.success("Form updated")
      setIsEditingForm(false)
    } catch {
      toast.error("Failed to update form")
    }
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
    const reordered = arrayMove(pages, oldIndex, newIndex)
    setLocalPageOrder(reordered)

    try {
      await reorderPagesAsync({ formId: formId!, pageIds: reordered.map((p) => p.id) })
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

  const startRenaming = (id: string, currentTitle: string) => {
    setRenamingPageId(id)
    setRenameValue(currentTitle)
  }

  const commitRename = async () => {
    if (!renamingPageId || !renameValue.trim()) return
    try {
      await updatePageAsync({ pageId: renamingPageId, title: renameValue.trim() })
      toast.success("Page renamed")
    } catch {
      toast.error("Failed to rename page")
    }
    setRenamingPageId(null)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6">

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
                      <Badge variant={form?.status === "PUBLISHED" ? "default" : "secondary"}>
                        {form?.status}
                      </Badge>
                      {form?.isPasswordProtected && (
                        <Badge variant="outline" className="gap-1 text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30">
                          <LockIcon className="h-3 w-3" />
                          Protected
                        </Badge>
                      )}
                      {pages.length > 0 && (
                        <Badge variant="outline" className="gap-1 text-violet-600 border-violet-300 bg-violet-50 dark:bg-violet-950/30">
                          <LayersIcon className="h-3 w-3" />
                          {pages.length} pages
                        </Badge>
                      )}
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
                        No slug set. Add one in Edit Form settings.
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={openEditFormDialog} disabled={isFormLoading}>
                  <SettingsIcon className="mr-1.5 h-3.5 w-3.5" />
                  Edit Form
                </Button>
                <Button variant="outline" size="sm" onClick={openPasswordDialog} disabled={isFormLoading}>
                  {form?.isPasswordProtected
                    ? <><LockOpenIcon className="mr-1.5 h-3.5 w-3.5" />Password</>
                    : <><ShieldIcon className="mr-1.5 h-3.5 w-3.5" />Protect</>}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsPagesDialogOpen(true)} disabled={isFormLoading}>
                  <LayersIcon className="mr-1.5 h-3.5 w-3.5" />
                  Pages
                </Button>
                <Button
                  variant={form?.status === "PUBLISHED" ? "secondary" : "default"}
                  size="sm"
                  onClick={handleTogglePublish}
                  disabled={isFormLoading || isTogglingPublish}
                >
                  <GlobeIcon className="mr-1.5 h-3.5 w-3.5" />
                  {form?.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/dashboard/forms/${formId}/submissions`}>
                    <FileTextIcon className="mr-1.5 h-3.5 w-3.5" />
                    Responses
                  </Link>
                </Button>
                <Button variant="destructive" size="icon" className="h-8 w-8" onClick={handleDeleteForm} disabled={isDeletingForm}>
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* ── Grid ── */}
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
            {/* Left: Add Field */}
            <div className="lg:col-span-1">
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
                    <Field>
                      <FieldLabel htmlFor="new-options">Options</FieldLabel>
                      <Input id="new-options" placeholder="Comma-separated options" {...createFieldForm.register("options")} />
                    </Field>
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

            {/* Right: Fields list */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div className="space-y-1.5">
                    <CardTitle>Fields</CardTitle>
                    <CardDescription>Manage fields for this form.</CardDescription>
                  </div>
                  {isFieldsFetching && !isFieldsLoading && (
                    <Badge variant="secondary" className="animate-pulse">Refreshing...</Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3">
                    {isFieldsLoading ? (
                      <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                        Loading fields...
                      </div>
                    ) : fieldsError ? (
                      <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-destructive">
                        Failed to load fields.
                      </div>
                    ) : fields?.length ? (
                      fields.map((field) => {
                        const page = pages.find((p) => p.id === field.pageId)
                        return (
                          <div
                            key={field.id}
                            className="group flex flex-col justify-between gap-4 rounded-lg border p-4 shadow-sm transition-all hover:border-primary/20 hover:bg-muted/30 sm:flex-row sm:items-center"
                          >
                            <div className="flex items-start gap-4 sm:items-center">
                              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary sm:mt-0">
                                {getFieldIcon(field.type)}
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-semibold leading-none">{field.label}</span>
                                  {field.isRequired && (
                                    <Badge variant="secondary" className="px-1.5 py-0 text-[10px] uppercase tracking-wider">Required</Badge>
                                  )}
                                  <Badge variant="outline" className="px-1.5 py-0 text-[10px] uppercase tracking-wider text-muted-foreground">
                                    {field.type}
                                  </Badge>
                                  {page && (
                                    <Badge variant="outline" className="gap-1 px-1.5 py-0 text-[10px] text-violet-600 border-violet-300">
                                      <LayersIcon className="h-2.5 w-2.5" />
                                      {page.title}
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                  <span className="font-mono text-xs">{field.labelKey}</span>
                                  {field.description && (
                                    <>
                                      <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                                      <span className="truncate max-w-xs">{field.description}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                              <Button type="button" size="icon-sm" variant="outline" onClick={() => openEditDialog(field.id)}>
                                <PencilIcon className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button type="button" size="icon-sm" variant="destructive" disabled={isDeleting} onClick={() => handleDeleteField(field.id)}>
                                <Trash2Icon className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                        No fields yet. Add your first field.
                      </div>
                    )}
                  </div>
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
              <Field>
                <FieldLabel htmlFor="edit-options">Options</FieldLabel>
                <Input id="edit-options" {...updateFieldForm.register("options")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-description">Description</FieldLabel>
                <Textarea id="edit-description" {...updateFieldForm.register("description")} />
              </Field>
              <Field orientation="horizontal">
                <Controller control={updateFieldForm.control} name="isRequired" render={({ field }) => (
                  <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                )} />
                <FieldDescription>Required field</FieldDescription>
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

      {/* ── Edit Form Dialog ── */}
      <Dialog open={isEditingForm} onOpenChange={setIsEditingForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Form</DialogTitle>
            <DialogDescription>Update form title, slug and description.</DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-6" onSubmit={editFormForm.handleSubmit(handleUpdateForm)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="edit-form-title">Title</FieldLabel>
                <Input id="edit-form-title" maxLength={55} required {...editFormForm.register("title", { required: true })} />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-form-slug">Custom Slug</FieldLabel>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground shrink-0 select-none font-mono">/f/</span>
                  <Input id="edit-form-slug" maxLength={255} placeholder="my-form" {...editFormForm.register("slug")} />
                </div>
                <FieldDescription>Optional. URL-friendly identifier. Leave blank to use auto-generated slug.</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-form-description">Description</FieldLabel>
                <Textarea id="edit-form-description" maxLength={255} {...editFormForm.register("description")} />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditingForm(false)} disabled={isUpdatingForm}>Cancel</Button>
              <Button type="submit" disabled={isUpdatingForm}>{isUpdatingForm ? "Saving..." : "Save Changes"}</Button>
            </DialogFooter>
          </form>
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

      {/* ── Pages Management Dialog ── */}
      <Dialog open={isPagesDialogOpen} onOpenChange={setIsPagesDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LayersIcon className="h-5 w-5 text-violet-500" />
              Manage Pages
            </DialogTitle>
            <DialogDescription>
              Drag to reorder pages. Fields can be assigned to pages from their edit dialog.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {/* Add new page */}
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

            {/* Sortable pages list */}
            {isPagesLoading ? (
              <div className="flex h-24 items-center justify-center text-muted-foreground text-sm">Loading pages...</div>
            ) : pages.length === 0 ? (
              <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-muted-foreground text-sm">
                No pages yet. Add your first page above.
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => void handleDragEnd(event)}
              >
                <SortableContext items={pages.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col gap-2">
                    {pages.map((page) =>
                      renamingPageId === page.id ? (
                        <div key={page.id} className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2.5">
                          <GripVerticalIcon className="h-4 w-4 text-muted-foreground/30" />
                          <Input
                            value={renameValue}
                            autoFocus
                            className="flex-1 h-7 text-sm"
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") { e.preventDefault(); void commitRename() }
                              if (e.key === "Escape") setRenamingPageId(null)
                            }}
                          />
                          <button type="button" onClick={() => void commitRename()} className="text-green-600 hover:text-green-700 rounded p-1">
                            <CheckIcon className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => setRenamingPageId(null)} className="text-muted-foreground hover:text-foreground rounded p-1">
                            <XIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <SortablePageItem
                          key={page.id}
                          page={page}
                          onRename={startRenaming}
                          onDelete={(id) => void handleDeletePage(id)}
                        />
                      )
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {pages.length > 0 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <ChevronRightIcon className="h-3 w-3" />
                Drag the grip handle to reorder pages. Reorder is saved automatically.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPagesDialogOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
