"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { format } from "date-fns"

import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { useGetFields, useGetFormSubmissions } from "~/hooks/api/form"

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

  const orderedFields = useMemo(() => fields ?? [], [fields])

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
            <CardHeader>
              <CardTitle>Responses</CardTitle>
              <CardDescription>
                Each row is one submission. Columns are generated from your current field labels.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {fieldsLoading ? (
                <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                  Loading fields...
                </div>
              ) : fieldsError ? (
                <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-destructive">
                  Failed to load fields.
                </div>
              ) : orderedFields.length === 0 ? (
                <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                  No fields found for this form.
                </div>
              ) : submissionsLoading ? (
                <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                  Loading submissions...
                </div>
              ) : submissionsError ? (
                <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-destructive">
                  Failed to load submissions.
                </div>
              ) : !submissions || submissions.length === 0 ? (
                <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                  No submissions yet.
                </div>
              ) : (
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
                          <TableCell>{formatSubmittedAt(submission.createdAt)}</TableCell>
                          {orderedFields.map((field) => {
                            const rawValue = valuesByFieldId.get(field.id)

                            if (rawValue === undefined || rawValue === null || rawValue === "") {
                              return <TableCell key={field.id}>—</TableCell>
                            }

                            if (field.type === "CHECKBOX" && typeof rawValue === "boolean") {
                              return <TableCell key={field.id}>{rawValue ? "Yes" : "No"}</TableCell>
                            }

                            if (Array.isArray(rawValue)) {
                              return <TableCell key={field.id}>{rawValue.join(", ") || "â€”"}</TableCell>
                            }

                            return <TableCell key={field.id}>{String(rawValue)}</TableCell>
                          })}
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
