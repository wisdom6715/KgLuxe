"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hook/useCurrentUser";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/console/login");
    }
  }, [loading, user, router]);

  // Still checking auth state — avoid flashing the dashboard
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-dark-brown border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in — redirect is firing, render nothing in the meantime
  if (!user) {
    return null;
  }

  return <>{children}</>;
}