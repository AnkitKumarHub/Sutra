"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { PencilIcon, Trash2Icon, TypeIcon, HashIcon, MailIcon, ToggleLeftIcon, KeyIcon } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { useCreateField, useDeleteField, useGetFields, useUpdateField } from "~/hooks/api/form"
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

type FieldType = "TEXT" | "NUMBER" | "EMAIL" | "YES_NO" | "PASSWORD"

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

const getFieldIcon = (type: FieldType) => {
  switch (type) {
    case "TEXT":
      return <TypeIcon className="h-5 w-5" />
    case "NUMBER":
      return <HashIcon className="h-5 w-5" />
    case "EMAIL":
      return <MailIcon className="h-5 w-5" />
    case "YES_NO":
      return <ToggleLeftIcon className="h-5 w-5" />
    case "PASSWORD":
      return <KeyIcon className="h-5 w-5" />
    default:
      return <TypeIcon className="h-5 w-5" />
  }
}

export default function FormBuilderPage() {
  const params = useParams<{ id: string }>()
  const formId = Array.isArray(params.id) ? params.id[0] : params.id

  const { fields, isLoading, isFetching, error } = useGetFields(formId ?? "")
  const { createFieldAsync, status: createStatus } = useCreateField(formId ?? "")
  const { updateFieldAsync, status: updateStatus } = useUpdateField(formId ?? "")
  const { deleteFieldAsync, status: deleteStatus } = useDeleteField(formId ?? "")

  const [editingFieldId, setEditingFieldId] = useState<string | null>(null)
  const createForm = useForm<CreateFieldValues>({
    defaultValues: {
      label: "",
      description: "",
      placeholder: "",
      type: "TEXT",
      isRequired: false,
      options: "",
    },
  })
  const updateForm = useForm<UpdateFieldValues>({
    defaultValues: {
      label: "",
      description: "",
      placeholder: "",
      type: "TEXT",
      isRequired: false,
      options: "",
    },
  })

  const editingField = useMemo(
    () => fields?.find((item) => item.id === editingFieldId),
    [fields, editingFieldId],
  )

  const isCreating = createStatus === "pending"
  const isUpdating = updateStatus === "pending"
  const isDeleting = deleteStatus === "pending"

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
      createForm.reset({
        label: "",
        description: "",
        placeholder: "",
        type: "TEXT",
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
    updateForm.reset({
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
    updateForm.reset({
      label: "",
      description: "",
      placeholder: "",
      type: "TEXT",
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

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">Form builder</h1>
              <p className="text-sm text-muted-foreground">
                Editing form {formId}.
              </p>
              {isFetching && (
                <Badge variant="secondary">Refreshing</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline">
                <Link href={`/dashboard/forms/${formId}/submissions`}>View submissions</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/forms">Back to forms</Link>
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
                    onSubmit={createForm.handleSubmit(handleCreateField)}
                  >
                    <Field>
                      <FieldLabel htmlFor="new-label">Label</FieldLabel>
                      <Input
                        id="new-label"
                        maxLength={100}
                        placeholder="Full Name"
                        required
                        {...createForm.register("label", { required: true })}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Type</FieldLabel>
                      <Controller
                        control={createForm.control}
                        name="type"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TEXT">Text</SelectItem>
                              <SelectItem value="NUMBER">Number</SelectItem>
                              <SelectItem value="EMAIL">Email</SelectItem>
                              <SelectItem value="YES_NO">Yes/No</SelectItem>
                              <SelectItem value="PASSWORD">Password</SelectItem>
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
                        {...createForm.register("placeholder")}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="new-options">Options</FieldLabel>
                      <Input
                        id="new-options"
                        placeholder="Comma-separated options"
                        {...createForm.register("options")}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="new-description">Description</FieldLabel>
                      <Textarea
                        id="new-description"
                        placeholder="Optional field hint"
                        {...createForm.register("description")}
                      />
                    </Field>
                    <Field orientation="horizontal">
                      <Controller
                        control={createForm.control}
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
                <CardHeader>
                  <CardTitle>Fields</CardTitle>
                  <CardDescription>
                    Manage fields for this form.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3">
                    {isLoading ? (
                      <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                        Loading fields...
                      </div>
                    ) : error ? (
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
          <form className="flex flex-col gap-6" onSubmit={updateForm.handleSubmit(handleUpdateField)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="edit-label">Label</FieldLabel>
                <Input
                  id="edit-label"
                  maxLength={100}
                  required
                  {...updateForm.register("label", { required: true })}
                />
              </Field>
              <Field>
                <FieldLabel>Type</FieldLabel>
                <Controller
                  control={updateForm.control}
                  name="type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TEXT">Text</SelectItem>
                        <SelectItem value="NUMBER">Number</SelectItem>
                        <SelectItem value="EMAIL">Email</SelectItem>
                        <SelectItem value="YES_NO">Yes/No</SelectItem>
                        <SelectItem value="PASSWORD">Password</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-placeholder">Placeholder</FieldLabel>
                <Input id="edit-placeholder" {...updateForm.register("placeholder")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-options">Options</FieldLabel>
                <Input id="edit-options" {...updateForm.register("options")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-description">Description</FieldLabel>
                <Textarea id="edit-description" {...updateForm.register("description")} />
              </Field>
              <Field orientation="horizontal">
                <Controller
                  control={updateForm.control}
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
    </div>
  )
}
