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
    description: 'Pontosság,gyors mintavétel és naplózás – az alapvető környezeti adatgyűjtéshez.',
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
    title: 'Rezgés\nszenzor',
    description: 'Minták elemzése.',
  },
  {
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 7h10v10H7z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Energia\n&fogyasztás szenzor',
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
    title: 'Co2\nszenzor',
    description: 'Co2 és szén-dioxid szint figyelése a levegőminőséghez.',
  },
  {
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 9v6M10 7v10M14 5v14M18 8v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="3" cy="12" r="2" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
    title: 'Zajszint szenzor',
    description: 'Decibel alapú zajszint-mérés és monitoring.',
  },
  {
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 2v3M12 19v3M22 12h-3M5 12H2M19.08 4.92l-2.12 2.12M7.04 16.96l-2.12 2.12M19.08 19.08l-2.12-2.12M7.04 7.04L4.92 4.92" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Fényerő szenzor',
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
    title: 'Ajtónyitás szenzor',
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
    title: 'Infravörös szenzor',
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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [mouseStart, setMouseStart] = useState<number | null>(null);
  const [mouseEnd, setMouseEnd] = useState<number | null>(null);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(featuresData.length / itemsPerPage);
  const prev = () => setSlide((s) => (s - 1 + totalPages) % totalPages);
  const next = () => setSlide((s) => (s + 1) % totalPages);
  const pageItems = featuresData.slice(slide * itemsPerPage, slide * itemsPerPage + itemsPerPage);

  // Handle swipe/drag
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEnd(e.changedTouches[0].clientX);
    handleSwipe(touchStart, e.changedTouches[0].clientX);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setMouseStart(e.clientX);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    setMouseEnd(e.clientX);
    handleSwipe(mouseStart, e.clientX);
  };

  const handleSwipe = (start: number | null, end: number | null) => {
    if (!start || !end) return;
    
    const distance = start - end;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      next();
    } else if (isRightSwipe) {
      prev();
    }
  };

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
        <div className="container max-w-[1320px]">
          {/* Images moved from Pricing: show above the features heading */}
          <div className="mb-6 max-w-[1320px] mx-auto px-4">
            {/* First 4 images: stretched on mobile, spaced apart on desktop */}
            <div className="grid grid-cols-2 md:flex md:justify-between gap-4 mb-4">
              <img src="/images/hero/szenzorkep1.png" alt="Szenzor 1" className="w-full md:w-auto h-auto max-h-[400px] object-contain rounded-lg" />
              <img src="/images/hero/szenzorkep2.png" alt="Szenzor 2" className="w-full md:w-auto h-auto max-h-[400px] object-contain rounded-lg" />
              <img src="/images/hero/szenzorkep3.png" alt="Szenzor 3" className="w-full md:w-auto h-auto max-h-[400px] object-contain rounded-lg" />
              <img src="/images/hero/szenzorkep4.png" alt="Szenzor 4" className="w-full md:w-auto h-auto max-h-[400px] object-contain rounded-lg" />
            </div>
            {/* Large image spanning full width */}
            <img src="/images/hero/szenzorkep5.png" alt="Szenzor 5" className="w-full h-auto max-h-[800px] object-contain rounded-lg" />
          </div>

          <div
            className="wow fadeInUp mx-auto mb-14 max-w-[690px] text-center lg:mb-[70px]"
            data-wow-delay=".2s"
          >
            <h2 className="mt-12 mb-4 text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-black dark:text-white leading-tight">
              A szenzoraink előnyei és fő jellemzői
            </h2>
            <ul className="mb-6 text-base sm:text-lg leading-relaxed text-left max-w-2xl mx-auto list-none">
                    <li className="flex items-start mb-4"><span className="text-primary font-bold mr-2 flex-shrink-0">✓</span><span>Automatikus adatnaplózás – Megszabadulhat a napi kézi mérésektől és adminisztrációtól.</span></li>
                    <li className="flex items-start mb-4"><span className="text-primary font-bold mr-2 flex-shrink-0">✓</span><span>Biztos lehet benne, hogy adatai mindig pontosak és visszakövethetők.</span></li>
                    <li className="flex items-start mb-4"><span className="text-primary font-bold mr-2 flex-shrink-0">✓</span><span>Távoli elérés – Bárhol és bármikor ellenőrizheti az adatokat online felületen keresztül.</span></li>
                  </ul>
          </div>
        </div>

        <div className="container max-w-[1320px]">
          <div className="rounded-2xl bg-white px-5 pb-14 pt-14 shadow-card dark:bg-dark dark:shadow-card-dark md:pb-1 lg:pb-5 lg:pt-20 xl:px-10">
            <div className="mb-6 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  className={`h-2 rounded-full transition-all ${
                    slide === i ? 'w-8 bg-slate-400' : 'w-2 bg-slate-300'
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Horizontal slider grid with swipe/drag support */}
            <div 
              className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 px-2 sm:px-4 cursor-grab active:cursor-grabbing select-none"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
            >
              {pageItems.map((item, index) => (
                <div key={index} className="w-full">
                  <div
                    className="wow fadeInUp group w-full h-full flex flex-col items-center text-center pointer-events-none"
                    data-wow-delay=".2s"
                  >
                    <div className="mx-auto mb-3 sm:mb-8 flex h-12 sm:h-[90px] w-12 sm:w-[90px] items-center justify-center rounded-2xl sm:rounded-3xl bg-gray-100 text-primary duration-300 group-hover:bg-primary group-hover:text-white dark:bg-[#2A2E44] dark:text-white dark:group-hover:bg-primary border border-slate-200 flex-shrink-0">
                      <div className="scale-50 sm:scale-100 origin-center">
                        {item.icon}
                      </div>
                    </div>
                    <h3 className="mb-1 sm:mb-4 text-xs sm:text-xl font-semibold text-black dark:text-white whitespace-pre-line line-clamp-2 sm:line-clamp-none">
                      {item.title}
                    </h3>
                    <p className="hidden sm:block text-base text-body">{item.description}</p>
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
