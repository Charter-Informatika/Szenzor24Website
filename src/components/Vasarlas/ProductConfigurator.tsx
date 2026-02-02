"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import axios from "axios";
import { OrderPayload } from "@/types/order";

// Szenzor típusok
const szenzorok = [
  {
    id: "homerseklet",
    name: "Hőmérséklet szenzor",
    description: "Precíz hőmérséklet mérés -40°C és +85°C között",
    price: 5000,
    icon: "🌡️",
  },
  {
    id: "paratartalom",
    name: "Páratartalom szenzor",
    description: "Páratartalom mérés 0-100% RH tartományban",
    price: 6000,
    icon: "💧",
  },
  {
    id: "ajto",
    name: "Ajtó nyitás érzékelő",
    description: "Mágneses ajtó nyitás/zárás érzékelő",
    price: 3000,
    icon: "🚪",
  },
  {
    id: "mozgas",
    name: "Mozgásérzékelő",
    description: "PIR alapú mozgásérzékelő",
    price: 4500,
    icon: "👁️",
  },
];

// Eszköz típusok
const eszkozok = [
  {
    id: "basic",
    name: "Basic Modul",
    description: "1 szenzor csatlakoztatható, WiFi kapcsolat",
    price: 8000,
    maxSzenzorok: 1,
    icon: "📡",
  },
  {
    id: "standard",
    name: "Standard Modul",
    description: "Akár 4 szenzor csatlakoztatható, WiFi + GSM",
    price: 15000,
    maxSzenzorok: 4,
    icon: "📶",
  },
  {
    id: "pro",
    name: "Pro Modul",
    description: "Akár 8 szenzor, WiFi + GSM + LoRa, ipari kivitel",
    price: 25000,
    maxSzenzorok: 8,
    icon: "🔌",
  },
];

// Doboz típusok
const dobozok = [
  {
    id: "muanyag",
    name: "Műanyag doboz",
    description: "IP54 védettség, beltéri használatra",
    price: 2000,
    icon: "📦",
  },
  {
    id: "fem",
    name: "Fém doboz",
    description: "IP65 védettség, kültéri/ipari használatra",
    price: 4500,
    icon: "🗄️",
  },
  {
    id: "rozsdamentes",
    name: "Rozsdamentes doboz",
    description: "IP67 védettség, élelmiszeripari felhasználásra",
    price: 8000,
    icon: "✨",
  },
];

// Doboz színek
const dobozSzinek = [
  { id: "zold", name: "Zöld", hex: "#22c55e" },
  { id: "piros", name: "Piros", hex: "#ef4444" },
  { id: "kek", name: "Kék", hex: "#3b82f6" },
  { id: "fekete", name: "Fekete", hex: "#1f2937" },
];

// Tető színek
const tetoSzinek = [
  { id: "feher", name: "Fehér", hex: "#f9fafb" },
  { id: "szurke", name: "Szürke", hex: "#9ca3af" },
  { id: "fekete", name: "Fekete", hex: "#1f2937" },
];

// Tápellátás típusok
const tapellatasok = [
  {
    id: "akkus",
    name: "Akkumulátoros",
    description: "Beépített Li-Ion akku, ~6 hónap üzemidő",
    price: 5000,
    icon: "🔋",
  },
  {
    id: "vezetekes",
    name: "Vezetékes",
    description: "230V AC adapter, folyamatos üzem",
    price: 2500,
    icon: "🔌",
  },
  {
    id: "napelemes",
    name: "Napelemes",
    description: "Napelem + akkumulátor kombináció",
    price: 12000,
    icon: "☀️",
  },
];

type StepId = "szenzor" | "eszkoz" | "doboz" | "szin" | "tapellatas" | "osszesites";

const MAX_SZENZOROK = 3;

interface Selection {
  szenzorok: string[]; // Max 3 szenzor
  eszkoz: string | null;
  doboz: string | null;
  dobozSzin: string;
  tetoSzin: string;
  tapellatas: string | null;
}

