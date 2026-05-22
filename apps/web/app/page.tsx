"use client";

import { useUser } from "~/hooks/api/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user } = useUser();
  const router = useRouter();
  // const { status } = await api.health.getHealth.query();

  useEffect(() => {
    if (user && user.id) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [user, router]);

  return (
    <main className="min-h-screen min-w-screen flex justify-center items-center">
      <div>
        {/* <h1 className="text-3xl">Ankit</h1> */}
        {/* <h2>Server Status: {status}</h2> */}
        <div>{JSON.stringify({ user }, null, 2)}</div>
      </div>
    </main>
  );
}
