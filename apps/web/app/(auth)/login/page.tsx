import { LoginForm } from "~/components/login-form"

type LoginPageProps = {
  searchParams?: {
    reason?: string
  }
}

export default function Page({ searchParams }: LoginPageProps) {
  const showSessionExpiredMessage = searchParams?.reason === "session-expired"

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm space-y-4">
        {showSessionExpiredMessage && (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
            Session expired. Please login again to continue.
          </div>
        )}
        <LoginForm />
      </div>
    </div>
  )
}
