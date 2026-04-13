"use client";

import { GoogleAuth } from "@/components/Auth/google-auth";
import { MagicLinkForm } from "@/components/Auth/magic-link-form";
import { TabContent, TabList, Tabs, TabTrigger } from "@/components/ui/tabs";
import { SignUpForm } from "./_components/form";
import { useEffect } from "react";

const TABS = [
  { value: "password", label: "Jelszó" }
];

export default function Register() {

    useEffect(() => {
        document.title = "Regisztráció - Szenzor24";
      }, []);

  return (
    <>
      <div className="text-center">
        <h3 className="mb-[10px] text-2xl font-bold text-black sm:text-[28px] dark:text-white">
          Fiók létrehozása
        </h3>
        <p className="text-body mb-5 text-base">
          Teljesen ingyenes és nagyon egyszerű
        </p>

        <GoogleAuth label="Regisztráció Google fiókkal" />

        <div className="relative my-7.5 flex items-center">
          <div className="bg-stroke dark:bg-stroke-dark h-[1px] w-full max-[200px]:hidden" />
          <p className="text-body absolute right-1/2 translate-x-1/2 bg-[#F8FAFB] px-5 min-[200px]:whitespace-nowrap dark:bg-[#15182A]">
            vagy regisztráljon az email címével
          </p>
        </div>
      </div>

      <Tabs defaultValue="password">
        <TabContent value="password">
          <SignUpForm />
        </TabContent>
      </Tabs>
    </>
  );
}
