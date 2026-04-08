"use client";

import { passwordValidation } from "@/utils/validations";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

const ResetPassword = ({ userEmail }: { userEmail: string }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!inputRef.current) return;

    const password = inputRef.current.value;

    if (!passwordValidation(password)) {
      setError(
        "A jelszónak legalább egy nagybetűt, egy kisbetűt, egy számot és egy speciális karaktert kell tartalmaznia",
      );
      return;
    }

    try {
      await axios.post("/api/forget-password/update", {
        email: userEmail,
        password,
      });

      toast.success("Jelszó sikeresen frissítve!");
      router.push("/auth/signin");
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data || "Hiba történt.");
      }
    }
  };

  return (
    <main className="pt-[150px] pb-[110px] lg:pt-[220px]">
      <div className="container overflow-hidden lg:max-w-[1250px]">
        <div className="shadow-card dark:shadow-card-dark mx-auto w-full max-w-[520px] rounded-lg bg-[#F8FAFB] px-6 py-10 sm:p-[50px] dark:bg-[#15182A]">
          <div className="text-center">
            <h3 className="mb-[10px] text-2xl font-bold text-black sm:text-[28px] dark:text-white">
              Jelszó módosítása
            </h3>

          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label
                htmlFor="password"
                className="mb-[10px] block text-sm text-black dark:text-white"
              >
                Új jelszó
              </label>
              <input
                id="password"
                ref={inputRef}
                type="password"
                placeholder="Ide írhatod az új jelszavad"
                required
                className="border-stroke text-body focus:border-primary focus:shadow-input dark:border-stroke-dark dark:focus:border-primary w-full rounded-md border bg-white px-6 py-3 text-base font-medium outline-hidden dark:bg-black dark:text-white"
              />

              {error && <p className="mt-2 text-red-500">{error}</p>}
            </div>

            <button
            type="submit"
            className="mx-auto mt-5 inline-flex items-center justify-center gap-2.5 rounded-full bg-primary px-6 py-3 font-medium text-white duration-300 ease-in-out hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90"
            >
                Mentés
              <svg
                className="fill-white"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.4767 6.16664L6.00668 1.69664L7.18501 0.518311L13.6667 6.99998L7.18501 13.4816L6.00668 12.3033L10.4767 7.83331H0.333344V6.16664H10.4767Z"
                  fill=""
                />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default ResetPassword;
