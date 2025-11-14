"use client";

import React, { useState } from "react";
import Image from "next/image";

interface Szenzor {
  id: number;
  name: string;
  imageUrl: string;
}

const szenzorData: Szenzor[] = [
  {
    id: 1,
    name: "HTU21D hőmérséklet- és páratartalom szenzor",
    imageUrl: "/images/szenzorok/htu21.png",
  },
  {
    id: 2,
    name: "MPU-6050 giroszkóp és hőmérséklet szenzor",
    imageUrl: "/images/szenzorok/mpu6050.png",
  },
];

const Szenzorok = () => {
  const [selectedSzenzors, setSelectedSzenzors] = useState<number[]>([]);

  const toggleSzenzor = (id: number) => {
    if (selectedSzenzors.includes(id)) {
      setSelectedSzenzors(selectedSzenzors.filter((szId) => szId !== id));
    } else {
      setSelectedSzenzors([...selectedSzenzors, id]);
    }
  };

  return (
    <section id="szenzorok" className="relative z-10 pt-[110px] pb-[110px]">
      <div className="container">
        <div
          className="wow fadeInUp mx-auto mb-14 max-w-[690px] text-center lg:mb-[70px]"
          data-wow-delay=".2s"
        >
          <h2 className="mb-4 text-3xl font-bold text-black dark:text-white sm:text-4xl md:text-[44px] md:leading-tight">
            Szenzorok
          </h2>
          <p className="text-base text-body">
            Válassza ki a számára megfelelő szenzorokat. Kattintson a kártyákra a kijelöléshez.
          </p>
        </div>

        <div className="container max-w-[1390px]">
          <div className="rounded-2xl bg-white px-5 pb-14 pt-14 shadow-card dark:bg-dark dark:shadow-card-dark md:pb-10 lg:pb-14 lg:pt-20 xl:px-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center max-w-[800px] mx-auto">
              {szenzorData.map((szenzor) => {
                const isSelected = selectedSzenzors.includes(szenzor.id);
                return (
                  <div
                    key={szenzor.id}
                    className="w-full max-w-[310px]"
                  >
                    <div
                      onClick={() => toggleSzenzor(szenzor.id)}
                      className={`wow fadeInUp group h-full flex flex-col cursor-pointer rounded-xl border-2 p-6 text-center transition-all duration-300 hover:shadow-lg select-none ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-lg dark:bg-primary/10"
                          : "border-gray-200 bg-gray-50 dark:border-[#2A2E44] dark:bg-[#1A1D2E]"
                      }`}
                      data-wow-delay=".2s"
                    >
                      {/* Checkbox indikátor */}
                      <div className="mb-4 flex justify-end">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all ${
                            isSelected
                              ? "border-primary bg-primary"
                              : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
                          }`}
                        >
                          {isSelected && (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M13.3334 4L6.00002 11.3333L2.66669 8"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* Szenzor kép */}
                      <div className="relative mx-auto mb-6 h-[180px] w-full overflow-hidden rounded-lg pointer-events-none select-none">
                        <Image
                          src={szenzor.imageUrl}
                          alt={szenzor.name}
                          fill
                          className="object-cover select-none pointer-events-none"
                          draggable={false}
                        />
                      </div>

                      {/* Szenzor név */}
                      <h3
                        className={`text-xl font-semibold transition-colors sm:text-[22px] ${
                          isSelected
                            ? "text-primary dark:text-primary"
                            : "text-black dark:text-white"
                        }`}
                      >
                        {szenzor.name}
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Szenzorok;
