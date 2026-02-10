"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import axios from "axios";
import { OrderPayload } from "@/types/order";
import { ALT_MODEL_PATH } from "@/lib/modelPaths";
import FoxpostSelector, { FoxpostAutomataData } from "./FoxpostSelector";

const formatFoxpostFindme = (value: string) =>
  value
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

// Szenzor típusok
const szenzorok = [
  {
    id: "htu21d",
    name: "HTU21D",
    description: "Hőmérséklet és páratartalom szenzor",
    price: 5000,
    imageUrl: "/images/szenzorok/htu21.png",
  },
  {
    id: "mpu6050",
    name: "MPU-6050",
    description: "6 tengelyes gyorsulásmérő és giroszkóp",
    price: 6000,
    imageUrl: "/images/szenzorok/mpu6050.png",
  },
  {
    id: "gaz",
    name: "Gáz szenzor",
    description: "Általános gáz érzékelő",
    price: 7000,
    imageUrl: "/images/szenzorok/gassensor.png",
  },
  {
    id: "homerseklet",
    name: "Hőmérséklet szenzor",
    description: "Precíz hőmérséklet mérés",
    price: 4500,
    imageUrl: "/images/szenzorok/homersekletsensor.png",
  },
  {
    id: "paratartalom",
    name: "Páratartalom szenzor",
    description: "Páratartalom mérés",
    price: 4500,
    imageUrl: "/images/szenzorok/htu21.png",
  },
  {
    id: "feny",
    name: "Fény szenzor",
    description: "Fényerősség mérő szenzor",
    price: 4000,
    imageUrl: "/images/szenzorok/lightsensor.png",
  },
  {
    id: "hidrogen",
    name: "Hidrogén szenzor",
    description: "Hidrogén gáz érzékelő",
    price: 8000,
    imageUrl: "/images/szenzorok/hidrogensensor.png",
  },
  {
    id: "metan",
    name: "Metán szenzor",
    description: "Metán gáz érzékelő",
    price: 7500,
    imageUrl: "/images/szenzorok/metan.png",
  },
  {
    id: "sensorion",
    name: "SENSORION hőmérséklet szenzor",
    description: "SENSORION precíziós hőmérséklet szenzor",
    price: 9000,
    imageUrl: "/images/szenzorok/levegominoseg.png",
  },
  {
    id: "o2",
    name: "O2 szenzor",
    description: "Oldott oxigén mérés",
    price: 8000,
    imageUrl: "/images/szenzorok/gassensor.png",
  },
  {
    id: "co2",
    name: "CO2 szenzor",
    description: "CO2 szint mérés",
    price: 8500,
    imageUrl: "/images/szenzorok/gassensor.png",
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
  { id: "feher", name: "Fehér", hex: "#f9fafb" },
  { id: "sarga", name: "Sárga", hex: "#eab308" },
  { id: "piros", name: "Piros", hex: "#ef4444" },
  { id: "kek", name: "Kék", hex: "#3b82f6" },
  { id: "fekete", name: "Fekete", hex: "#1f2937" },
];

// Tető színek
const tetoSzinek = [
  { id: "feher", name: "Fehér", hex: "#f9fafb" },
  { id: "sarga", name: "Sárga", hex: "#eab308" },
  { id: "kek", name: "Kék", hex: "#3b82f6" },
  { id: "zold", name: "Zöld", hex: "#22c55e" },
  { id: "piros", name: "Piros", hex: "#ef4444" },
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
];

// Szállítási módok
const szallitasiModok = [
  {
    id: "foxpost",
    name: "Foxpost automata",
    description: "Csomagautomata átvétel",
  },
  {
    id: "hazhoz",
    name: "Házhozszállítás",
    description: "Kézbesítés a megadott címre",
  },
] as const;

// PLACEHOLDER - allitsd be a vegleges szallitasi dijakat (HUF)
const SZALLITASI_ARAK = {
  foxpost: 0,
  hazhoz: 0,
} as const;

const VAT_PERCENT = 27;

// Fizetési módok
const fizetesiModok = [
  {
    id: "utalas",
    name: "Utalás",
    description: "Díjbekérő / előre utalás",
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Bankkártyás fizetés",
  },
] as const;

const elofizetesek = [
  {
    id: "ingyenes",
    name: "Ingyenes",
    description: "Alap csomag",
    price: 0,
  },
  {
    id: "havi",
    name: "Havi",
    description: "Havi előfizetés",
    price: 1000,
  },
  {
    id: "eves",
    name: "Éves",
    description: "Éves előfizetés",
    price: 10000,
  },
] as const;

// Burok anyag típusok (PLACEHOLDER - árak és típusok később pontosítandók)
const anyagok = [
  {
    id: "normal_burkolat",
    name: "Normál burkolat",
    description: "Alap burkolat (PLACEHOLDER - ár később pontosítandó)",
    price: 0,
    icon: "🧱",
  },
  {
    id: "vizallo_burkolat",
    name: "Vízálló burkolat",
    description: "Nedves környezethez (PLACEHOLDER - ár később pontosítandó)",
    price: 2500,
    icon: "💧",
  },
  {
    id: "sima_pla",
    name: "Sima PLA",
    description: "Alap PLA anyag, beltéri használatra",
    price: 0, // Alap ár, nincs felár
    icon: "🧱",
  },
  {
    id: "uv_allo_pla",
    name: "UV álló PLA",
    description: "UV sugárzásnak ellenálló, kültéri használatra",
    price: 1500,
    icon: "☀️",
  },
  {
    id: "abs",
    name: "ABS",
    description: "Hőálló, ütésálló műanyag",
    price: 2000,
    icon: "🛡️",
  },
  {
    id: "petg",
    name: "PETG",
    description: "Vegyszerálló, erős és rugalmas",
    price: 2500,
    icon: "💪",
  },
];

// Javasolt konfigurációk
const presetOptions = [
  {
    id: "huto",
    label: "Hűtő",
    description: "Hő + páratartalom szenzor, normál burkolat",
    szenzorok: ["homerseklet", "paratartalom"],
    anyagId: "normal_burkolat",
  },
  {
    id: "akvarium",
    label: "Akvárium",
    description: "Hő + O2 + CO2 szenzor, vízálló burkolat",
    szenzorok: ["homerseklet", "o2", "co2"],
    anyagId: "vizallo_burkolat",
  },
  {
    id: "hutokamra",
    label: "Hűtőkamra",
    description: "SENSORION hőmérséklet + páratartalom, normál burkolat",
    szenzorok: ["sensorion", "paratartalom"],
    anyagId: "normal_burkolat",
  },
  {
    id: "hideglanc_monitor",
    label: "Hideglánc monitor",
    description: "SENSORION hőmérséklet + MPU-6050, PETG",
    szenzorok: ["sensorion", "mpu6050"],
    anyagId: "petg",
  },
  {
    id: "gyogyszertarolo",
    label: "Gyógyszertároló",
    description: "SENSORION hőmérséklet + páratartalom, ABS",
    szenzorok: ["sensorion", "paratartalom"],
    anyagId: "abs",
  },
  {
    id: "raktar_kornyezetfigyelo",
    label: "Raktár környezetfigyelő",
    description: "HTU21D + MPU-6050, PETG",
    szenzorok: ["htu21d", "mpu6050"],
    anyagId: "petg",
  },
  {
    id: "server_szoba_monitor",
    label: "Server szoba monitor",
    description: "SENSORION hőmérséklet + CO2, ABS",
    szenzorok: ["sensorion", "co2"],
    anyagId: "abs",
  },
  {
    id: "iroda_levegominoseg",
    label: "Iroda levegőminőség",
    description: "CO2 + HTU21D, Sima PLA",
    szenzorok: ["co2", "htu21d"],
    anyagId: "sima_pla",
  },
  {
    id: "tanterem_levegofigyelo",
    label: "Tanterem levegőfigyelő",
    description: "CO2 + hőmérséklet, Sima PLA",
    szenzorok: ["co2", "homerseklet"],
    anyagId: "sima_pla",
  },
  {
    id: "kazan_biztonsag",
    label: "Kazánház biztonság",
    description: "Gáz + O2, ABS",
    szenzorok: ["gaz", "o2"],
    anyagId: "abs",
  },
  {
    id: "garazs_gazfigyelo",
    label: "Garázs gázfigyelő",
    description: "Gáz + CO2, PETG",
    szenzorok: ["gaz", "co2"],
    anyagId: "petg",
  },
  {
    id: "akku_tolto_helyiseg",
    label: "Akkumulátor töltő helyiség",
    description: "Hidrogén + hőmérséklet, ABS",
    szenzorok: ["hidrogen", "homerseklet"],
    anyagId: "abs",
  },
  {
    id: "allattarto_telep",
    label: "Állattartó telep levegőfigyelő",
    description: "Metán + CO2 + O2, vízálló burkolat",
    szenzorok: ["metan", "co2", "o2"],
    anyagId: "vizallo_burkolat",
  },
  {
    id: "logisztikai_csomagfigyelo",
    label: "Logisztikai csomagfigyelő",
    description: "MPU-6050 + hőmérséklet, PETG",
    szenzorok: ["mpu6050", "homerseklet"],
    anyagId: "petg",
  },
  {
    id: "szallitasi_sokkfigyelo",
    label: "Szállítási sokkfigyelő",
    description: "MPU-6050, PETG",
    szenzorok: ["mpu6050"],
    anyagId: "petg",
  },
  {
    id: "tarolo_kontener",
    label: "Tároló konténer monitor",
    description: "Hőmérséklet + MPU-6050, PETG",
    szenzorok: ["homerseklet", "mpu6050"],
    anyagId: "petg",
  },
];

type StepId = "mod" | "szenzor" | "anyag" | "doboz" | "szin" | "tapellatas" | "elofizetes" | "szallitas" | "fizetes" | "osszesites";
type ConfigMode = "preset" | "custom";

const MAX_SZENZOROK = 2;

interface Selection {
  szenzorok: string[]; // Custom max 2, preset limit
  anyag: string | null;
  doboz: string | null;
  dobozSzin: string;
  tetoSzin: string;
  tapellatas: string | null;
  elofizetes: "ingyenes" | "havi" | "eves" | null;
  shippingMode: "foxpost" | "hazhoz" | null;
  paymentMode: "utalas" | "stripe" | null;
  shippingAddress: {
    zip: string;
    city: string;
    street: string;
    houseNumber: string;
    stair: string;
    floor: string;
    door: string;
  };
  billingSame: boolean;
  billingAddress: {
    zip: string;
    city: string;
    street: string;
    houseNumber: string;
    stair: string;
    floor: string;
    door: string;
  };
  foxpostAutomata: FoxpostAutomataData | null;
}

const ProductConfigurator = () => {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState<StepId>("mod");
  const [configMode, setConfigMode] = useState<ConfigMode | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [selection, setSelection] = useState<Selection>({
    szenzorok: [],
    anyag: null,
    doboz: null,
    dobozSzin: "zold",
    tetoSzin: "feher",
    tapellatas: null,
    elofizetes: null,
    shippingMode: null,
    paymentMode: null,
    shippingAddress: {
      zip: "",
      city: "",
      street: "",
      houseNumber: "",
      stair: "",
      floor: "",
      door: "",
    },
    billingSame: true,
    billingAddress: {
      zip: "",
      city: "",
      street: "",
      houseNumber: "",
      stair: "",
      floor: "",
      door: "",
    },
    foxpostAutomata: null,
  });

  const modelViewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    import("@google/model-viewer");
  }, []);

  const getModelPath = (box: string, top: string) => `/images/hero/${box}/${box}_${top}.glb`;
  const modelSrc =
    selection.tapellatas === "akkus"
      ? ALT_MODEL_PATH
      : getModelPath(selection.dobozSzin, selection.tetoSzin);

  const steps: { id: StepId; title: string; icon: string }[] = [
    { id: "mod", title: "Mód", icon: "1" },
    { id: "szenzor", title: "Szenzor", icon: "2" },
    { id: "anyag", title: "Anyag", icon: "3" },
    { id: "tapellatas", title: "Tápellátás", icon: "4" },
    { id: "doboz", title: "Doboz", icon: "5" },
    { id: "szin", title: "Szín", icon: "6" },
    { id: "elofizetes", title: "Előfizetés", icon: "7" },
    { id: "szallitas", title: "Szállítás", icon: "8" },
    { id: "fizetes", title: "Fizetés", icon: "9" },
    { id: "osszesites", title: "Összesítés", icon: "✓" },
  ];

  const selectedPreset = presetOptions.find((preset) => preset.id === selectedPresetId) ?? null;
  const isPresetLocked = configMode === "preset" && Boolean(selectedPreset);
  const hiddenSteps = isPresetLocked ? new Set<StepId>(["szenzor", "anyag"]) : null;
  const visibleSteps = steps.filter((step) => !hiddenSteps?.has(step.id));
  const maxSzenzorok = configMode === "preset"
    ? (selectedPreset?.szenzorok.length ?? MAX_SZENZOROK)
    : MAX_SZENZOROK;
  const visibleSzenzorok = isPresetLocked && selectedPreset
    ? szenzorok.filter((szenzor) => selectedPreset.szenzorok.includes(szenzor.id))
    : szenzorok;


  const calculateSubtotal = () => {
    let total = 0;
    // Több szenzor összege
    for (const szenzorId of selection.szenzorok) {
      const szenzor = szenzorok.find((s) => s.id === szenzorId);
      if (szenzor) total += szenzor.price;
    }
    // Anyag (burok) ár
    if (selection.anyag) {
      const anyag = anyagok.find((a) => a.id === selection.anyag);
      if (anyag) total += anyag.price;
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

  const calculateSubscriptionFee = () => {
    if (!selection.elofizetes) return 0;
    const elofizetes = elofizetesek.find((e) => e.id === selection.elofizetes);
    return elofizetes ? elofizetes.price : 0;
  };

  const getShippingFee = () =>
    selection.shippingMode ? SZALLITASI_ARAK[selection.shippingMode] : 0;

  const calculateVatAmount = (subtotal: number) =>
    Math.round(subtotal * (VAT_PERCENT / 100));

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    const vatAmount = calculateVatAmount(subtotal);
    return subtotal + vatAmount + getShippingFee() + calculateSubscriptionFee();
  };

  const isAddressComplete = (address: Selection["shippingAddress"]) =>
    Boolean(
      address.zip.trim() &&
      address.city.trim() &&
      address.street.trim() &&
      address.houseNumber.trim()
    );

  const isShippingValid = () => {
    if (!selection.shippingMode) return false;

    if (selection.shippingMode === "foxpost") {
      if (!isAddressComplete(selection.billingAddress)) return false;
      if (!selection.foxpostAutomata) return false;
      return true;
    }

    if (!isAddressComplete(selection.shippingAddress)) return false;
    if (!selection.billingSame && !isAddressComplete(selection.billingAddress)) return false;
    return true;
  };

  const toggleSzenzor = (szenzorId: string) => {
    if (isPresetLocked) {
      toast.error("A preset szenzorok nem módosíthatók.");
      return;
    }
    const isSelected = selection.szenzorok.includes(szenzorId);
    
    if (isSelected) {
      // Eltávolítás
      setSelection((prev) => ({
        ...prev,
        szenzorok: prev.szenzorok.filter((id) => id !== szenzorId),
      }));
    } else {
      // Hozzáadás (max limit a mód alapján)
      if (selection.szenzorok.length >= maxSzenzorok) {
        toast.error(`Maximum ${maxSzenzorok} szenzort választhatsz!`);
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
      case "mod":
        if (configMode === "preset") return Boolean(selectedPresetId);
        if (configMode === "custom") return true;
        return false;
      case "szenzor":
        return selection.szenzorok.length > 0; // Legalább 1 szenzor kell
      case "anyag":
        return selection.anyag !== null;
      case "doboz":
        return selection.doboz !== null;
      case "szin":
        return true; // Szín mindig van alapértelmezett
      case "tapellatas":
        return selection.tapellatas !== null;
      case "elofizetes":
        return selection.elofizetes !== null;
      case "szallitas":
        return isShippingValid();
      case "fizetes":
        return selection.paymentMode !== null;
      case "osszesites":
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    const stepIndex = visibleSteps.findIndex((s) => s.id === currentStep);
    if (stepIndex === -1) {
      if (visibleSteps.length > 0) {
        setCurrentStep(visibleSteps[0].id);
      }
      return;
    }
    if (stepIndex < visibleSteps.length - 1 && canProceed()) {
      setCurrentStep(visibleSteps[stepIndex + 1].id);
    }
  };

  const prevStep = () => {
    const stepIndex = visibleSteps.findIndex((s) => s.id === currentStep);
    if (stepIndex === -1) {
      if (visibleSteps.length > 0) {
        setCurrentStep(visibleSteps[0].id);
      }
      return;
    }
    if (stepIndex > 0) {
      setCurrentStep(visibleSteps[stepIndex - 1].id);
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
    const selectedAnyag = anyagok.find((a) => a.id === selection.anyag);
    const selectedDoboz = dobozok.find((d) => d.id === selection.doboz);
    const selectedTap = tapellatasok.find((t) => t.id === selection.tapellatas);
    const selectedElofizetes =
      elofizetesek.find((e) => e.id === selection.elofizetes) ??
      elofizetesek.find((e) => e.id === "ingyenes") ??
      null;
    const selectedDobozSzin = dobozSzinek.find((s) => s.id === selection.dobozSzin);
    const selectedTetoSzin = tetoSzinek.find((s) => s.id === selection.tetoSzin);

    if (selectedSzenzorok.length === 0 || !selectedAnyag || !selectedDoboz || !selectedTap) {
      toast.error("Hiányzó termék választás!");
      return;
    }

    if (!isShippingValid()) {
      toast.error("Hiányzó szállítási adatok!");
      return;
    }

    if (!selection.paymentMode) {
      toast.error("Hiányzó fizetési mód!");
      return;
    }

    const subtotal = calculateSubtotal();
    const subscriptionFee = calculateSubscriptionFee();
    const vatPercent = VAT_PERCENT;
    const vatAmount = calculateVatAmount(subtotal);
    const shippingFee = getShippingFee();
    const total = subtotal + vatAmount + shippingFee + subscriptionFee;

    const orderPayload: OrderPayload = {
      userId: (session.user as any).id || "unknown",
      userEmail: session.user?.email || "",
      userName: session.user?.name || "Ismeretlen",

      szenzorok: selectedSzenzorok.map((sz) => ({
        id: sz!.id,
        name: sz!.name,
        price: sz!.price,
        quantity: 1,
      })),
      anyag: {
        id: selectedAnyag.id,
        name: selectedAnyag.name,
        price: selectedAnyag.price,
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
      elofizetes: selectedElofizetes
        ? {
            id: selectedElofizetes.id,
            name: selectedElofizetes.name,
            price: selectedElofizetes.price,
            quantity: 1,
          }
        : {
            id: "ingyenes",
            name: "Ingyenes",
            price: 0,
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

      shipping: {
        mode: selection.shippingMode!,
        shippingAddress:
          selection.shippingMode === "hazhoz"
            ? {
                zip: selection.shippingAddress.zip.trim(),
                city: selection.shippingAddress.city.trim(),
                street: selection.shippingAddress.street.trim(),
                houseNumber: selection.shippingAddress.houseNumber.trim(),
                stair: selection.shippingAddress.stair.trim() || null,
                floor: selection.shippingAddress.floor.trim() || null,
                door: selection.shippingAddress.door.trim() || null,
              }
            : null,
        billingSame: selection.shippingMode === "hazhoz" ? selection.billingSame : true,
        billingAddress:
          selection.shippingMode === "hazhoz" && selection.billingSame
            ? {
                zip: selection.shippingAddress.zip.trim(),
                city: selection.shippingAddress.city.trim(),
                street: selection.shippingAddress.street.trim(),
                houseNumber: selection.shippingAddress.houseNumber.trim(),
                stair: selection.shippingAddress.stair.trim() || null,
                floor: selection.shippingAddress.floor.trim() || null,
                door: selection.shippingAddress.door.trim() || null,
              }
            : {
                zip: selection.billingAddress.zip.trim(),
                city: selection.billingAddress.city.trim(),
                street: selection.billingAddress.street.trim(),
                houseNumber: selection.billingAddress.houseNumber.trim(),
                stair: selection.billingAddress.stair.trim() || null,
                floor: selection.billingAddress.floor.trim() || null,
                door: selection.billingAddress.door.trim() || null,
              },
        foxpostAutomata:
          selection.shippingMode === "foxpost" && selection.foxpostAutomata
            ? selection.foxpostAutomata.name
            : null,
        foxpostAutomataDetails:
          selection.shippingMode === "foxpost" && selection.foxpostAutomata
            ? {
                place_id: selection.foxpostAutomata.place_id,
                operator_id: selection.foxpostAutomata.operator_id,
                name: selection.foxpostAutomata.name,
                address: selection.foxpostAutomata.address,
                city: selection.foxpostAutomata.city,
                zip: selection.foxpostAutomata.zip,
                geolat: selection.foxpostAutomata.geolat,
                geolng: selection.foxpostAutomata.geolng,
                findme: selection.foxpostAutomata.findme,
              }
            : null,
      },

      payment: {
        mode: selection.paymentMode!,
      },

      subtotal,
      vatPercent,
      vatAmount,
      shippingFee,
      total,

      currency: "HUF",
      createdAt: new Date().toISOString(),
      locale: "hu-HU",
      ...(configMode === "preset" && selectedPreset
        ? {
            presetId: selectedPreset.id,
            presetLabel: selectedPreset.label,
            presetMaxSzenzorok: selectedPreset.szenzorok.length,
          }
        : {}),
    };

    const orderApiUrl = process.env.NEXT_PUBLIC_ORDER_API_URL;
    if (!orderApiUrl) {
      toast.error("Hiányzó API URL (NEXT_PUBLIC_ORDER_API_URL)");
      return;
    }

    try {
      const { data } = await axios.post(orderApiUrl, orderPayload);
      
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

  const applyPreset = (presetId: string) => {
    const preset = presetOptions.find((item) => item.id === presetId);
    if (!preset) return;

    setConfigMode("preset");
    setSelectedPresetId(presetId);
    setSelection((prev) => ({
      ...prev,
      szenzorok: preset.szenzorok,
      anyag: preset.anyagId,
    }));
  };

  const selectCustomMode = () => {
    setConfigMode("custom");
    setSelectedPresetId(null);
    setSelection((prev) => ({
      ...prev,
      szenzorok: [],
      anyag: null,
    }));
  };

  const updateAddressField = (
    target: "shippingAddress" | "billingAddress",
    field: keyof Selection["shippingAddress"],
    value: string
  ) => {
    setSelection((prev) => ({
      ...prev,
      [target]: {
        ...prev[target],
        [field]: value,
      },
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "mod":
        return (
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {presetOptions.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.id)}
                  className={`rounded-2xl border-2 p-6 text-left transition-all hover:shadow-lg ${
                    configMode === "preset" && selectedPresetId === preset.id
                      ? "border-primary bg-primary/10"
                      : "border-stroke dark:border-stroke-dark bg-white dark:bg-dark"
                  }`}
                >
                  <h4 className="mb-2 text-lg font-semibold text-black dark:text-white">
                    {preset.label}
                  </h4>
                  <p className="text-sm text-body">{preset.description}</p>
                </button>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={selectCustomMode}
                className={`w-full max-w-sm rounded-2xl border-2 px-6 py-4 text-center text-base font-semibold transition-all hover:shadow-lg ${
                  configMode === "custom"
                    ? "border-primary bg-primary/10 text-black dark:text-white"
                    : "border-stroke dark:border-stroke-dark bg-white dark:bg-dark text-black dark:text-white"
                }`}
              >
                Teljeskörű személyre szabás
              </button>
            </div>
          </div>
        );
      case "szenzor":
        return (
          <div>
            {configMode === "preset" && selectedPreset && (
              <p className="mb-2 text-center text-sm text-body">
                Előre beállított konfiguráció: {selectedPreset.label} (a szenzorok és a burkolat nem módosíthatók)
              </p>
            )}
            {configMode !== "preset" && (
              <p className="mb-4 text-center text-sm text-body">
                Válassz max. {maxSzenzorok} szenzort! ({selection.szenzorok.length}/{maxSzenzorok} kiválasztva)
              </p>
            )}
            <div
              className={`mx-auto max-w-5xl gap-3 ${
                isPresetLocked
                  ? "flex flex-wrap justify-center"
                  : "grid grid-cols-2 sm:grid-cols-4"
              }`}
            >
              {visibleSzenzorok.map((szenzor) => {
                const isSelected = selection.szenzorok.includes(szenzor.id);
                return (
                  <div
                    key={szenzor.id}
                    onClick={isPresetLocked ? undefined : () => toggleSzenzor(szenzor.id)}
                    className={`rounded-xl border-2 p-4 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-stroke dark:border-stroke-dark bg-white dark:bg-dark"
                    } ${isPresetLocked ? "cursor-not-allowed opacity-80 w-full max-w-[240px]" : "cursor-pointer hover:shadow-lg"}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-lg bg-slate-100 p-2 dark:bg-slate-800 sm:h-24 sm:w-24">
                        <img
                          src={szenzor.imageUrl}
                          alt={szenzor.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
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
                    <h4 className="mb-1 text-base font-semibold text-black dark:text-white">
                      {szenzor.name}
                    </h4>
                    <p className="mb-2 text-xs text-body break-words">{szenzor.description}</p>
                    <p className="text-lg font-bold text-primary">
                      {szenzor.price.toLocaleString("hu-HU")} Ft
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "anyag":
        return (
          <div>
            {isPresetLocked && selectedPreset && (
              <p className="mb-4 text-center text-sm text-body">
                A burkolat a(z) {selectedPreset.label} konfigurációhoz kötött, nem módosítható.
              </p>
            )}
            {!isPresetLocked && (
              <p className="mb-4 text-center text-sm text-body">
                Válaszd ki a burok anyagát! (PLACEHOLDER - árak és típusok később pontosítandók)
              </p>
            )}
            <div
              className={`gap-4 ${
                isPresetLocked
                  ? "flex justify-center"
                  : "grid grid-cols-1 md:grid-cols-2"
              }`}
            >
              {(isPresetLocked
                ? anyagok.filter((anyag) => anyag.id === selection.anyag)
                : anyagok
              ).map((anyag) => (
                <div
                  key={anyag.id}
                  onClick={isPresetLocked ? undefined : () => setSelection({ ...selection, anyag: anyag.id })}
                  className={`rounded-xl border-2 p-6 transition-all ${
                    selection.anyag === anyag.id
                      ? "border-primary bg-primary/10"
                      : "border-stroke dark:border-stroke-dark bg-white dark:bg-dark"
                  } ${isPresetLocked ? "cursor-not-allowed opacity-80 w-full max-w-[320px]" : "cursor-pointer hover:shadow-lg"}`}
                >
                  <div className="mb-3 text-4xl">{anyag.icon}</div>
                  <h4 className="mb-2 text-lg font-semibold text-black dark:text-white">
                    {anyag.name}
                  </h4>
                  <p className="mb-3 text-sm text-body">{anyag.description}</p>
                  <p className="text-xl font-bold text-primary">
                    {anyag.price === 0 ? "Alap ár" : `+${anyag.price.toLocaleString("hu-HU")} Ft`}
                  </p>
                </div>
              ))}
            </div>
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
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
          </div>
        );

      case "elofizetes":
        return (
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {elofizetesek.map((plan) => (
                <button
                  type="button"
                  key={plan.id}
                  onClick={() => setSelection({ ...selection, elofizetes: plan.id })}
                  className={`rounded-xl border-2 p-6 text-left transition-all hover:shadow-lg ${
                    selection.elofizetes === plan.id
                      ? "border-primary bg-primary/10"
                      : "border-stroke dark:border-stroke-dark bg-white dark:bg-dark"
                  }`}
                >
                  <h4 className="mb-2 text-lg font-semibold text-black dark:text-white">
                    {plan.name}
                  </h4>
                  <p className="mb-3 text-sm text-body">{plan.description}</p>
                  <p className="text-xl font-bold text-primary">
                    {plan.price === 0 ? "0 Ft" : `${plan.price.toLocaleString("hu-HU")} Ft`}
                  </p>
                </button>
              ))}
            </div>
          </div>
        );

      case "szallitas":
        return (
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {szallitasiModok.map((mod) => (
                <button
                  type="button"
                  key={mod.id}
                  onClick={() =>
                    setSelection((prev) => ({
                      ...prev,
                      shippingMode: mod.id,
                      billingSame: mod.id === "hazhoz" ? prev.billingSame : true,
                    }))
                  }
                  className={`rounded-xl border-2 p-5 text-left transition-all hover:shadow-lg ${
                    selection.shippingMode === mod.id
                      ? "border-primary bg-primary/10"
                      : "border-stroke dark:border-stroke-dark bg-white dark:bg-dark"
                  }`}
                >
                  <h4 className="mb-2 text-base font-semibold text-black dark:text-white">
                    {mod.name}
                  </h4>
                  <p className="text-sm text-body">{mod.description}</p>
                </button>
              ))}
            </div>

            {selection.shippingMode === "foxpost" && (
              <div className="space-y-4">
                <p className="text-sm text-body">
                  Foxpost automata esetén a cím a számlázási cím.
                </p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Irányítószám"
                    value={selection.billingAddress.zip}
                    onChange={(ev) => updateAddressField("billingAddress", "zip", ev.target.value)}
                    className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-sm text-black outline-none focus:border-primary dark:border-stroke-dark dark:bg-dark dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Város"
                    value={selection.billingAddress.city}
                    onChange={(ev) => updateAddressField("billingAddress", "city", ev.target.value)}
                    className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-sm text-black outline-none focus:border-primary dark:border-stroke-dark dark:bg-dark dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Utca"
                    value={selection.billingAddress.street}
                    onChange={(ev) => updateAddressField("billingAddress", "street", ev.target.value)}
                    className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-sm text-black outline-none focus:border-primary dark:border-stroke-dark dark:bg-dark dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Házszám"
                    value={selection.billingAddress.houseNumber}
                    onChange={(ev) => updateAddressField("billingAddress", "houseNumber", ev.target.value)}
                    className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-sm text-black outline-none focus:border-primary dark:border-stroke-dark dark:bg-dark dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Lépcsőház (opcionális)"
                    value={selection.billingAddress.stair}
                    onChange={(ev) => updateAddressField("billingAddress", "stair", ev.target.value)}
                    className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-sm text-black outline-none focus:border-primary dark:border-stroke-dark dark:bg-dark dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Emelet (opcionális)"
                    value={selection.billingAddress.floor}
                    onChange={(ev) => updateAddressField("billingAddress", "floor", ev.target.value)}
                    className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-sm text-black outline-none focus:border-primary dark:border-stroke-dark dark:bg-dark dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Ajtó (opcionális)"
                    value={selection.billingAddress.door}
                    onChange={(ev) => updateAddressField("billingAddress", "door", ev.target.value)}
                    className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-sm text-black outline-none focus:border-primary dark:border-stroke-dark dark:bg-dark dark:text-white"
                  />
                </div>

                <div className="rounded-xl border border-stroke bg-white p-4 dark:border-stroke-dark dark:bg-dark">
                  <p className="mb-3 text-sm text-body">
                    Válaszd ki a csomagautomatát a térképes keresőből:
                  </p>
                  <FoxpostSelector
                    selected={selection.foxpostAutomata}
                    onSelect={(automata) =>
                      setSelection((prev) => ({
                        ...prev,
                        foxpostAutomata: automata,
                      }))
                    }
                  />
                </div>
              </div>
            )}

            {selection.shippingMode === "hazhoz" && (
              <div className="space-y-4">
                <p className="text-sm text-body">Szállítási cím</p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Irányítószám"
                    value={selection.shippingAddress.zip}
                    onChange={(ev) => updateAddressField("shippingAddress", "zip", ev.target.value)}
                    className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-sm text-black outline-none focus:border-primary dark:border-stroke-dark dark:bg-dark dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Város"
                    value={selection.shippingAddress.city}
                    onChange={(ev) => updateAddressField("shippingAddress", "city", ev.target.value)}
                    className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-sm text-black outline-none focus:border-primary dark:border-stroke-dark dark:bg-dark dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Utca"
                    value={selection.shippingAddress.street}
                    onChange={(ev) => updateAddressField("shippingAddress", "street", ev.target.value)}
                    className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-sm text-black outline-none focus:border-primary dark:border-stroke-dark dark:bg-dark dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Házszám"
                    value={selection.shippingAddress.houseNumber}
                    onChange={(ev) => updateAddressField("shippingAddress", "houseNumber", ev.target.value)}
                    className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-sm text-black outline-none focus:border-primary dark:border-stroke-dark dark:bg-dark dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Lépcsőház (opcionális)"
                    value={selection.shippingAddress.stair}
                    onChange={(ev) => updateAddressField("shippingAddress", "stair", ev.target.value)}
                    className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-sm text-black outline-none focus:border-primary dark:border-stroke-dark dark:bg-dark dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Emelet (opcionális)"
                    value={selection.shippingAddress.floor}
                    onChange={(ev) => updateAddressField("shippingAddress", "floor", ev.target.value)}
                    className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-sm text-black outline-none focus:border-primary dark:border-stroke-dark dark:bg-dark dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Ajtó (opcionális)"
                    value={selection.shippingAddress.door}
                    onChange={(ev) => updateAddressField("shippingAddress", "door", ev.target.value)}
                    className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-sm text-black outline-none focus:border-primary dark:border-stroke-dark dark:bg-dark dark:text-white"
                  />
                </div>

                <label className="flex items-center gap-3 text-sm text-body">
                  <input
                    type="checkbox"
                    checked={selection.billingSame}
                    onChange={(ev) =>
                      setSelection({
                        ...selection,
                        billingSame: ev.target.checked,
                      })
                    }
                  />
                  Számlázási cím megegyezik a szállítási címmel
                </label>

                {!selection.billingSame && (
                  <div className="space-y-4">
                    <p className="text-sm text-body">Számlázási cím</p>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <input
                        type="text"
                        placeholder="Irányítószám"
                        value={selection.billingAddress.zip}
                        onChange={(ev) => updateAddressField("billingAddress", "zip", ev.target.value)}
                        className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-sm text-black outline-none focus:border-primary dark:border-stroke-dark dark:bg-dark dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Város"
                        value={selection.billingAddress.city}
                        onChange={(ev) => updateAddressField("billingAddress", "city", ev.target.value)}
                        className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-sm text-black outline-none focus:border-primary dark:border-stroke-dark dark:bg-dark dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Utca"
                        value={selection.billingAddress.street}
                        onChange={(ev) => updateAddressField("billingAddress", "street", ev.target.value)}
                        className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-sm text-black outline-none focus:border-primary dark:border-stroke-dark dark:bg-dark dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Házszám"
                        value={selection.billingAddress.houseNumber}
                        onChange={(ev) => updateAddressField("billingAddress", "houseNumber", ev.target.value)}
                        className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-sm text-black outline-none focus:border-primary dark:border-stroke-dark dark:bg-dark dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Lépcsőház (opcionális)"
                        value={selection.billingAddress.stair}
                        onChange={(ev) => updateAddressField("billingAddress", "stair", ev.target.value)}
                        className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-sm text-black outline-none focus:border-primary dark:border-stroke-dark dark:bg-dark dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Emelet (opcionális)"
                        value={selection.billingAddress.floor}
                        onChange={(ev) => updateAddressField("billingAddress", "floor", ev.target.value)}
                        className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-sm text-black outline-none focus:border-primary dark:border-stroke-dark dark:bg-dark dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Ajtó (opcionális)"
                        value={selection.billingAddress.door}
                        onChange={(ev) => updateAddressField("billingAddress", "door", ev.target.value)}
                        className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-sm text-black outline-none focus:border-primary dark:border-stroke-dark dark:bg-dark dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "fizetes":
        return (
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {fizetesiModok.map((mod) => (
                <button
                  type="button"
                  key={mod.id}
                  onClick={() => setSelection({
                    ...selection,
                    paymentMode: mod.id,
                  })}
                  className={`rounded-xl border-2 p-6 text-left transition-all hover:shadow-lg ${
                    selection.paymentMode === mod.id
                      ? "border-primary bg-primary/10"
                      : "border-stroke dark:border-stroke-dark bg-white dark:bg-dark"
                  }`}
                >
                  <h4 className="mb-2 text-lg font-semibold text-black dark:text-white">
                    {mod.name}
                  </h4>
                  <p className="text-sm text-body">{mod.description}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case "osszesites":
        const selectedSzenzorokList = selection.szenzorok
          .map((id) => szenzorok.find((s) => s.id === id))
          .filter(Boolean);
        const selectedAnyagOssz = anyagok.find((a) => a.id === selection.anyag);
        const selectedDoboz = dobozok.find((d) => d.id === selection.doboz);
        const selectedTap = tapellatasok.find((t) => t.id === selection.tapellatas);
        const selectedElofizetes = elofizetesek.find((e) => e.id === selection.elofizetes);
        const selectedDobozSzin = dobozSzinek.find((s) => s.id === selection.dobozSzin);
        const selectedTetoSzin = tetoSzinek.find((s) => s.id === selection.tetoSzin);
        const szenzorokTotal = selectedSzenzorokList.reduce((sum, sz) => sum + (sz?.price || 0), 0);
        const subtotal = calculateSubtotal();
        const vatAmount = calculateVatAmount(subtotal);
        const shippingFee = getShippingFee();
        const subscriptionFee = calculateSubscriptionFee();
        const total = subtotal + vatAmount + shippingFee + subscriptionFee;

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
                      <div className="flex items-center gap-2">
                        {sz?.imageUrl && (
                          <img
                            src={sz.imageUrl}
                            alt={sz.name}
                            className="h-6 w-6 object-contain"
                          />
                        )}
                        <p className="font-medium text-black dark:text-white">
                          {sz?.name}
                        </p>
                      </div>
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

                {/* Anyag */}
                <div className="flex items-center justify-between border-b border-stroke pb-3 dark:border-stroke-dark">
                  <div>
                    <p className="font-medium text-black dark:text-white">
                      {selectedAnyagOssz?.icon} {selectedAnyagOssz?.name}
                    </p>
                    <p className="text-sm text-body">Burok anyaga</p>
                  </div>
                  <p className="font-semibold text-black dark:text-white">
                    {selectedAnyagOssz?.price === 0 ? "Alap ár" : `+${selectedAnyagOssz?.price.toLocaleString("hu-HU")} Ft`}
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

                <div className="flex items-center justify-between border-b border-stroke pb-3 dark:border-stroke-dark">
                  <div>
                    <p className="font-medium text-black dark:text-white">
                      {selectedElofizetes?.name ?? "-"}
                    </p>
                    <p className="text-sm text-body">Előfizetés</p>
                  </div>
                  <p className="font-semibold text-black dark:text-white">
                    {selectedElofizetes
                      ? selectedElofizetes.price === 0
                        ? "0 Ft"
                        : `${selectedElofizetes.price.toLocaleString("hu-HU")} Ft`
                      : "-"}
                  </p>
                </div>

                <div className="border-b border-stroke pb-3 dark:border-stroke-dark">
                  <p className="mb-2 text-sm font-medium text-body">Szállítás</p>
                  <p className="font-medium text-black dark:text-white">
                    {selection.shippingMode === "foxpost" ? "Foxpost automata" : "Házhozszállítás"}
                  </p>
                  <p className="text-sm text-body">
                    Szállítási díj (ÁFA-mentes): {shippingFee.toLocaleString("hu-HU")} Ft
                  </p>

                  {selection.shippingMode === "hazhoz" && (
                    <p className="text-sm text-body">
                      Szállítási cím: {selection.shippingAddress.zip} {selection.shippingAddress.city}, {selection.shippingAddress.street} {selection.shippingAddress.houseNumber}
                      {selection.shippingAddress.stair ? `, ${selection.shippingAddress.stair}` : ""}
                      {selection.shippingAddress.floor ? `, ${selection.shippingAddress.floor}` : ""}
                      {selection.shippingAddress.door ? `, ${selection.shippingAddress.door}` : ""}
                    </p>
                  )}

                  {selection.shippingMode === "hazhoz" && !selection.billingSame && (
                    <p className="text-sm text-body">
                      Számlázási cím: {selection.billingAddress.zip} {selection.billingAddress.city}, {selection.billingAddress.street} {selection.billingAddress.houseNumber}
                      {selection.billingAddress.stair ? `, ${selection.billingAddress.stair}` : ""}
                      {selection.billingAddress.floor ? `, ${selection.billingAddress.floor}` : ""}
                      {selection.billingAddress.door ? `, ${selection.billingAddress.door}` : ""}
                    </p>
                  )}

                  {selection.shippingMode === "foxpost" && (
                    <>
                      <p className="text-sm text-body">
                        Számlázási cím: {selection.billingAddress.zip} {selection.billingAddress.city}, {selection.billingAddress.street} {selection.billingAddress.houseNumber}
                        {selection.billingAddress.stair ? `, ${selection.billingAddress.stair}` : ""}
                        {selection.billingAddress.floor ? `, ${selection.billingAddress.floor}` : ""}
                        {selection.billingAddress.door ? `, ${selection.billingAddress.door}` : ""}
                      </p>
                      {selection.foxpostAutomata && (
                        <div className="mt-1">
                          <p className="text-sm font-medium text-black dark:text-white">
                            Automata: {selection.foxpostAutomata.name}
                          </p>
                          <p className="text-xs text-body">
                            {selection.foxpostAutomata.zip} {selection.foxpostAutomata.city}, {selection.foxpostAutomata.address}
                          </p>
                          {selection.foxpostAutomata.findme && (
                            <p className="whitespace-pre-line text-xs text-body italic">
                              📍 {formatFoxpostFindme(selection.foxpostAutomata.findme)}
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="border-b border-stroke pb-3 dark:border-stroke-dark">
                  <p className="mb-2 text-sm font-medium text-body">Fizetés</p>
                  <p className="font-medium text-black dark:text-white">
                    {selection.paymentMode === "utalas" ? "Utalás" : "Stripe"}
                  </p>
                </div>

                <div className="space-y-2 border-t border-stroke pt-3 dark:border-stroke-dark">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-body">Nettó összeg:</p>
                    <p className="font-semibold text-black dark:text-white">
                      {subtotal.toLocaleString("hu-HU")} Ft
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-body">ÁFA ({VAT_PERCENT}%):</p>
                    <p className="font-semibold text-black dark:text-white">
                      {vatAmount.toLocaleString("hu-HU")} Ft
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-body">Szállítás (ÁFA-mentes):</p>
                    <p className="font-semibold text-black dark:text-white">
                      {shippingFee.toLocaleString("hu-HU")} Ft
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-body">Előfizetés (ÁFA-t tartalmaz):</p>
                    <p className="font-semibold text-black dark:text-white">
                      {subscriptionFee.toLocaleString("hu-HU")} Ft
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xl font-bold text-black dark:text-white">Bruttó összeg:</p>
                    <p className="text-2xl font-bold text-primary">
                      {total.toLocaleString("hu-HU")} Ft
                    </p>
                  </div>
                </div>
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
      case "mod":
        return "Válassz módot!";
      case "szenzor":
        return "Válassz szenzort!";
      case "anyag":
        return "Válassz anyagot!";
      case "doboz":
        return "Válassz dobozt!";
      case "szin":
        return "Válassz színt!";
      case "tapellatas":
        return "Akkumulátoros vagy vezetékes?";
      case "elofizetes":
        return "Válassz előfizetést!";
      case "szallitas":
        return "Add meg a szállítást!";
      case "fizetes":
        return "Válassz fizetési módot!";
      case "osszesites":
        return "Ellenőrizd a rendelésed!";
      default:
        return "";
    }
  };

  const selectedSzenzorNames = selection.szenzorok
    .map((id) => szenzorok.find((s) => s.id === id)?.name)
    .filter(Boolean) as string[];
  const selectedAnyagName = anyagok.find((a) => a.id === selection.anyag)?.name ?? "-";
  const selectedDobozName = dobozok.find((d) => d.id === selection.doboz)?.name ?? "-";
  const selectedTapName = tapellatasok.find((t) => t.id === selection.tapellatas)?.name ?? "-";
  const selectedElofizetesName = elofizetesek.find((e) => e.id === selection.elofizetes)?.name ?? "-";
  const selectedDobozSzinName = dobozSzinek.find((s) => s.id === selection.dobozSzin)?.name ?? "-";
  const selectedTetoSzinName = tetoSzinek.find((s) => s.id === selection.tetoSzin)?.name ?? "-";
  const shippingLabel = selection.shippingMode === "foxpost"
    ? "Foxpost automata"
    : selection.shippingMode === "hazhoz"
      ? "Házhozszállítás"
      : "-";
  const paymentLabel = selection.paymentMode === "utalas"
    ? "Utalás"
    : selection.paymentMode === "stripe"
      ? "Stripe"
      : "-";

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
              const isBlockedStep =
                isPresetLocked && (step.id === "szenzor" || step.id === "anyag");

              return (
                <React.Fragment key={step.id}>
                  <div
                    onClick={() => {
                      if (index < stepIndex && !isBlockedStep) {
                        setCurrentStep(step.id);
                      }
                    }}
                    className={`flex flex-col items-center ${
                      isBlockedStep
                        ? "cursor-not-allowed"
                        : index < stepIndex
                          ? "cursor-pointer"
                          : "cursor-default"
                    }`}
                  >
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

        {/* Lépés tartalma + oldalsó összegzés */}
        <div className="mb-10 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>{renderStepContent()}</div>
          <aside className="h-fit rounded-xl border-2 border-stroke bg-white p-5 dark:border-stroke-dark dark:bg-dark lg:sticky lg:top-24">
            <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">
              Folyamatkövető
            </h4>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium text-black dark:text-white">Mód</p>
                <p className="text-body">
                  {configMode === "preset"
                    ? `Preset: ${selectedPreset?.label ?? "-"}`
                    : configMode === "custom"
                      ? "Teljeskörű személyre szabás"
                      : "-"}
                </p>
              </div>
              <div>
                <p className="font-medium text-black dark:text-white">Szenzorok</p>
                {selectedSzenzorNames.length > 0 ? (
                  <ul className="mt-1 list-disc pl-5 text-body">
                    {selectedSzenzorNames.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-body">-</p>
                )}
              </div>
              <div>
                <p className="font-medium text-black dark:text-white">Burok anyaga</p>
                <p className="text-body">{selectedAnyagName}</p>
              </div>
              <div>
                <p className="font-medium text-black dark:text-white">Doboz</p>
                <p className="text-body">{selectedDobozName}</p>
                <p className="text-body">Színek: {selectedDobozSzinName} / {selectedTetoSzinName}</p>
              </div>
              <div>
                <p className="font-medium text-black dark:text-white">Tápellátás</p>
                <p className="text-body">{selectedTapName}</p>
              </div>
              <div>
                <p className="font-medium text-black dark:text-white">Előfizetés</p>
                <p className="text-body">{selectedElofizetesName}</p>
              </div>
              <div>
                <p className="font-medium text-black dark:text-white">Szállítás</p>
                <p className="text-body">{shippingLabel}</p>
              </div>
              <div>
                <p className="font-medium text-black dark:text-white">Fizetés</p>
                <p className="text-body">{paymentLabel}</p>
              </div>
              <div>
                <p className="font-medium text-black dark:text-white">Bruttó végösszeg</p>
                <p className="text-lg font-semibold text-primary">
                  {calculateGrandTotal().toLocaleString("hu-HU")} Ft
                </p>
              </div>
            </div>
          </aside>
        </div>

        {/* Navigációs gombok */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === "mod"}
            className={`rounded-lg px-6 py-3 font-medium transition-all ${
              currentStep === "mod"
                ? "cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-700"
                : "bg-gray-200 text-black hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            }`}
          >
            ← Vissza
          </button>

          {/* Aktuális ár */}
          <div className="text-center">
            <p className="text-sm text-body">Jelenlegi végösszeg:</p>
            <p className="text-2xl font-bold text-primary">
              {calculateGrandTotal().toLocaleString("hu-HU")} Ft
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
