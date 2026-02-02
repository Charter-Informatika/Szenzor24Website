"use client";

import { GoogleIcon } from "@/assets/icons";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

type PropsType = {
  label: string;
};

export function GoogleAuth({ label }: PropsType) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

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
