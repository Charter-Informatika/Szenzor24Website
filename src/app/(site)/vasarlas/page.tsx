"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ProductConfigurator from "@/components/Vasarlas/ProductConfigurator";

export default function VasarlasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/vasarlas");
    }
  }, [status, router]);

  // Loading állapot
  if (status === "loading") {
    return (
      <main className="pt-[100px] pb-20">
        <div className="container flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-body">Betöltés...</p>
          </div>
        </div>
      </main>
    );
  }

  // Ha nincs bejelentkezve, ne rendereljük a tartalmat (redirect folyamatban)
  if (!session) {
    return null;
  }

  return (
    <main className="pt-[100px] pb-20">
      <ProductConfigurator />
    </main>
  );
}
