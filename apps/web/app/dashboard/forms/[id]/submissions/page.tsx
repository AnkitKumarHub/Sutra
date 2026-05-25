"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { format } from "date-fns"
import { DownloadIcon } from "lucide-react"
import { toast } from "sonner"

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { useGetFields, useGetFormSubmissions, useExportCsv } from "~/hooks/api/form"

const formatSubmittedAt = (value: Date | string | null | undefined) => {
  if (!value) return "—"

  const parsedDate = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(parsedDate.getTime())) return "—"

  return format(parsedDate, "PPp")
}

export default function FormSubmissionsPage() {
  const params = useParams<{ id: string }>()
  const formId = Array.isArray(params.id) ? params.id[0] : params.id

  const {
    fields,
    error: fieldsError,
    isFetching: fieldsFetching,
    isFetched: fieldsFetched,
    isLoading: fieldsLoading,
  } = useGetFields(formId ?? "")

  const shouldFetchSubmissions = Boolean(formId) && fieldsFetched && !fieldsError

  const {
    submissions,
    error: submissionsError,
    isFetching: submissionsFetching,
    isLoading: submissionsLoading,
  } = useGetFormSubmissions(formId ?? "", shouldFetchSubmissions)

  const { exportCsvAsync, status: exportStatus } = useExportCsv()
  const isExporting = exportStatus === "pending"

  const orderedFields = useMemo(() => fields ?? [], [fields])

  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([])

  const openExportDialog = () => {
    setSelectedFieldIds(orderedFields.map(f => f.id))
    setExportDialogOpen(true)
  }

  const handleToggleField = (fieldId: string) => {
    setSelectedFieldIds(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    )
  }

  const handleExportCsv = async () => {
    if (!formId) return
    try {
      const { csvContent, filename } = await exportCsvAsync({
        formId,
        fieldIds: selectedFieldIds,
      })

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", filename)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success("Export successful")
      setExportDialogOpen(false)
    } catch (err) {
      console.error("Export failed", err)
      toast.error("Failed to export CSV")
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">Form submissions</h1>
              <p className="text-sm text-muted-foreground">Viewing responses for form {formId}.</p>
              {fieldsFetching || submissionsFetching ? (
                <p className="text-xs text-muted-foreground">Refreshing...</p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline">
                <Link href={`/dashboard/forms/${formId}`}>Back to builder</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/forms">Back to forms</Link>
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1.5">
                <CardTitle>Responses</CardTitle>
                <CardDescription>
                  Each row is one submission. Columns are generated from your current field labels.
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={openExportDialog}
                disabled={!submissions || submissions.length === 0}
              >
                <DownloadIcon className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              {fieldsLoading ? (
                <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-muted-foreground mt-4">
                  Loading fields...
                </div>
              ) : fieldsError ? (
                <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-destructive mt-4">
                  Failed to load fields.
                </div>
              ) : orderedFields.length === 0 ? (
                <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-muted-foreground mt-4">
                  No fields found for this form.
                </div>
              ) : submissionsLoading ? (
                <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-muted-foreground mt-4">
                  Loading submissions...
                </div>
              ) : submissionsError ? (
                <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-destructive mt-4">
                  Failed to load submissions.
                </div>
              ) : !submissions || submissions.length === 0 ? (
                <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-muted-foreground mt-4">
                  No submissions yet.
                </div>
              ) : (
                <div className="mt-4 rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Submitted At</TableHead>
                        {orderedFields.map((field) => (
                          <TableHead key={field.id}>{field.label}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((submission) => {
                        const valuesByFieldId = new Map(
                          (submission.values ?? []).map((item) => [item.fieldId, item.value]),
                        )

                        return (
                          <TableRow key={submission.id}>
                            <TableCell className="whitespace-nowrap">{formatSubmittedAt(submission.createdAt)}</TableCell>
                            {orderedFields.map((field) => {
                              const rawValue = valuesByFieldId.get(field.id)

                              if (rawValue === undefined || rawValue === null || rawValue === "") {
                                return <TableCell key={field.id}>—</TableCell>
                              }

                              if (field.type === "CHECKBOX" && typeof rawValue === "boolean") {
                                return <TableCell key={field.id}>{rawValue ? "Yes" : "No"}</TableCell>
                              }

                              if (Array.isArray(rawValue)) {
                                return <TableCell key={field.id}>{rawValue.join(", ") || "—"}</TableCell>
                              }

                              return <TableCell key={field.id}>{String(rawValue)}</TableCell>
                            })}
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export CSV</DialogTitle>
            <DialogDescription>
              Select the fields you want to include in the CSV export.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="font-medium text-sm">Fields to export</div>
            <div className="max-h-[300px] overflow-y-auto space-y-3">
              {orderedFields.map((field) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`export-${field.id}`} 
                    checked={selectedFieldIds.includes(field.id)}
                    onCheckedChange={() => handleToggleField(field.id)}
                  />
                  <label 
                    htmlFor={`export-${field.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {field.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)} disabled={isExporting}>
              Cancel
            </Button>
            <Button onClick={handleExportCsv} disabled={isExporting || selectedFieldIds.length === 0}>
              {isExporting ? "Exporting..." : "Download CSV"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
