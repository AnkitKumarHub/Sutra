"use client";

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TRPCClientError } from "@repo/trpc/client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/navigation";
import React, { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "~/components/ui/sonner";

import { trpc } from "~/trpc/client";
import { createTRPCHttpBatchClientClient } from "~/trpc/create-client";

function isUnauthorizedError(error: unknown): boolean {
  if (!(error instanceof TRPCClientError)) {
    return false;
  }

  return (
    error.data?.code === "UNAUTHORIZED" ||
    error.message.toLowerCase().includes("session expired")
  );
}

export const GlobalProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const redirectingRef = useRef(false);

  const handleUnauthorized = useMemo(
    () => (error: unknown) => {
      if (redirectingRef.current || !isUnauthorizedError(error)) {
        return;
      }
      redirectingRef.current = true;
      toast.error("Session expired, please login again.");
      const currentPath = window.location.pathname + window.location.search;
      const loginUrl = `/login?reason=session-expired&redirect=${encodeURIComponent(currentPath)}`;
      router.replace(loginUrl);
    },
    [router],
  );

  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: handleUnauthorized,
        }),
        mutationCache: new MutationCache({
          onError: handleUnauthorized,
        }),
        defaultOptions: {
          queries: {
            refetchOnMount: true,
            staleTime: Infinity,
          },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [createTRPCHttpBatchClientClient()],
    }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <trpc.Provider queryClient={queryClient} client={trpcClient}>
          {children}
          <Toaster />
        </trpc.Provider>
      </NextThemesProvider>
    </QueryClientProvider>
  );
};
