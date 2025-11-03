"use client";

import Graphics from "@/components/Screens/Graphics";
import Image from "next/image";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useRef } from "react";
import type { Swiper as SwiperType } from 'swiper';

const Screens = () => {
  const swiperRef = useRef<SwiperType | null>(null);
  // Helper to update Swiper height after image load
  const handleImageLoad = () => {
    if (swiperRef.current) {
      swiperRef.current.update();
    }
  };
  return (
    <>
      <section id="screens" className="relative z-20 pt-[110px]">
        <div className="container">
          <div className="wow fadeInUp mx-auto mb-10 max-w-[690px] text-center" data-wow-delay=".2s">
            <h2 className="mb-4 text-3xl font-bold text-black sm:text-4xl md:text-[44px] md:leading-tight dark:text-white">
              Térkép
            </h2>
            <div className="text-body text-base">
              <h2>Itt található a cégünk: Pécs, Kertváros u. 2</h2>
              Hétfő – péntek: 8:00 – 16:00
            </div>
          </div>
        </div>
        <div className="container">
          <div className="wow fadeInUp mx-auto max-w-[900px] mb-12" data-wow-delay=".2s">
            <div className="w-full rounded-2xl overflow-hidden border border-blue-300 shadow-lg">
              <iframe
                title="Cégünk térképen"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2736.393964624624!2d18.21785731560609!3d46.07207397911209!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4742b1e2e2e2e2e3%3A0x2e2e2e2e2e2e2e2e!2sP%C3%A9cs%2C%20Kertv%C3%A1ros%20u.%202%2C%207632!5e0!3m2!1shu!2shu!4v1697555555555!5m2!1shu!2shu"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
        {/*Graphics*/}
        <Graphics />
      </section>
    </>
  );
};

export default Screens;
