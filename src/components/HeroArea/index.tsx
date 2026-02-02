"use client";

import FsLightbox from "fslightbox-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const HeroArea = () => {
  const [toggler, setToggler] = useState(false);
  const modelViewerRef = useRef<HTMLDivElement>(null);

  // Load model from local images/hero directory (no remote logic)
  const localModelPath = "/images/hero/zold_feher.glb";
  const [modelSrc, setModelSrc] = useState<string>(localModelPath);

  useEffect(() => {
    // Dinamikusan importáljuk a model-viewer-t
    import("@google/model-viewer");
    // Nothing to check — we always use the local model path
  }, []);

  // Attach listeners to the model-viewer element to detect load errors at runtime
  useEffect(() => {
    const container = modelViewerRef.current;
    if (!container) return;

    const mv = container.querySelector("model-viewer");
    if (!mv) return;

    const onError = (ev: Event) => {
      // Log and replace the viewer with a static image placeholder
      console.warn("model-viewer failed to load model:", ev);
      // replace the model-viewer node with an image
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
      <section id="home" className="pt-[165px]">
        <div className="container lg:max-w-[1305px] lg:px-10">
          <div className="-mx-4 flex flex-wrap items-center">
            <div className="w-full px-4 lg:w-6/12">
              <div
                className="wow fadeInUp mb-12 lg:mb-0 lg:max-w-[570px]"
                data-wow-delay=".3s"
              >
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black dark:text-white text-center mb-2">
                    A BIZTONSÁGOS ÉLELMISZER TÁROLÁS
                  </h1>
                  <h2 className="text-lg sm:text-xl font-medium text-black dark:text-white text-center mb-4">
                    HACCP kompatibilis hőmérséklet figyelés egyszerűen
                  </h2>
                  <ul className="mb-6 text-base sm:text-lg leading-relaxed text-left max-w-md mx-auto list-none">
                    <li className="flex items-center mb-1"><span className="text-primary font-bold mr-2">✓</span>Leolvadás elleni védelem</li>
                    <li className="flex items-center mb-1"><span className="text-primary font-bold mr-2">✓</span>Nyitott ajtó visszajelzés</li>
                    <li className="flex items-center mb-1"><span className="text-primary font-bold mr-2">✓</span>Áramszünet visszajelzés</li>
                    <li className="flex items-center mb-1"><span className="text-primary font-bold mr-2">✓</span>Műszaki meghibásodás előrejelzés</li>
                    <li className="flex items-center mb-1"><span className="text-primary font-bold mr-2">✓</span>Illetéktelen hozzáférés elleni védelem</li>
                  </ul>
                  <p className="text-body mb-6 text-base sm:text-lg leading-relaxed text-center max-w-xl">
                    <span className="font-bold text-black dark:text-white">A HűtőMonitor</span> egy innovatív megoldás, amely teljesen automatizálja a hűtők és a fagyasztók hőmérsékletének naplózását, így Önnek többé nem kell manuálisan rögzítenie az adatokat.<br />
                    A rendszer folyamatosan figyeli a hőmérsékleti értékeket, és automatikusan naplózza azokat a HACCP követelményeinek megfelelően.
                  </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link
                    href="/vasarlas"
                    className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105"
                  >
                    🛒 Vásárlás
                  </Link>
                </div>
               
              </div>
            </div>

            <div className="w-full px-4 lg:w-6/12">
              <div
                className="wow fadeInUp relative z-10 mx-auto w-full max-w-[790px]"
                data-wow-delay=".3s"
              >
 <div
                  ref={modelViewerRef}
                  dangerouslySetInnerHTML={{
                    __html: `<model-viewer
                      src="${modelSrc ?? localModelPath}"
                      alt="3D model"
                      auto-rotate
                      camera-controls
                      crossorigin="anonymous"
                      style="width: 100%; height: 400px;">
                    </model-viewer>`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroArea;
