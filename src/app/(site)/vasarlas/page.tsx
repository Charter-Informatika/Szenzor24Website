"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ProductConfigurator from "@/components/Vasarlas/ProductConfigurator";

export default function VasarlasPage() {
  // TEMP: disable forced login for UI testing. Set to true to restore.
  const FORCE_LOGIN = false;
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (FORCE_LOGIN && status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/vasarlas");
    }
  }, [FORCE_LOGIN, status, router]);

  // Loading állapot
  if (FORCE_LOGIN && status === "loading") {
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
  if (FORCE_LOGIN && !session) {
    return null;
  }

  return (
    <main className="pt-[100px] pb-20">
      <ProductConfigurator />
    </main>
  );
}
