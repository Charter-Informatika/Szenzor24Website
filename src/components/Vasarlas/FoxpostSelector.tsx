"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

/**
 * Foxpost automata adatai, amit a foxplus.json és az apt-finder widget visszaad.
 * Mezők leírása: https://foxpost.hu/uzleti-partnereknek/integracios-segedlet/webapi-integracio
 * ("4. CSOMAGAUTOMATA (APM) LISTA (JSON)" szekció)
 *
 * operator_id: A célautomata kódja – ezt kell küldeni a Foxpost API-nak a "destination" mezőben.
 * Ha az operator_id üres, a place_id-t kell használni.
 */
export interface FoxpostAutomataData {
  place_id: string;
  operator_id: string;
  name: string;
  address: string;
  city: string;
  zip: string;
  geolat: string;
  geolng: string;
  findme?: string;
  isOutdoor?: boolean;
  load?: string; // "normal loaded" | "medium loaded" | "overloaded"
  apmType?: string; // "Cleveron" | "Keba" | "Rollkon" | "Rotte"
  variant?: string; // "FOXPOST A-BOX" | "FOXPOST Z-BOX" | "Packeta Z-BOX" | "Packeta Z-Pont"
  cardPayment?: boolean;
  cashPayment?: boolean;
}

interface FoxpostSelectorProps {
  /** Callback kiválasztáskor */
  onSelect: (automata: FoxpostAutomataData) => void;
  /** Jelenleg kiválasztott automata (null = nincs) */
  selected: FoxpostAutomataData | null;
}

/**
 * Foxpost APT Finder widget – iframe alapú automata választó.
 *
 * A Foxpost hivatalos csomagautomata-kereső widgetjét tölti be iframe-ben.
 * Widget URL: https://cdn.foxpost.hu/apt-finder/v1/app/
 *
 * Működés:
 * 1. A "Foxpost automata kiválasztása" gombra kattintva megnyílik egy modal az iframe-mel.
 * 2. A felhasználó a térképen rákeres/kiválasztja az automatát.
 * 3. A widget postMessage-en keresztül küldi vissza a kiválasztott automata adatait.
 * 4. A kiválasztott adat megjelenik kártyaként a gomb helyén.
 *
 * A postMessage formátum az alábbi lehet (a widget verziótól függően):
 *   { type: "foxpost_apt_selected", data: { place_id, operator_id, name, ... } }
 *   VAGY
 *   { place_id, operator_id, name, ... }  (közvetlenül)
 *
 * Ha a widget nem küldi el a postMessage-t a kívánt formátumban,
 * a senior dev állíthatja be a parseMessagePayload() függvényt.
 */
const FOXPOST_APT_FINDER_URL =
  "https://cdn.foxpost.hu/apt-finder/v1/app/" +
  "?lang=hu" +
  "&country=HU" +
  "&noHeader=1" +
  "&noAptCount=1" +
  "&noChooser=1" +
  "&noSearchTitle=1" +
  "&theme=default" +
  "&show_prod_zboxes=1";

/**
 * Parse-olja a postMessage payload-ot.
 * A Foxpost APT finder widget különböző verziói eltérő formátumot küldhetnek.
 * Itt próbáljuk mindegyik ismert formátumot kezelni.
 *
 * Ismert formátumok:
 *   1) { type: "foxpost_apt_selected", data: { ... } }
 *   2) Közvetlen automata objektum (pl. { place_id, operator_id, name, ... })
 *   3) JSON stringként érkező payload
 *
 * A senior dev a Foxpost-tól kapott pontos specifikáció alapján módosíthatja.
 */
function parseMessagePayload(rawData: unknown): FoxpostAutomataData | null {
  if (!rawData || typeof rawData === "string") {
    // Próbáljuk JSON-ként parse-olni
    try {
      if (typeof rawData === "string") {
        const parsed = JSON.parse(rawData);
        return parseMessagePayload(parsed);
      }
    } catch {
      // nem JSON string
    }
    return null;
  }

  const data = rawData as Record<string, unknown>;

  // Formátum 1: wrapped payload
  if (data.type === "foxpost_apt_selected" && data.data) {
    return parseMessagePayload(data.data);
  }

  // Formátum 2: közvetlen automata objektum – legalább operator_id VAGY place_id kell
  if (data.operator_id || data.place_id) {
    return {
      place_id: String(data.place_id ?? ""),
      operator_id: String(data.operator_id ?? ""),
      name: String(data.name ?? ""),
      address: String(data.address ?? ""),
      city: String(data.city ?? ""),
      zip: String(data.zip ?? ""),
      geolat: String(data.geolat ?? ""),
      geolng: String(data.geolng ?? ""),
      findme: data.findme ? String(data.findme) : undefined,
      isOutdoor: typeof data.isOutdoor === "boolean" ? data.isOutdoor : undefined,
      load: data.load ? String(data.load) : undefined,
      apmType: data.apmType ? String(data.apmType) : undefined,
      variant: data.variant ? String(data.variant) : undefined,
      cardPayment: typeof data.cardPayment === "boolean" ? data.cardPayment : undefined,
      cashPayment: typeof data.cashPayment === "boolean" ? data.cashPayment : undefined,
    };
  }

  return null;
}

