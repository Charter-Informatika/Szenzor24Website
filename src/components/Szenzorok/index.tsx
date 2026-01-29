"use client";

import React, { useState, useEffect } from "react";
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
  {
    id: 3,
    name: "Gáz szenzor",
    imageUrl: "/images/szenzorok/gassensor.png",
  },
  {
    id: 4,
    name: "Hőmérséklet szenzor",
    imageUrl: "/images/szenzorok/homersekletsensor.png",
  },
  {
    id: 5,
    name: "Fény szenzor",
    imageUrl: "/images/szenzorok/lightsensor.png",
  },
  {
    id: 6,
    name: "Hidrogén szenzor",
    imageUrl: "/images/szenzorok/hidrogensensor.png",
  },
  {
    id: 7,
    name: "Metán szenzor",
    imageUrl: "/images/szenzorok/metan.png",
  },
  {
    id: 8,
    name: "SENSORION hőmérséklet szenzor",
    imageUrl: "/images/szenzorok/levegominoseg.png",
  },
];

const Szenzorok = () => {
  const [selectedSzenzors, setSelectedSzenzors] = useState<number[]>([]);
  const [slide, setSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [mouseStart, setMouseStart] = useState<number | null>(null);
  const [mouseEnd, setMouseEnd] = useState<number | null>(null);
  const itemsPerSlide = 4;
  const totalSlides = Math.ceil(szenzorData.length / itemsPerSlide);

  const prevSlide = () => setSlide((s) => (s - 1 + totalSlides) % totalSlides);
  const nextSlide = () => setSlide((s) => (s + 1) % totalSlides);

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
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  // Auto-slide disabled - users can manually navigate
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setSlide((s) => (s + 1) % totalSlides);
  //   }, 5000);
  //   return () => clearInterval(interval);
  // }, [totalSlides]);

  const toggleSzenzor = (id: number) => {
    if (selectedSzenzors.includes(id)) {
      setSelectedSzenzors(selectedSzenzors.filter((szId) => szId !== id));
    } else {
      setSelectedSzenzors([...selectedSzenzors, id]);
    }
  };

  const currentItems = szenzorData.slice(slide * itemsPerSlide, (slide + 1) * itemsPerSlide);

  return (
    <section id="szenzorok" className="relative z-10 pt-16 pb-16 sm:pt-[110px] sm:pb-[110px]">
      <div className="container px-3 sm:px-4">
        <div
          className="wow fadeInUp mx-auto mb-10 sm:mb-14 max-w-[690px] text-center lg:mb-[70px]"
          data-wow-delay=".2s"
        >
          <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl font-bold text-black dark:text-white md:text-4xl lg:text-[44px] lg:leading-tight">
            Szenzorok
          </h2>
          <p className="text-sm sm:text-base text-body px-2">
            Válassza ki a számára megfelelő szenzorokat. Kattintson a kártyákra a kijelöléshez.
          </p>
        </div>

        <div className="container max-w-[1320px] px-0">
          <div className="rounded-xl sm:rounded-2xl bg-white px-3 sm:px-5 pb-10 sm:pb-14 pt-10 sm:pt-14 shadow-card dark:bg-dark dark:shadow-card-dark md:pb-10 lg:pb-14 lg:pt-20 xl:px-10">
            {/* Slider dots with navigation buttons */}
            <div className="mb-6 sm:mb-8 flex items-center justify-center gap-4">
              <button
                onClick={() => setSlide((s) => (s - 1 + totalSlides) % totalSlides)}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200 text-black hover:bg-primary hover:text-white transition-all dark:bg-[#2A2E44] dark:text-white dark:hover:bg-primary"
                aria-label="Previous slide"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div className="flex gap-2">
                {Array.from({ length: totalSlides }).map((_, i) => (
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

              <button
                onClick={() => setSlide((s) => (s + 1) % totalSlides)}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200 text-black hover:bg-primary hover:text-white transition-all dark:bg-[#2A2E44] dark:text-white dark:hover:bg-primary"
                aria-label="Next slide"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Slider container */}
            <div 
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 px-2 sm:px-4 cursor-grab active:cursor-grabbing"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
            >
              {currentItems.map((szenzor) => {
                const isSelected = selectedSzenzors.includes(szenzor.id);
                return (
                  <div
                    key={szenzor.id}
                    className="w-full"
                  >
                    <button
                      onClick={() => toggleSzenzor(szenzor.id)}
                      className={`wow fadeInUp group h-full w-full flex flex-col items-center gap-2 rounded-lg border-2 p-3 text-center transition-all duration-300 active:scale-95 select-none ${
                        isSelected
                          ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg dark:bg-gradient-to-br dark:from-primary/20 dark:to-primary/10"
                          : "border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900"
                      }`}
                      data-wow-delay=".2s"
                    >
                      {/* Image container - responsive */}
                      <div className="relative w-full h-20 rounded-lg overflow-hidden bg-slate-300 dark:bg-slate-700 flex items-center justify-center shadow-inner">
                        <Image
                          src={szenzor.imageUrl}
                          alt={szenzor.name}
                          fill
                          className="object-contain p-2 transition-transform"
                        />
                      </div>

                      {/* Szenzor név */}
                      <h3
                        className={`text-xs font-bold transition-colors line-clamp-2 ${
                          isSelected
                            ? "text-primary dark:text-blue-400"
                            : "text-black dark:text-white"
                        }`}
                      >
                        {szenzor.name}
                      </h3>

                      {/* Selected badge */}
                      {isSelected && (
                        <span className="text-xs font-semibold text-primary dark:text-blue-400 mt-1">
                          Kiválasztva
                        </span>
                      )}
                    </button>
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
