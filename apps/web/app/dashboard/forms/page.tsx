export default function FormsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Forms</h1>
            <p className="text-sm text-muted-foreground">
              Manage and create forms from this dashboard section.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