const ProductConfigurator = () => {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState<StepId>("szenzor");
  const [selection, setSelection] = useState<Selection>({
    szenzorok: [],
    eszkoz: null,
    doboz: null,
    dobozSzin: "zold",
    tetoSzin: "feher",
    tapellatas: null,
  });

  const modelViewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    import("@google/model-viewer");
  }, []);

  const getModelPath = (box: string, top: string) => `/images/hero/${box}_${top}.glb`;
  const modelSrc = getModelPath(selection.dobozSzin, selection.tetoSzin);

  const steps: { id: StepId; title: string; icon: string }[] = [
    { id: "szenzor", title: "Szenzor", icon: "1" },
    { id: "eszkoz", title: "Eszköz", icon: "2" },
    { id: "doboz", title: "Doboz", icon: "3" },
    { id: "szin", title: "Szín", icon: "4" },
    { id: "tapellatas", title: "Tápellátás", icon: "5" },
    { id: "osszesites", title: "Összesítés", icon: "✓" },
  ];

  const calculateTotal = () => {
    let total = 0;
    // Több szenzor összege
    for (const szenzorId of selection.szenzorok) {
      const szenzor = szenzorok.find((s) => s.id === szenzorId);
      if (szenzor) total += szenzor.price;
    }
    if (selection.eszkoz) {
      const eszkoz = eszkozok.find((e) => e.id === selection.eszkoz);
      if (eszkoz) total += eszkoz.price;
    }
    if (selection.doboz) {
      const doboz = dobozok.find((d) => d.id === selection.doboz);
      if (doboz) total += doboz.price;
    }
    if (selection.tapellatas) {
      const tap = tapellatasok.find((t) => t.id === selection.tapellatas);
      if (tap) total += tap.price;
    }
    return total;
  };

  const toggleSzenzor = (szenzorId: string) => {
    const isSelected = selection.szenzorok.includes(szenzorId);
    
    if (isSelected) {
      // Eltávolítás
      setSelection((prev) => ({
        ...prev,
        szenzorok: prev.szenzorok.filter((id) => id !== szenzorId),
      }));
    } else {
      // Hozzáadás (max 3)
      if (selection.szenzorok.length >= MAX_SZENZOROK) {
        toast.error(`Maximum ${MAX_SZENZOROK} szenzort választhatsz!`);
        return;
      }
      setSelection((prev) => ({
        ...prev,
        szenzorok: [...prev.szenzorok, szenzorId],
      }));
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case "szenzor":
        return selection.szenzorok.length > 0; // Legalább 1 szenzor kell
      case "eszkoz":
        return selection.eszkoz !== null;
      case "doboz":
        return selection.doboz !== null;
      case "szin":
        return true; // Szín mindig van alapértelmezett
      case "tapellatas":
        return selection.tapellatas !== null;
      case "osszesites":
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    const stepIndex = steps.findIndex((s) => s.id === currentStep);
    if (stepIndex < steps.length - 1 && canProceed()) {
      setCurrentStep(steps[stepIndex + 1].id);
    }
  };

  const prevStep = () => {
    const stepIndex = steps.findIndex((s) => s.id === currentStep);
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].id);
    }
  };

  const handleOrder = async () => {
    if (!session) {
      toast.error("A rendeléshez be kell jelentkezni!");
      return;
    }

    // Kiválasztott szenzorok (több is lehet)
    const selectedSzenzorok = selection.szenzorok
      .map((id) => szenzorok.find((s) => s.id === id))
      .filter(Boolean);
    const selectedEszkoz = eszkozok.find((e) => e.id === selection.eszkoz);
    const selectedDoboz = dobozok.find((d) => d.id === selection.doboz);
    const selectedTap = tapellatasok.find((t) => t.id === selection.tapellatas);
    const selectedDobozSzin = dobozSzinek.find((s) => s.id === selection.dobozSzin);
    const selectedTetoSzin = tetoSzinek.find((s) => s.id === selection.tetoSzin);

    if (selectedSzenzorok.length === 0 || !selectedEszkoz || !selectedDoboz || !selectedTap) {
      toast.error("Hiányzó termék választás!");
      return;
    }

    const subtotal = calculateTotal();
    const vatPercent = 27;
    const vatAmount = Math.round(subtotal * (vatPercent / 100));
    const total = subtotal + vatAmount;

    const orderPayload: OrderPayload = {
      userId: (session.user as any).id || "unknown",
      userEmail: session.user?.email || "",

      szenzorok: selectedSzenzorok.map((sz) => ({
        id: sz!.id,
        name: sz!.name,
        price: sz!.price,
        quantity: 1,
      })),
      eszkoz: {
        id: selectedEszkoz.id,
        name: selectedEszkoz.name,
        price: selectedEszkoz.price,
        quantity: 1,
      },
      doboz: {
        id: selectedDoboz.id,
        name: selectedDoboz.name,
        price: selectedDoboz.price,
        quantity: 1,
      },
      tapellatas: {
        id: selectedTap.id,
        name: selectedTap.name,
        price: selectedTap.price,
        quantity: 1,
      },

      colors: {
        dobozSzin: {
          id: selectedDobozSzin?.id || "zold",
          name: selectedDobozSzin?.name || "Zöld",
        },
        tetoSzin: {
          id: selectedTetoSzin?.id || "feher",
          name: selectedTetoSzin?.name || "Fehér",
        },
      },

      subtotal,
      vatPercent,
      vatAmount,
      total,

      currency: "HUF",
      createdAt: new Date().toISOString(),
      locale: "hu-HU",
    };

    try {
      const { data } = await axios.post("/api/order", orderPayload);
      
      if (data.url) {
        // Stripe checkout URL - redirect
        window.location.href = data.url;
      } else {
        toast.success("Rendelés elküldve! Hamarosan felvesszük Önnel a kapcsolatot.");
        console.log("Order response:", data);
      }
    } catch (error: any) {
      console.error("Order error:", error);
      toast.error(error.response?.data?.error || "Hiba történt a rendelés során!");
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "szenzor":
        return (
          <div>
            <p className="mb-4 text-center text-sm text-body">
              Válassz max. {MAX_SZENZOROK} szenzort! ({selection.szenzorok.length}/{MAX_SZENZOROK} kiválasztva)
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {szenzorok.map((szenzor) => {
                const isSelected = selection.szenzorok.includes(szenzor.id);
                return (
                  <div
                    key={szenzor.id}
                    onClick={() => toggleSzenzor(szenzor.id)}
                    className={`cursor-pointer rounded-xl border-2 p-6 transition-all hover:shadow-lg ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-stroke dark:border-stroke-dark bg-white dark:bg-dark"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="mb-3 text-4xl">{szenzor.icon}</div>
                      <div className={`flex h-6 w-6 items-center justify-center rounded-md border-2 ${
                        isSelected ? "border-primary bg-primary" : "border-gray-300 dark:border-gray-600"
                      }`}>
                        {isSelected && (
                          <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <h4 className="mb-2 text-lg font-semibold text-black dark:text-white">
                      {szenzor.name}
                    </h4>
                    <p className="mb-3 text-sm text-body">{szenzor.description}</p>
                    <p className="text-xl font-bold text-primary">
                      {szenzor.price.toLocaleString("hu-HU")} Ft
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "eszkoz":
        return (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {eszkozok.map((eszkoz) => (
              <div
                key={eszkoz.id}
                onClick={() => setSelection({ ...selection, eszkoz: eszkoz.id })}
                className={`cursor-pointer rounded-xl border-2 p-6 transition-all hover:shadow-lg ${
                  selection.eszkoz === eszkoz.id
                    ? "border-primary bg-primary/10"
                    : "border-stroke dark:border-stroke-dark bg-white dark:bg-dark"
                }`}
              >
                <div className="mb-3 text-4xl">{eszkoz.icon}</div>
                <h4 className="mb-2 text-lg font-semibold text-black dark:text-white">
                  {eszkoz.name}
                </h4>
                <p className="mb-2 text-sm text-body">{eszkoz.description}</p>
                <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                  Max. {eszkoz.maxSzenzorok} szenzor csatlakoztatható
                </p>
                <p className="text-xl font-bold text-primary">
                  {eszkoz.price.toLocaleString("hu-HU")} Ft
                </p>
              </div>
            ))}
          </div>
        );

      case "doboz":
        return (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {dobozok.map((doboz) => (
              <div
                key={doboz.id}
                onClick={() => setSelection({ ...selection, doboz: doboz.id })}
                className={`cursor-pointer rounded-xl border-2 p-6 transition-all hover:shadow-lg ${
                  selection.doboz === doboz.id
                    ? "border-primary bg-primary/10"
                    : "border-stroke dark:border-stroke-dark bg-white dark:bg-dark"
                }`}
              >
                <div className="mb-3 text-4xl">{doboz.icon}</div>
                <h4 className="mb-2 text-lg font-semibold text-black dark:text-white">
                  {doboz.name}
                </h4>
                <p className="mb-3 text-sm text-body">{doboz.description}</p>
                <p className="text-xl font-bold text-primary">
                  {doboz.price.toLocaleString("hu-HU")} Ft
                </p>
              </div>
            ))}
          </div>
        );

      case "szin":
        return (
          <div className="space-y-8">
            {/* 3D Modell előnézet */}
            <div className="mx-auto max-w-md">
              <div
                ref={modelViewerRef}
                dangerouslySetInnerHTML={{
                  __html: `<model-viewer
                    src="${modelSrc}"
                    alt="3D előnézet"
                    auto-rotate
                    camera-controls
                    crossorigin="anonymous"
                    style="width: 100%; height: 300px;">
                  </model-viewer>`,
                }}
              />
            </div>

            {/* Doboz szín */}
            <div>
              <h4 className="mb-4 text-center text-lg font-semibold text-black dark:text-white">
                Doboz színe
              </h4>
              <div className="flex flex-wrap justify-center gap-3">
                {dobozSzinek.map((szin) => (
                  <button
                    key={szin.id}
                    onClick={() => setSelection({ ...selection, dobozSzin: szin.id })}
                    className={`flex items-center gap-2 rounded-full border-2 px-4 py-2 transition-all ${
                      selection.dobozSzin === szin.id
                        ? "border-primary bg-primary/10"
                        : "border-stroke dark:border-stroke-dark"
                    }`}
                  >
                    <span
                      className="h-5 w-5 rounded-full border border-gray-300"
                      style={{ backgroundColor: szin.hex }}
                    />
                    <span className="text-sm font-medium text-black dark:text-white">
                      {szin.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tető szín */}
            <div>
              <h4 className="mb-4 text-center text-lg font-semibold text-black dark:text-white">
                Tető színe
              </h4>
              <div className="flex flex-wrap justify-center gap-3">
                {tetoSzinek.map((szin) => (
                  <button
                    key={szin.id}
                    onClick={() => setSelection({ ...selection, tetoSzin: szin.id })}
                    className={`flex items-center gap-2 rounded-full border-2 px-4 py-2 transition-all ${
                      selection.tetoSzin === szin.id
                        ? "border-primary bg-primary/10"
                        : "border-stroke dark:border-stroke-dark"
                    }`}
                  >
                    <span
                      className="h-5 w-5 rounded-full border border-gray-300"
                      style={{ backgroundColor: szin.hex }}
                    />
                    <span className="text-sm font-medium text-black dark:text-white">
                      {szin.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case "tapellatas":
        return (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {tapellatasok.map((tap) => (
              <div
                key={tap.id}
                onClick={() => setSelection({ ...selection, tapellatas: tap.id })}
                className={`cursor-pointer rounded-xl border-2 p-6 transition-all hover:shadow-lg ${
                  selection.tapellatas === tap.id
                    ? "border-primary bg-primary/10"
                    : "border-stroke dark:border-stroke-dark bg-white dark:bg-dark"
                }`}
              >
                <div className="mb-3 text-4xl">{tap.icon}</div>
                <h4 className="mb-2 text-lg font-semibold text-black dark:text-white">
                  {tap.name}
                </h4>
                <p className="mb-3 text-sm text-body">{tap.description}</p>
                <p className="text-xl font-bold text-primary">
                  {tap.price.toLocaleString("hu-HU")} Ft
                </p>
              </div>
            ))}
          </div>
        );

      case "osszesites":
        const selectedSzenzorokList = selection.szenzorok
          .map((id) => szenzorok.find((s) => s.id === id))
          .filter(Boolean);
        const selectedEszkoz = eszkozok.find((e) => e.id === selection.eszkoz);
        const selectedDoboz = dobozok.find((d) => d.id === selection.doboz);
        const selectedTap = tapellatasok.find((t) => t.id === selection.tapellatas);
        const selectedDobozSzin = dobozSzinek.find((s) => s.id === selection.dobozSzin);
        const selectedTetoSzin = tetoSzinek.find((s) => s.id === selection.tetoSzin);
        const szenzorokTotal = selectedSzenzorokList.reduce((sum, sz) => sum + (sz?.price || 0), 0);

        return (
          <div className="mx-auto max-w-2xl">
            <div className="rounded-xl border-2 border-stroke bg-white p-6 dark:border-stroke-dark dark:bg-dark">
              <h4 className="mb-6 text-center text-xl font-bold text-black dark:text-white">
                Rendelés összesítése
              </h4>

              <div className="space-y-4">
                {/* Szenzorok - több is lehet */}
                <div className="border-b border-stroke pb-3 dark:border-stroke-dark">
                  <p className="mb-2 text-sm font-medium text-body">Szenzorok ({selectedSzenzorokList.length} db)</p>
                  {selectedSzenzorokList.map((sz) => (
                    <div key={sz?.id} className="flex items-center justify-between py-1">
                      <p className="font-medium text-black dark:text-white">
                        {sz?.icon} {sz?.name}
                      </p>
                      <p className="font-semibold text-black dark:text-white">
                        {sz?.price.toLocaleString("hu-HU")} Ft
                      </p>
                    </div>
                  ))}
                  <div className="mt-2 flex items-center justify-between border-t border-dashed border-gray-300 pt-2 dark:border-gray-600">
                    <p className="text-sm text-body">Szenzorok összesen:</p>
                    <p className="font-semibold text-primary">
                      {szenzorokTotal.toLocaleString("hu-HU")} Ft
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-b border-stroke pb-3 dark:border-stroke-dark">
                  <div>
                    <p className="font-medium text-black dark:text-white">
                      {selectedEszkoz?.icon} {selectedEszkoz?.name}
                    </p>
                    <p className="text-sm text-body">Eszköz</p>
                  </div>
                  <p className="font-semibold text-black dark:text-white">
                    {selectedEszkoz?.price.toLocaleString("hu-HU")} Ft
                  </p>
                </div>

                <div className="flex items-center justify-between border-b border-stroke pb-3 dark:border-stroke-dark">
                  <div>
                    <p className="font-medium text-black dark:text-white">
                      {selectedDoboz?.icon} {selectedDoboz?.name}
                    </p>
                    <p className="text-sm text-body">
                      Doboz ({selectedDobozSzin?.name} / {selectedTetoSzin?.name} tető)
                    </p>
                  </div>
                  <p className="font-semibold text-black dark:text-white">
                    {selectedDoboz?.price.toLocaleString("hu-HU")} Ft
                  </p>
                </div>

                <div className="flex items-center justify-between border-b border-stroke pb-3 dark:border-stroke-dark">
                  <div>
                    <p className="font-medium text-black dark:text-white">
                      {selectedTap?.icon} {selectedTap?.name}
                    </p>
                    <p className="text-sm text-body">Tápellátás</p>
                  </div>
                  <p className="font-semibold text-black dark:text-white">
                    {selectedTap?.price.toLocaleString("hu-HU")} Ft
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <p className="text-xl font-bold text-black dark:text-white">Összesen:</p>
                  <p className="text-2xl font-bold text-primary">
                    {calculateTotal().toLocaleString("hu-HU")} Ft
                  </p>
                </div>
                <p className="text-right text-sm text-body">+ ÁFA</p>
              </div>

              <button
                onClick={handleOrder}
                className="bg-primary hover:bg-primary/90 mt-6 w-full rounded-lg py-4 text-lg font-semibold text-white transition-all"
              >
                Megrendelés
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "szenzor":
        return "Válassz szenzort!";
      case "eszkoz":
        return "Válassz eszközt!";
      case "doboz":
        return "Válassz dobozt!";
      case "szin":
        return "Válassz színt!";
      case "tapellatas":
        return "Akkumulátoros vagy vezetékes?";
      case "osszesites":
        return "Ellenőrizd a rendelésed!";
      default:
        return "";
    }
  };

  return (
    <section className="relative z-10">
      <div className="container">
        {/* Fejléc */}
        <div className="wow fadeInUp mx-auto mb-10 max-w-[690px] text-center" data-wow-delay=".2s">
          <h2 className="mb-4 text-3xl font-bold text-black dark:text-white sm:text-4xl md:text-[44px] md:leading-tight">
            Termék konfigurátor
          </h2>
          <p className="text-base text-body">
            Állítsd össze a saját szenzor csomagodat lépésről lépésre!
          </p>
        </div>

        {/* Lépés indikátor */}
        <div className="mb-10">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            {steps.map((step, index) => {
              const stepIndex = steps.findIndex((s) => s.id === currentStep);
              const isActive = step.id === currentStep;
              const isCompleted = index < stepIndex;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                        isActive
                          ? "bg-primary text-white"
                          : isCompleted
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                      }`}
                    >
                      {isCompleted ? "✓" : step.icon}
                    </div>
                    <span
                      className={`mt-2 hidden text-xs font-medium sm:block ${
                        isActive
                          ? "text-primary"
                          : isCompleted
                            ? "text-green-500"
                            : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 rounded ${
                        index < stepIndex ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Aktuális lépés címe */}
        <h3 className="mb-8 text-center text-2xl font-semibold text-black dark:text-white">
          {getStepTitle()}
        </h3>

        {/* Lépés tartalma */}
        <div className="mb-10">{renderStepContent()}</div>

        {/* Navigációs gombok */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === "szenzor"}
            className={`rounded-lg px-6 py-3 font-medium transition-all ${
              currentStep === "szenzor"
                ? "cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-700"
                : "bg-gray-200 text-black hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            }`}
          >
            ← Vissza
          </button>

          {/* Aktuális ár */}
          <div className="text-center">
            <p className="text-sm text-body">Jelenlegi összeg:</p>
            <p className="text-2xl font-bold text-primary">
              {calculateTotal().toLocaleString("hu-HU")} Ft
            </p>
          </div>

          {currentStep !== "osszesites" ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className={`rounded-lg px-6 py-3 font-medium transition-all ${
                canProceed()
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-700"
              }`}
            >
              Tovább →
            </button>
          ) : (
            <div className="w-24" /> // Placeholder a layout megtartásához
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductConfigurator;
