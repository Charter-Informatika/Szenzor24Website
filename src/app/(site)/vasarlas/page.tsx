"use client";

import React, { useEffect } from "react";
import ProductConfigurator from "@/components/Vasarlas/ProductConfigurator";

export default function VasarlasPage() {

    useEffect(() => {
          document.title = "Rendelés - Szenzor24";
        }, []);

  return (
    <main className="pt-[100px] pb-20">
      <ProductConfigurator />
    </main>
  );
}
