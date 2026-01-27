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
              <h2>Itt található a cégünk: Pécs, Kodolányi János u. 23-25, 7632</h2>
              Hétfő – péntek: 8:00 – 16:00
            </div>
          </div>
        </div>
        <div className="container">
          <div className="wow fadeInUp mx-auto max-w-[900px] mb-12" data-wow-delay=".2s">
            <div className="w-full rounded-2xl overflow-hidden border border-blue-300 shadow-lg">
              <iframe
                title="Cégünk térképen"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3285.2144018261065!2d18.222165676631253!3d46.040463794805056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4742b11b76745637%3A0x8ea8c06c604560f7!2sCharter%20Informatika!5e1!3m2!1shu!2shu!4v1769501446380!5m2!1shu!2shu"
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
