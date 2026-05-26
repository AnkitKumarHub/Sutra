"use client"

import { useState } from "react"
import Link from "next/link"
import { BarChart2, CopyIcon, MoreHorizontal, PlusIcon, UserRoundPen } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { Textarea } from "~/components/ui/textarea"
import { useCreateForm, useListForms, useCloneForm } from "~/hooks/api/form"

type CreateFormValues = {
  title: string
  description?: string
  slug?: string
}

export default function FormsPage() {
  const [open, setOpen] = useState(false)
  const { createFormAsync, status: createStatus } = useCreateForm()
  const { cloneFormAsync, status: cloneStatus } = useCloneForm()
  const { forms, error, isLoading, isFetching } = useListForms()
  
  const form = useForm<CreateFormValues>()
  const titleValue = form.watch("title")

  const isPending = createStatus === "pending" || cloneStatus === "pending"

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)

    if (!nextOpen) {
      form.reset()
    }
  }

  const handleCloneForm = async (formId: string) => {
    try {
      await cloneFormAsync({ formId })
      toast.success("Form cloned successfully")
    } catch (err) {
      console.error("Error cloning form:", err)
      toast.error("Failed to clone form")
    }
  }

  const handleSubmitForm = async (values: CreateFormValues) => {
    try {
      await createFormAsync({
        title: values.title,
        description: values.description || null,
        slug: values.slug || undefined,
      })

      toast.success("Form created")
      handleOpenChange(false)
    } catch (error) {
      console.error("Error creating form:", error)
      toast.error("Failed to create form")
    }
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) {
      return "Not updated"
    }

    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date))
  }

  const derivedSlug = (titleValue || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "form"

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">Forms</h1>
              <p className="text-sm text-muted-foreground">
                Manage and create forms from this dashboard section.
              </p>
            </div>
            <Button type="button" onClick={() => setOpen(true)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Form
            </Button>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Form</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Created</TableHead>
                  <TableHead className="hidden lg:table-cell">Updated</TableHead>
                  <TableHead className="w-32 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      Loading forms...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-destructive">
                      Failed to load forms.
                    </TableCell>
                  </TableRow>
                ) : forms?.length ? (
                  forms.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex min-w-0 flex-col gap-1">
                          <Link
                            href={`/dashboard/forms/${item.id}`}
                            className="w-fit font-medium underline-offset-4 hover:underline"
                          >
                            {item.title}
                          </Link>
                          <p className="max-w-xl truncate text-sm text-muted-foreground">
                            {item.description || "No description"}
                          </p>
                          <p className="max-w-xl truncate text-xs text-muted-foreground font-mono">
                            /{item.slug}
                          </p>
                          {isFetching && (
                            <Badge variant="secondary" className="mt-1 w-fit">
                              Refreshing
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant={item.status === "PUBLISHED" ? "default" : "secondary"}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {formatDate(item.createdAt)}
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground lg:table-cell">
                        {formatDate(item.updatedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button asChild size="icon" variant="outline">
                            <Link href={`/dashboard/forms/${item.id}`}>
                              <UserRoundPen className="h-4 w-4" />
                            </Link>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" disabled={cloneStatus === "pending"}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/analytics/${item.id}`}>
                                  <BarChart2 className="mr-2 h-4 w-4" />
                                  Analytics
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCloneForm(item.id)}>
                                <CopyIcon className="mr-2 h-4 w-4" />
                                Clone Form
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No forms yet. Create your first form to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create form</DialogTitle>
            <DialogDescription>
              Add a title and optional description.
            </DialogDescription>
          </DialogHeader>

          <form
            className="flex flex-col gap-6"
            onSubmit={form.handleSubmit(handleSubmitForm)}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="title">Title</FieldLabel>
                <Input
                  id="title"
                  placeholder="Customer feedback"
                  maxLength={55}
                  required
                  {...form.register("title", { required: true })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="slug">Custom Slug</FieldLabel>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground shrink-0 select-none">/f/</span>
                  <Input
                    id="slug"
                    placeholder={derivedSlug}
                    maxLength={255}
                    {...form.register("slug")}
                  />
                </div>
                <FieldDescription>
                  Optional. URL friendly identifier. Will be generated from title if left blank.
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Textarea
                  id="description"
                  placeholder="Collect feedback from customers"
                  maxLength={255}
                  {...form.register("description")}
                />
                <FieldDescription>
                  Optional. Maximum 255 characters.
                </FieldDescription>
              </Field>
            </FieldGroup>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Form"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
