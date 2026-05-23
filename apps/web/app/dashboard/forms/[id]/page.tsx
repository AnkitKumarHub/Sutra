import Link from "next/link"

import { Button } from "~/components/ui/button"

export default async function FormBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">Form builder</h1>
              <p className="text-sm text-muted-foreground">
                Editing form {id}.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/dashboard/forms">Back to forms</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
