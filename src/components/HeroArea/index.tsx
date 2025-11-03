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


  // Overview sensors for the hero (simple data shape used for cards)
  const sensors = [
    { id: 'temp', title: 'Hőmérséklet', subtitle: 'Pontosság ±0.2°C' },
    { id: 'hum', title: 'Páratartalom', subtitle: 'Stabil adatgyűjtés' },
    { id: 'vib', title: 'Rezgés', subtitle: 'Prediktív karbantartás' },
    { id: 'power', title: 'Energia', subtitle: 'Fogyasztás & oltalom' },
    { id: 'air', title: 'Levegőminőség', subtitle: 'CO₂ & VOC' },
  ];

  const scrollToPricing = (ev?: React.MouseEvent) => {
    ev?.preventDefault();
    const el = document.getElementById('pricing');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const scrollToScreen = (ev?: React.MouseEvent) => {
    ev?.preventDefault();
    const el = document.getElementById('screens');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <section id="home" className="pt-28 pb-10">
        <div className="container lg:max-w-[1200px] lg:px-10">
          <div className="-mx-4 flex flex-wrap items-center">
            <div className="w-full px-4 lg:w-6/12">
              <div className="mb-8 lg:mb-0 lg:max-w-[570px]">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black dark:text-white mb-4">
                  Szenzor24 - Könnyű ipari és kereskedelmi szenzor megoldások
                </h1>
                <p className="text-body mb-6 text-base sm:text-lg leading-relaxed max-w-xl">
                  Cégünk integrált, ipari és kereskedelmi felhasználásra tervezett okos szenzor megoldásokat kínál — valós idejű adatgyűjtés, megbízható hálózati integráció és prediktív analitika az üzemi hatékonyságért.
                </p>

                <div className="flex items-center gap-4 flex-wrap">
                  <a
                    href="#pricing"
                    onClick={scrollToPricing}
                    className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-200"
                  >
                    Fedezd fel eszközeinket
                  </a>
                  <a
                    href="#screens"
                    onClick={scrollToScreen}
                    className="inline-flex items-center justify-center rounded-lg bg-blue-400/10 border-2 border-blue-400/30 px-5 py-3 text-sm text-blue-300 hover:bg-blue-500 hover:text-white hover:border-transparent hover:scale-[1.02] transition-all duration-200"
                  >
                    Kapcsolatfelvétel
                  </a>
                </div>

                {/* small overview of 5 sensors */}
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-xl mx-auto">
                  {sensors.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        const el = document.getElementById('features');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="group flex flex-col items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-4 text-center shadow-md shadow-blue-500/5 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105 hover:border-blue-500/30 transition-all duration-200"
                      aria-label={s.title}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-300 group-hover:bg-blue-500/20 group-hover:text-blue-200 transition-colors">
                        <span className="font-semibold text-base">{s.title.charAt(0)}</span>
                      </div>
                      <div className="text-xs font-medium text-slate-200 group-hover:text-white">{s.title}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full px-4 lg:w-6/12">
              <div className="relative z-10 mx-auto w-full max-w-[700px]">
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
                  >
                  </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroArea;