const formatFindme = (value: string) =>
  value
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const FoxpostSelector: React.FC<FoxpostSelectorProps> = ({ onSelect, selected }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  /**
   * postMessage listener – fogadja a Foxpost widget üzeneteit.
   * Csak a cdn.foxpost.hu origintől érkező üzeneteket fogadjuk el (biztonsági ok).
   */
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      // Biztonsági ellenőrzés: csak a Foxpost CDN-ről érkező üzeneteket fogadjuk
      if (
        event.origin !== "https://cdn.foxpost.hu" &&
        event.origin !== "https://foxpost.hu"
      ) {
        return;
      }

      const automata = parseMessagePayload(event.data);
      if (automata) {
        onSelect(automata);
        setIsModalOpen(false);
      }
    },
    [onSelect]
  );

  useEffect(() => {
    if (isModalOpen) {
      window.addEventListener("message", handleMessage);
    }
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [isModalOpen, handleMessage]);

  // Modal megnyitásakor scroll lock
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  return (
    <div>
      {/* Kiválasztott automata megjelenítése */}
      {selected ? (
        <div className="rounded-xl border-2 border-primary bg-primary/5 p-4">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h5 className="text-base font-semibold text-black dark:text-white">
                {selected.name}
              </h5>
              <p className="text-sm text-body">
                {selected.zip} {selected.city}, {selected.address}
              </p>
              {selected.findme && (
                <p className="mt-1 whitespace-pre-line text-xs text-body italic">
                  📍 {formatFindme(selected.findme)}
                </p>
              )}
            </div>
            <span className="shrink-0 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              Kiválasztva ✓
            </span>
          </div>

          {/* Extra info sor */}
          <div className="flex flex-wrap gap-2 text-xs text-body">
            {selected.apmType && (
              <span className="rounded bg-gray-100 px-2 py-0.5 dark:bg-gray-800">
                {selected.apmType}
              </span>
            )}
            {selected.isOutdoor !== undefined && (
              <span className="rounded bg-gray-100 px-2 py-0.5 dark:bg-gray-800">
                {selected.isOutdoor ? "Kültéri" : "Beltéri"}
              </span>
            )}
            {selected.load && (
              <span
                className={`rounded px-2 py-0.5 ${
                  selected.load === "overloaded"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : selected.load === "medium loaded"
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                }`}
              >
                {selected.load === "overloaded"
                  ? "Túlterhelt"
                  : selected.load === "medium loaded"
                    ? "Közepesen terhelt"
                    : "Normál"}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="mt-3 text-sm font-medium text-primary underline hover:text-primary/80"
          >
            Másik automata választása
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="w-full rounded-xl border-2 border-dashed border-stroke p-6 text-center transition-all hover:border-primary hover:bg-primary/5 dark:border-stroke-dark dark:hover:border-primary"
        >
          <div className="mb-2 text-3xl">📦</div>
          <p className="text-base font-semibold text-black dark:text-white">
            Foxpost automata kiválasztása
          </p>
          <p className="mt-1 text-sm text-body">
            Kattintson a térképes automatakereső megnyitásához
          </p>
        </button>
      )}

      {/* Modal – Foxpost APT Finder */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div className="relative flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-dark">
            {/* Modal fejléc */}
            <div className="flex items-center justify-between border-b border-stroke px-6 py-4 dark:border-stroke-dark">
              <h4 className="text-lg font-semibold text-black dark:text-white">
                Foxpost automata választó
              </h4>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                aria-label="Bezárás"
              >
                ✕
              </button>
            </div>

            {/* Iframe */}
            <div className="flex-1">
              <iframe
                ref={iframeRef}
                src={FOXPOST_APT_FINDER_URL}
                title="Foxpost automata kereső"
                className="h-full w-full border-0"
                allow="geolocation"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            </div>

            {/* Modal lábléc – tipp */}
            <div className="border-t border-stroke px-6 py-3 text-center text-xs text-body dark:border-stroke-dark">
              Keresse meg és kattintson a számára megfelelő automatára a térképen.
              A kiválasztás után automatikusan visszatérünk a rendeléshez.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoxpostSelector;
