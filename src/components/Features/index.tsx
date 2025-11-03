import React from "react";
import Graphics from "@/components/Features/Graphics";
import { Feature } from "@/types/feature";

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
];

const Features = () => {
  return (
    <>
      <section id="features" className="relative z-10 pt-[110px]">
        <div className="container">
          {/* Images moved from Pricing: show above the features heading */}
          <div className="mb-6 flex justify-center">
            {/* Stack on mobile, row on sm+ */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-[900px] px-4">
              <img src="/images/hero/szenzorkep1.png" alt="Left" className="w-full sm:w-1/2 h-auto max-h-[300px] md:max-h-[400px] object-contain" />
              <img src="/images/hero/szenzorkep2.png" alt="Right" className="w-full sm:w-1/2 h-auto max-h-[300px] md:max-h-[400px] object-contain" />
            </div>
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
                    <li className="flex items-center mb-1"><span className="text-primary font-bold mr-2">✓</span>HACCP megfelelőség – Biztos lehet benne, hogy adatai mindig pontosak és visszakövethetők.</li>
                    <li className="flex items-center mb-1"><span className="text-primary font-bold mr-2">✓</span>Távoli elérés – Bárhol és bármikor ellenőrizheti a hőmérsékleti adatokat egy online felületen keresztül.</li>
                  </ul>
          </div>
        </div>

        <div className="container max-w-[1390px]">
          <div className="rounded-2xl bg-white px-5 pb-14 pt-14 shadow-card dark:bg-dark dark:shadow-card-dark md:pb-1 lg:pb-5 lg:pt-20 xl:px-10">
            <div className="-mx-4 flex flex-wrap">
              {featuresData.map((item, index) => (
                <div key={index} className="w-full px-4 md:w-1/2 lg:w-1/3">
                  <div
                    className="wow fadeInUp group mx-auto mb-[60px] max-w-[310px] text-center"
                    data-wow-delay=".2s"
                  >
                    <div className="mx-auto mb-8 flex h-[90px] w-[90px] items-center justify-center rounded-3xl bg-gray text-primary duration-300 group-hover:bg-primary group-hover:text-white dark:bg-[#2A2E44] dark:text-white dark:group-hover:bg-primary">
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
