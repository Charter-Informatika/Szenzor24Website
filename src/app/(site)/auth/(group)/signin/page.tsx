"use client";

import React, { useEffect } from "react";
import { GoogleAuth } from "@/components/Auth/google-auth";
import { TabContent, TabList, Tabs, TabTrigger } from "@/components/ui/tabs";
import { SignInForm } from "./_components/form";

const TABS = [
  { value: "password", label: "Jelszó" }
];

const SigninPage = () => {

  useEffect(() => {
    document.title = "Bejelentkezés - Szenzor24";
  }, []);

  return (
    <>
      <div className="text-center">
        <h3 className="mb-[10px] text-2xl font-bold text-black sm:text-[28px] dark:text-white">
          Bejelentkezés
        </h3>

        <p className="text-body mb-5">
          Használja a Google fiókját a bejelentkezéshez
        </p>

        <GoogleAuth label="Bejelentkezés Google fiókkal" />

        <div className="relative my-7.5 flex items-center">
          <div className="bg-stroke dark:bg-stroke-dark h-[1px] w-full max-[200px]:hidden" />
          <p className="text-body absolute right-1/2 translate-x-1/2 bg-[#F8FAFB] px-5 min-[200px]:whitespace-nowrap dark:bg-[#15182A]">
            vagy jelentkezzen be az email címével
          </p>
        </div>
      </div>

      <Tabs defaultValue="password">
        <TabContent value="password">
          <SignInForm />
        </TabContent>
      </Tabs>
    </>
  );
};

export default SigninPage;
