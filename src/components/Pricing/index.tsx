"use client";
import React, { useState,useEffect,useRef } from "react";
import { useSession, signIn } from "next-auth/react";
import { Price } from "@/types/priceItem";

import { pricingData } from "../../stripe/pricingData";
import { PricingItem } from "./PricingItem";
import toast from "react-hot-toast";
import { get } from "http";

const Pricing = () => {
  // Színválasztók: doboz (hátsó rész) és tető (előlapi rész)
  const boxColors = [
    { name: "Zöld", value: "zold" },
    { name: "Piros", value: "piros" },
    { name: "Kék", value: "kek" },
    { name: "Fekete", value: "fekete" },
  ];
  const topColors = [
    { name: "Fehér", value: "feher" },
    { name: "Szürke", value: "szurke" },
    { name: "Fekete", value: "fekete" },
  ];
  const [boxColor, setBoxColor] = useState("zold");
  const [topColor, setTopColor] = useState("feher");
  const { data: session } = useSession();
  // A GLB fájlok elnevezése: /images/hero/{box}_{top}.glb
  const getModelPath = (box: string, top: string) => `/images/hero/${box}_${top}.glb`;
  const [modelSrc, setModelSrc] = useState<string>(getModelPath(boxColor, topColor));
  const modelViewerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    import("@google/model-viewer");
  }, []);
  useEffect(() => {
    setModelSrc(getModelPath(boxColor, topColor));
  }, [boxColor, topColor]);
  useEffect(() => {
    const container = modelViewerRef.current;
    if (!container) return;
    const mv = container.querySelector("model-viewer");
    if (!mv) return;
    const onError = (ev: Event) => {
      console.warn("model-viewer failed to load model:", ev);
      const parent = mv.parentElement;
      if (parent) {
        parent.innerHTML = `<img src="/images/hero/hero-light.png" alt="Model not available" style="width:100%;height:400px;object-fit:contain"/>`;
      }
    };
    const onLoad = () => {
      console.debug("model-viewer loaded model successfully");
    };
    mv.addEventListener("error", onError as EventListener);
    mv.addEventListener("load", onLoad as EventListener);
    return () => {
      mv.removeEventListener("error", onError as EventListener);
      mv.removeEventListener("load", onLoad as EventListener);
    };
  }, [modelSrc]);


  return (
    <>
      <section id="pricing" className="relative z-10 pt-[110px]">
        <div className="container">
          <div
            className="wow fadeInUp mx-auto mb-10 max-w-[690px] text-center"
            data-wow-delay=".2s"
          >
            <h2 className="mb-4 text-3xl font-bold text-black dark:text-white sm:text-4xl md:text-[44px] md:leading-tight">
              Itt választhatsz, milyen színben szeretnéd!
            </h2>
            <p className="text-base text-body">
            Próbáld ki kockázatmentesen és tapasztald meg, hogyan könnyíti meg munkádat a HűtőMonitor! 🛡️❄
            iztosítunk neked egy terméket próbahasználatra, te pedig győződj meg róla, hogy a HűtőMonitor valóban leegyszerűsíti a napi hőmérséklet-ellenőrzést és megfelel a HACCP előírásoknak
            </p>
          </div>
        </div>

        <div className="container max-w-[1120px] overflow-hidden">

          {/* Doboz színválasztó */}
          <div className="mb-4 flex flex-col items-center gap-2">
            <span className="font-medium text-black dark:text-white mb-1">Doboz színe:</span>
            <div className="flex gap-2 flex-wrap justify-center">
              {boxColors.map((color) => (
                <button
                  key={color.value}
                  className={`px-4 py-2 rounded-full border-2 text-sm font-semibold transition-all ${boxColor === color.value ? 'bg-primary text-white border-primary' : 'bg-white text-black border-gray-300 dark:bg-dark dark:text-white'}`}
                  onClick={() => setBoxColor(color.value)}
                >
                  {color.name}
                </button>
              ))}
            </div>
          </div>
          {/* Tető színválasztó */}
          <div className="mb-6 flex flex-col items-center gap-2">
            <span className="font-medium text-black dark:text-white mb-1">Tető színe:</span>
            <div className="flex gap-2 flex-wrap justify-center">
              {topColors.map((color) => (
                <button
                  key={color.value}
                  className={`px-4 py-2 rounded-full border-2 text-sm font-semibold transition-all ${topColor === color.value ? 'bg-primary text-white border-primary' : 'bg-white text-black border-gray-300 dark:bg-dark dark:text-white'}`}
                  onClick={() => setTopColor(color.value)}
                >
                  {color.name}
                </button>
              ))}
            </div>
          </div>

         <div
                  ref={modelViewerRef}
                  dangerouslySetInnerHTML={{
                    __html: `<model-viewer
                      src="${modelSrc ?? getModelPath(boxColor, topColor)}"
                      alt="3D model"
                      auto-rotate
                      camera-controls
                      crossorigin="anonymous"
                      style="width: 100%; height: 400px;">
                    </model-viewer>`,
                  }}
                />

          {/* Heading above the pricing table (matches screenshot) */}
          <div className="mt-8 text-center">
            <h3 className="text-2xl font-semibold text-black dark:text-white">Válassz csomagjaink közül!</h3>
            <p className="max-w-2xl mx-auto text-sm mt-2 text-gray-700 dark:text-gray-300">
              Egy eszköz vételára <span className="font-bold text-black dark:text-white">16 000 Ft + ÁFA</span>, több termék vásárlása esetén további kedvezmények érhetőek el. Teszteld a rendszert 3 hónapig pénzvisszafizetési garancia. Amennyiben nem találsz megfelelőt, az eszközre pénzvisszafizetési garanciát biztosítunk.
            </p>
          </div>

          {/* Pricing table */}
          <div className="mt-6 grid gap-6 grid-cols-1 md:grid-cols-3">
            {/* Card - Ingyenes */}
            <div className="rounded-2xl bg-white px-5 pb-14 pt-14 shadow-card dark:bg-dark dark:shadow-card-dark md:pb-1 lg:pb-5 lg:pt-20 xl:px-10">
              <h4 className="text-3xl font-bold text-center mb-4 text-slate-900 dark:text-slate-100">INGYENES</h4>
              <hr className="border-t border-slate-300 dark:border-slate-700 mb-4" />
              <ul className="space-y-2 mb-4 text-slate-700 dark:text-slate-300">
                <li>✅ <span className="font-medium">Valós idejű adatelérés</span></li>
                <li>✅ <span className="font-medium">Webes hozzáférés</span></li>
                <li>✅ <span className="font-medium">30 napos adatmegőrzés</span></li>
                <li className="mt-3 text-rose-600 dark:text-rose-400">❌ HACCP hőmérséklet naplózás</li>
                <li className="text-rose-600 dark:text-rose-400">❌ Nyitott ajtó visszajelzés</li>
                <li className="text-rose-600 dark:text-rose-400">❌ Illetéktelen hozzáférés elleni védelem</li>
              </ul>
              <hr className="border-t border-slate-300 dark:border-slate-700 mb-4" />
              <p className="font-semibold text-slate-800 dark:text-slate-200">✅ 3 hónap pénzvisszafizetési garancia</p>
              <div className="mt-6 text-center text-3xl font-bold text-slate-900 dark:text-slate-100">0 Ft</div>
            </div>

            {/* Card - Havi */}
            <div className="rounded-2xl bg-white px-5 pb-14 pt-14 shadow-card dark:bg-dark dark:shadow-card-dark md:pb-1 lg:pb-5 lg:pt-20 xl:px-10">
              <h4 className="text-3xl font-bold text-center mb-4 text-slate-900 dark:text-slate-100">HAVI</h4>
              <hr className="border-t border-slate-300 dark:border-slate-700 mb-4" />
              <ul className="space-y-2 mb-4 text-slate-700 dark:text-slate-300">
                <li>✅ <span className="font-medium">Valós idejű adatelérés</span></li>
                <li>✅ <span className="font-medium">Webes hozzáférés</span></li>
                <li>✅ <span className="font-medium">90 napos adatmegőrzés</span></li>
                <li className="mt-3 text-slate-800 dark:text-slate-200">✅ HACCP hőmérséklet naplózás</li>
                <li className="text-slate-800 dark:text-slate-200">✅ Nyitott ajtó visszajelzés</li>
                <li className="text-slate-800 dark:text-slate-200">✅ Illetéktelen hozzáférés elleni védelem</li>
              </ul>
              <hr className="border-t border-slate-300 dark:border-slate-700 mb-4" />
              <p className="font-semibold text-slate-800 dark:text-slate-200">✅ 3 hónap pénzvisszafizetési garancia</p>
              <div className="mt-6 text-center text-3xl font-bold text-slate-900 dark:text-slate-100">1 000 Ft/hó</div>
            </div>

            {/* Card - Éves */}
            <div className="rounded-2xl bg-white px-5 pb-14 pt-14 shadow-card dark:bg-dark dark:shadow-card-dark md:pb-1 lg:pb-5 lg:pt-20 xl:px-10">
              <h4 className="text-3xl font-bold text-center mb-4 text-slate-900 dark:text-slate-100">ÉVES</h4>
              <hr className="border-t border-slate-300 dark:border-slate-700 mb-4" />
              <ul className="space-y-2 mb-4 text-slate-700 dark:text-slate-300">
                <li>✅ <span className="font-medium">Valós idejű adatelérés</span></li>
                <li>✅ <span className="font-medium">Webes hozzáférés</span></li>
                <li>✅ <span className="font-medium">90 napos adatmegőrzés</span></li>
                <li className="mt-3 text-slate-800 dark:text-slate-200">✅ HACCP hőmérséklet naplózás</li>
                <li className="text-slate-800 dark:text-slate-200">✅ Nyitott ajtó visszajelzés</li>
                <li className="text-slate-800 dark:text-slate-200">✅ Illetéktelen hozzáférés elleni védelem</li>
              </ul>
              <hr className="border-t border-slate-300 dark:border-slate-700 mb-4" />
              <p className="font-semibold text-slate-800 dark:text-slate-200">✅ 3 hónap pénzvisszafizetési garancia</p>
              <div className="mt-6 text-center text-3xl font-bold text-slate-900 dark:text-slate-100">10 000 Ft/év</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Pricing;