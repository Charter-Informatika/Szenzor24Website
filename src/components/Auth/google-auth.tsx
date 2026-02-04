"use client";

import { GoogleIcon } from "@/assets/icons";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

type PropsType = {
  label: string;
};

function GoogleAuthInner({ label, callbackUrl }: PropsType & { callbackUrl: string }) {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl })}
      className="border-stroke text-body hover:text-primary dark:border-stroke-dark dark:bg-dark flex w-full items-center justify-center gap-3 rounded-md border bg-white p-3 text-base font-medium"
    >
      <GoogleIcon />

      <span>{label}</span>
    </button>
  );
}

function GoogleAuthWithParams({ label }: PropsType) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  return <GoogleAuthInner label={label} callbackUrl={callbackUrl} />;
}

export function GoogleAuth({ label }: PropsType) {
  return (
    <Suspense fallback={<div className="border-stroke dark:border-stroke-dark dark:bg-dark flex w-full items-center justify-center gap-3 rounded-md border bg-white p-3 text-base font-medium h-12" />}>
      <GoogleAuthWithParams label={label} />
    </Suspense>
  );
}
