"use client";

import React, { useState, useEffect } from "react";
import Graphics from "@/components/Features/Graphics";
import { Feature } from "@/types/feature";

 // 3.feladat lesz itt
const featuresData: Feature[] = [
  {
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 8v2a5 5 0 0010 0V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 22a7 7 0 007-7v-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Hőmérséklet szenzor',
    description: 'Pontosság, gyors mintavétel és HACCP-kompatibilis naplózás – az alapvető környezeti adatgyűjtéshez.',
  },
  {
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 8l3-3 4 4 5-5 2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Páratartalom szenzor',
    description: 'Folyamatos páratartalom-figyelés a tárolási körülmények stabilizálásához.',
  },
  {
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 2v6M12 16v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Rezgés / állapot szenzor',
    description: 'Minták elemzése.',
  },
  {
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 7h10v10H7z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Energia & fogyasztás szenzor',
    description: 'Valós idejű hatékonysági riasztások.',
  },
  {
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
    title: 'Levegőminőség szenzor',
    description: 'Helyiségek egészségének és biztonságának fenntartásához.',
  },
  {
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 8l3-3 4 4 5-5 2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Nedvesség szenzor',
    description: 'Folyamatos nedvesség-figyelés a tárolási körülmények stabilizálásához.',
  },
  {
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 8v4m0 4v.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 12h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Légnyomás szenzor',
    description: 'Folyamatos légnyomás-figyelés a tárolási körülmények stabilizálásához.',
  },
  {
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="6" cy="12" r="2" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="6" r="2" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="18" cy="12" r="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M7 11l4-4M13 5l5 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    title: 'Co2 szenzor',
    description: 'CO₂ és szén-dioxid szint figyelése a levegőminőséghez.',
  },
  {
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 9v6M10 7v10M14 5v14M18 8v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="3" cy="12" r="2" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
    title: 'zajszint szenzor',
    description: 'Decibel alapú zajszint-mérés és monitoring.',
  },
  {
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 2v3M12 19v3M22 12h-3M5 12H2M19.08 4.92l-2.12 2.12M7.04 16.96l-2.12 2.12M19.08 19.08l-2.12-2.12M7.04 7.04L4.92 4.92" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'fényerő szenzor',
    description: 'Lux szint alapú fényerősség detektálása.',
  },
  {
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="12" height="16" rx="1" stroke="currentColor" strokeWidth="1.6" />
        <path d="M15 4v16M10 12h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    ),
    title: 'ajtónyitás szenzor',
    description: 'Ajtó és ablak nyitás/zárás érzékelése.',
  },
  {
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="16" cy="8" r="2" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="8" cy="16" r="2" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="16" cy="16" r="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    title: 'infravörös szenzor',
    description: 'Mozgás- és hőérzékelés infravörös technológiával.',
  },
  {
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 8l2 2 2-2M5 12l2 2 2-2M5 16l2 2 2-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 8l2 2 2-2M17 12l2 2 2-2M17 16l2 2 2-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="11" y1="6" x2="11" y2="18" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2" />
      </svg>
    ),
    title: 'Mágneses tér szenzor',
    description: 'Mágneses tér anomália és erősség detektálása.',
  }
  

];

const Features = () => {
  const [slide, setSlide] = useState<number>(0);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(featuresData.length / itemsPerPage);
  const prev = () => setSlide((s) => (s - 1 + totalPages) % totalPages);
  const next = () => setSlide((s) => (s + 1) % totalPages);
  const pageItems = featuresData.slice(slide * itemsPerPage, slide * itemsPerPage + itemsPerPage);

  // Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSlide((s) => (s + 1) % totalPages);
    }, 5000);
    return () => clearInterval(interval);
  }, [totalPages]);

  return (
    <>
      <section id="features" className="relative z-10 pt-[110px]">
        <div className="container">
          {/* Images moved from Pricing: show above the features heading */}
          <div className="mb-6 flex flex-col items-center justify-center gap-6">
            {/* Top row: 4 smaller images in grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-[1200px] px-4">
              <img src="/images/hero/szenzorkep1.png" alt="Szenzor 1" className="w-full h-auto max-h-[400px] object-contain rounded-lg" />
              <img src="/images/hero/szenzorkep2.png" alt="Szenzor 2" className="w-full h-auto max-h-[400px] object-contain rounded-lg" />
              <img src="/images/hero/szenzorkep3.png" alt="Szenzor 3" className="w-full h-auto max-h-[400px] object-contain rounded-lg" />
              <img src="/images/hero/szenzorkep4.png" alt="Szenzor 4" className="w-full h-auto max-h-[400px] object-contain rounded-lg" />
            </div>
            {/* Large image below */}
            <img src="/images/hero/szenzorkep5.png" alt="Szenzor 5" className="w-full max-w-[1000px] h-auto max-h-[700px] object-contain rounded-lg px-4" />
          </div>

          <div
            className="wow fadeInUp mx-auto mb-14 max-w-[690px] text-center lg:mb-[70px]"
            data-wow-delay=".2s"
          >
            <h2 className="mt-12 mb-4 text-3xl font-bold text-black dark:text-white sm:text-4xl md:text-[44px] md:leading-tight">
              A szenzoraink előnyei és fő jellemzői
            </h2>
           <ul className="mb-6 text-base sm:text-lg leading-relaxed text-left max-w-md mx-auto list-none">
                    <li className="flex items-center mb-1"><span className="text-primary font-bold mr-2">✓</span>Automatikus adatnaplózás – Megszabadulhat a napi kézi mérésektől és adminisztrációtól.</li>
                    <li className="flex items-center mb-1"><span className="text-primary font-bold mr-2">✓</span>– Biztos lehet benne, hogy adatai mindig pontosak és visszakövethetők.</li>
                    <li className="flex items-center mb-1"><span className="text-primary font-bold mr-2">✓</span>Távoli elérés – Bárhol és bármikor ellenőrizheti a hőmérsékleti adatokat egy online felületen keresztül.</li>
                  </ul>
          </div>
        </div>

        <div className="container max-w-[1390px]">
          <div className="rounded-2xl bg-white px-5 pb-14 pt-14 shadow-card dark:bg-dark dark:shadow-card-dark md:pb-1 lg:pb-5 lg:pt-20 xl:px-10">
            <div className="mb-6 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    slide === i ? 'w-8 bg-slate-400' : 'w-2 bg-slate-300'
                  }`}
                />
              ))}
            </div>

            <div className="-mx-4 flex flex-wrap">
              {pageItems.map((item, index) => (
                <div key={index} className="w-full px-4 sm:w-1/2 md:w-1/3 lg:w-1/6">
                  <div
                    className="wow fadeInUp group mx-auto mb-[60px] max-w-[310px] text-center"
                    data-wow-delay=".2s"
                  >
                    <div className="mx-auto mb-8 flex h-[90px] w-[90px] items-center justify-center rounded-3xl bg-gray-100 text-primary duration-300 group-hover:bg-primary group-hover:text-white dark:bg-[#2A2E44] dark:text-white dark:group-hover:bg-primary border border-slate-200">
                      {item.icon}
                    </div>
                    <h3 className="mb-4 text-xl font-semibold text-black dark:text-white sm:text-[22px] xl:text-[26px]">
                      {item.title}
                    </h3>
                    <p className="text-base text-body">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/*Graphics*/}
        <Graphics />
      </section>
    </>
  );
};

export default Features;
