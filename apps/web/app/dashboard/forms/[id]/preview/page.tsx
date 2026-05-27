"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useGetFormById, useGetPagesByFormId } from "~/hooks/api/form";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function FormPreviewPage() {
  const params = useParams<{ id: string }>();
  const formId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { form, isLoading, error } = useGetFormById(formId ?? "");
  const { pages } = useGetPagesByFormId(formId ?? "");

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Loading preview...</div>;
  if (error || !form) return <div className="p-6 text-sm text-destructive">Form not found.</div>;

  return (
    <div className="mx-auto w-full max-w-3xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{form.title} (Preview)</h1>
        <Link href={`/dashboard/forms/${formId}`} className="text-sm underline">Back to Builder</Link>
      </div>
      {form.description && <p className="text-sm text-muted-foreground">{form.description}</p>}
      {pages && pages.length > 0 && (
        <p className="text-xs text-muted-foreground">Pages: {pages.map((p) => p.title).join(" • ")}</p>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Fields</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {form.fields.map((field) => (
            <div key={field.id} className="rounded border p-3">
              <p className="text-sm font-medium">
                {field.label} {field.isRequired ? "*" : ""}
              </p>
              <p className="text-xs text-muted-foreground">{field.type}</p>
              {field.description && <p className="text-xs text-muted-foreground mt-1">{field.description}</p>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

