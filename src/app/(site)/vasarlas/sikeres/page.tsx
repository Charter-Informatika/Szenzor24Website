"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OrderSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to homepage after 3 seconds
    const timer = setTimeout(() => {
      router.push("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="pt-[100px] pb-20">
      <div className="container flex items-center justify-center min-h-[500px]">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <svg
              className="w-16 h-16 text-green-500 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Sikeres rendelés!
          </h1>
          <p className="text-body mb-2">
            Köszönjük a rendelést!
          </p>
          <p className="text-body-secondary text-sm">
            A rendelés visszaigazolása elküldésre került az email címére.
          </p>
          <p className="text-body-secondary text-sm mt-6">
            Az oldal hamarosan visszairányítja Önt a főoldalra...
          </p>
          <div className="mt-8">
            <button
              onClick={() => router.push("/")}
              className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Vissza a főoldalra
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
