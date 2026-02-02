"use client";

import React from "react";
import ProductConfigurator from "@/components/Vasarlas/ProductConfigurator";
import type { Metadata } from "next";

export default function VasarlasPage() {
  return (
    <main className="pt-[100px] pb-20">
      <ProductConfigurator />
    </main>
  );
}
