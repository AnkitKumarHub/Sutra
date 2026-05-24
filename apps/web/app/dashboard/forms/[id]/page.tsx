"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { PencilIcon, Trash2Icon, TypeIcon, HashIcon, MailIcon, ToggleLeftIcon, KeyIcon, GlobeIcon, SettingsIcon } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { 
  useCreateField, 
  useDeleteField, 
  useGetFields, 
  useUpdateField,
  useGetFormById,
  useUpdateForm,
  usePublishForm,
  useUnpublishForm,
  useDeleteForm
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

type FieldType =
  | "SHORT_TEXT"
  | "LONG_TEXT"
  | "EMAIL"
  | "NUMBER"
  | "SINGLE_SELECT"
  | "MULTI_SELECT"
  | "CHECKBOX"
  | "RATING"
  | "DATE"

type CreateFieldValues = {
  label: string
  description?: string
  placeholder?: string
  type: FieldType
  isRequired: boolean
  options?: string
}

type UpdateFieldValues = {
  label: string
  description?: string
  placeholder?: string
  type: FieldType
  isRequired: boolean
  options?: string
}

type EditFormValues = {
  title: string
  description?: string
}

const getFieldIcon = (type: FieldType) => {
  switch (type) {
    case "SHORT_TEXT":
    case "LONG_TEXT":
      return <TypeIcon className="h-5 w-5" />
    case "NUMBER":
    case "RATING":
      return <HashIcon className="h-5 w-5" />
    case "EMAIL":
      return <MailIcon className="h-5 w-5" />
    case "CHECKBOX":
      return <ToggleLeftIcon className="h-5 w-5" />
    case "SINGLE_SELECT":
    case "MULTI_SELECT":
    case "DATE":
      return <KeyIcon className="h-5 w-5" />
    default:
      return <TypeIcon className="h-5 w-5" />
  }
}

export default function FormBuilderPage() {
  const params = useParams<{ id: string }>()
  const formId = Array.isArray(params.id) ? params.id[0] : params.id
  const router = useRouter()

  const { form, isLoading: isFormLoading } = useGetFormById(formId ?? "")
  const { fields, isLoading: isFieldsLoading, isFetching: isFieldsFetching, error: fieldsError } = useGetFields(formId ?? "")
  
  const { createFieldAsync, status: createStatus } = useCreateField(formId ?? "")
  const { updateFieldAsync, status: updateStatus } = useUpdateField(formId ?? "")
  const { deleteFieldAsync, status: deleteStatus } = useDeleteField(formId ?? "")

  const { updateFormAsync, status: updateFormStatus } = useUpdateForm(formId ?? "")
  const { publishFormAsync, status: publishStatus } = usePublishForm(formId ?? "")
  const { unpublishFormAsync, status: unpublishStatus } = useUnpublishForm(formId ?? "")
  const { deleteFormAsync, status: deleteFormStatus } = useDeleteForm()

  const [editingFieldId, setEditingFieldId] = useState<string | null>(null)
  const [isEditingForm, setIsEditingForm] = useState(false)

  const createFieldForm = useForm<CreateFieldValues>({
    defaultValues: {
      label: "",
      description: "",
      placeholder: "",
      type: "SHORT_TEXT",
      isRequired: false,
      options: "",
    },
  })
  const updateFieldForm = useForm<UpdateFieldValues>({
    defaultValues: {
      label: "",
      description: "",
      placeholder: "",
      type: "SHORT_TEXT",
      isRequired: false,
      options: "",
    },
  })
  
  const editFormForm = useForm<EditFormValues>({
    defaultValues: {
      title: "",
      description: "",
    },
  })

  const editingField = useMemo(
    () => fields?.find((item) => item.id === editingFieldId),
    [fields, editingFieldId],
  )

  const isCreating = createStatus === "pending"
  const isUpdating = updateStatus === "pending"
  const isDeleting = deleteStatus === "pending"
  const isUpdatingForm = updateFormStatus === "pending"
  const isTogglingPublish = publishStatus === "pending" || unpublishStatus === "pending"
  const isDeletingForm = deleteFormStatus === "pending"

  const handleCreateField = async (values: CreateFieldValues) => {
    if (!formId) return

    try {
      await createFieldAsync({
        formId,
        label: values.label,
        description: values.description || null,
        placeholder: values.placeholder || null,
        type: values.type,
        isRequired: values.isRequired,
        options: values.options || null,
      })

      toast.success("Field created")
      createFieldForm.reset({
        label: "",
        description: "",
        placeholder: "",
        type: "SHORT_TEXT",
        isRequired: false,
        options: "",
      })
    } catch (err) {
      console.error("Failed to create field:", err)
      toast.error("Failed to create field")
    }
  }

  const openEditDialog = (fieldId: string) => {
    const field = fields?.find((item) => item.id === fieldId)
    if (!field) return

    setEditingFieldId(fieldId)
    updateFieldForm.reset({
      label: field.label,
      description: field.description ?? "",
      placeholder: field.placeholder ?? "",
      type: field.type,
      isRequired: field.isRequired,
      options: field.options ?? "",
    })
  }

  const closeEditDialog = () => {
    setEditingFieldId(null)
    updateFieldForm.reset({
      label: "",
      description: "",
      placeholder: "",
      type: "SHORT_TEXT",
      isRequired: false,
      options: "",
    })
  }

  const handleUpdateField = async (values: UpdateFieldValues) => {
    if (!editingFieldId) return

    try {
      await updateFieldAsync({
        fieldId: editingFieldId,
        label: values.label,
        description: values.description || null,
        placeholder: values.placeholder || null,
        type: values.type,
        isRequired: values.isRequired,
        options: values.options || null,
      })
      toast.success("Field updated")
      closeEditDialog()
    } catch (err) {
      console.error("Failed to update field:", err)
      toast.error("Failed to update field")
    }
  }

  const handleDeleteField = async (fieldId: string) => {
    const shouldDelete = window.confirm("Delete this field?")
    if (!shouldDelete) return

    try {
      await deleteFieldAsync({ fieldId })
      toast.success("Field deleted")
      if (editingFieldId === fieldId) closeEditDialog()
    } catch (err) {
      console.error("Failed to delete field:", err)
      toast.error("Failed to delete field")
    }
  }

  const openEditFormDialog = () => {
    if (!form) return
    editFormForm.reset({
      title: form.title,
      description: form.description ?? "",
    })
    setIsEditingForm(true)
  }

  const handleUpdateForm = async (values: EditFormValues) => {
    if (!formId) return
    try {
      await updateFormAsync({
        formId,
        title: values.title,
        description: values.description || null,
      })
      toast.success("Form updated")
      setIsEditingForm(false)
    } catch (err) {
      console.error("Failed to update form:", err)
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
        toast.success("Form published")
      }
    } catch (err) {
      console.error("Failed to toggle publish status:", err)
      toast.error("Failed to update form status")
    }
  }

  const handleDeleteForm = async () => {
    if (!formId) return
    const shouldDelete = window.confirm("Are you sure you want to delete this form? This action cannot be undone.")
    if (!shouldDelete) return
    
    try {
      await deleteFormAsync({ formId })
      toast.success("Form deleted")
      router.push("/dashboard/forms")
    } catch (err) {
      console.error("Failed to delete form:", err)
      toast.error("Failed to delete form")
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between rounded-lg border bg-card p-6 shadow-sm">
            <div className="space-y-2">
              {isFormLoading ? (
                <div className="h-8 w-48 animate-pulse rounded bg-muted" />
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-semibold tracking-tight">{form?.title}</h1>
                    <Badge variant={form?.status === "PUBLISHED" ? "default" : "secondary"}>
                      {form?.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-xl">
                    {form?.description || "No description provided."}
                  </p>
                </>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={openEditFormDialog} disabled={isFormLoading}>
                <SettingsIcon className="mr-2 h-4 w-4" />
                Edit Form
              </Button>
              <Button 
                variant={form?.status === "PUBLISHED" ? "secondary" : "default"} 
                size="sm" 
                onClick={handleTogglePublish}
                disabled={isFormLoading || isTogglingPublish}
              >
                <GlobeIcon className="mr-2 h-4 w-4" />
                {form?.status === "PUBLISHED" ? "Unpublish" : "Publish"}
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`/dashboard/forms/${formId}/submissions`}>Submissions</Link>
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDeleteForm} disabled={isDeletingForm}>
                <Trash2Icon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Add field</CardTitle>
                  <CardDescription>
                    Create a new field for this form.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    className="flex flex-col gap-4"
                    onSubmit={createFieldForm.handleSubmit(handleCreateField)}
                  >
                    <Field>
                      <FieldLabel htmlFor="new-label">Label</FieldLabel>
                      <Input
                        id="new-label"
                        maxLength={100}
                        placeholder="Full Name"
                        required
                        {...createFieldForm.register("label", { required: true })}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Type</FieldLabel>
                      <Controller
                        control={createFieldForm.control}
                        name="type"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
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
                        )}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="new-placeholder">Placeholder</FieldLabel>
                      <Input
                        id="new-placeholder"
                        placeholder="Enter value"
                        {...createFieldForm.register("placeholder")}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="new-options">Options</FieldLabel>
                      <Input
                        id="new-options"
                        placeholder="Comma-separated options"
                        {...createFieldForm.register("options")}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="new-description">Description</FieldLabel>
                      <Textarea
                        id="new-description"
                        placeholder="Optional field hint"
                        {...createFieldForm.register("description")}
                      />
                    </Field>
                    <Field orientation="horizontal">
                      <Controller
                        control={createFieldForm.control}
                        name="isRequired"
                        render={({ field }) => (
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                          />
                        )}
                      />
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

            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div className="space-y-1.5">
                    <CardTitle>Fields</CardTitle>
                    <CardDescription>
                      Manage fields for this form.
                    </CardDescription>
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
                      fields.map((field) => (
                        <div
                          key={field.id}
                          className="group flex flex-col justify-between gap-4 rounded-lg border p-4 shadow-sm transition-all hover:border-primary/20 hover:bg-muted/30 sm:flex-row sm:items-center"
                        >
                          <div className="flex items-start gap-4 sm:items-center">
                            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary sm:mt-0">
                              {getFieldIcon(field.type)}
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold leading-none">{field.label}</span>
                                {field.isRequired && (
                                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px] uppercase tracking-wider">
                                    Required
                                  </Badge>
                                )}
                                <Badge variant="outline" className="px-1.5 py-0 text-[10px] uppercase tracking-wider text-muted-foreground">
                                  {field.type}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2">
                                <span className="font-mono text-xs">{field.labelKey}</span>
                                {field.description && (
                                  <>
                                    <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                                    <span className="truncate">{field.description}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                            <Button
                              type="button"
                              size="icon-sm"
                              variant="outline"
                              onClick={() => openEditDialog(field.id)}
                            >
                              <PencilIcon className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              type="button"
                              size="icon-sm"
                              variant="destructive"
                              disabled={isDeleting}
                              onClick={() => handleDeleteField(field.id)}
                            >
                              <Trash2Icon className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </div>
                      ))
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

      <Dialog open={Boolean(editingFieldId)} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit field</DialogTitle>
            <DialogDescription>
              Update field configuration.
            </DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-6" onSubmit={updateFieldForm.handleSubmit(handleUpdateField)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="edit-label">Label</FieldLabel>
                <Input
                  id="edit-label"
                  maxLength={100}
                  required
                  {...updateFieldForm.register("label", { required: true })}
                />
              </Field>
              <Field>
                <FieldLabel>Type</FieldLabel>
                <Controller
                  control={updateFieldForm.control}
                  name="type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
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
                  )}
                />
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
                <Controller
                  control={updateFieldForm.control}
                  name="isRequired"
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                    />
                  )}
                />
                <FieldDescription>Required field</FieldDescription>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeEditDialog} disabled={isUpdating}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
          {editingField && (
            <p className="text-xs text-muted-foreground">
              Field key: {editingField.labelKey}
            </p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditingForm} onOpenChange={setIsEditingForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Form</DialogTitle>
            <DialogDescription>
              Update form title and description.
            </DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-6" onSubmit={editFormForm.handleSubmit(handleUpdateForm)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="edit-form-title">Title</FieldLabel>
                <Input
                  id="edit-form-title"
                  maxLength={55}
                  required
                  {...editFormForm.register("title", { required: true })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-form-description">Description</FieldLabel>
                <Textarea 
                  id="edit-form-description" 
                  maxLength={255}
                  {...editFormForm.register("description")} 
                />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditingForm(false)} disabled={isUpdatingForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdatingForm}>
                {isUpdatingForm ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}
