"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import axios from "axios";
import { OrderPayload } from "@/types/order";
import FoxpostSelector, { FoxpostAutomataData } from "./FoxpostSelector";
import { validateShippingAddress, type AddressValidation } from "@/utils/validations";
import InfoIcon from "../ui/InfoIcon"; // tooltip icon for extra explanations

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
    name: "Bankkártyás fizetés",
    description: "Stripe",
  },
] as const;

const elofizetesek = [
  {
    id: "ingyenes",
    name: "Ingyenes",
    description:
      "✅ Valós idejű adatelérés \n ✅ Webes hozzáférés \n ✅ 30 napos adatmegőrzés \n ❌ hőmérséklet naplózás \n ❌ Illetéktelen hozzáférés elleni védelem \n ✅ 3 hónap pénzvisszafizetési garancia",
    price: 0,
  },
  {
    id: "havi",
    name: "Havi",
    description:
      "✅ Valós idejű adatelérés \n ✅ Webes hozzáférés \n ✅ 90 napos adatmegőrzés \n ✅ hőmérséklet naplózás \n ✅ Illetéktelen hozzáférés elleni védelem \n ✅ 3 hónap pénzvisszafizetési garancia",
    price: 1000,
  },
  {
    id: "eves",
    name: "Éves",
    description:
      "✅ Valós idejű adatelérés \n ✅ Webes hozzáférés \n ✅ 90 napos adatmegőrzés \n ✅ hőmérséklet naplózás \n ✅ Illetéktelen hozzáférés elleni védelem \n ✅ 3 hónap pénzvisszafizetési garancia",
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
// népszerű presetek: a hűtő, akvárium és irodai levegőminőség
interface PresetOption {
  id: string;
  label: string;
  description: string;
  infodescription: string; // hosszabb leírás a tooltiphez
  szenzorok: string[];
  anyagId: string;
  popular?: boolean;
}

const presetOptions: PresetOption[] = [
  // csak a kész csomagok latáthatók
  {
    id: "huto",
    label: "Hűtő",
    description: "Hő + páratartalom szenzor, normál burkolat",
    infodescription: "Élelmiszer és ital frissességének megőrzése",
    szenzorok: ["homerseklet", "paratartalom"],
    anyagId: "normal_burkolat",
    popular: true,
  },
  {
    id: "akvarium",
    label: "Akvárium",
    description: "Hő + O2 + CO2 szenzor, vízálló burkolat",
    infodescription: "Víz-paraméterek folyamatos monitorozása",
    szenzorok: ["homerseklet", "o2", "co2"],
    anyagId: "vizallo_burkolat",
    popular: true,
  },
];

type StepId =
  | "mod"
  | "szenzor"
  | "anyag"
  | "doboz"
  | "szin"
  | "tapellatas"
  | "elofizetes"
  | "szallitas"
  | "fizetes"
  | "osszesites";
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
  elofizetesekPerUnit: (string | null)[];
  quantity: number; // Megrendelt darabszám
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
  guestContact: {
    name: string;
    email: string;
    phone: string;
  };
}

type GuestContactErrors = {
  name?: string;
  email?: string;
  phone?: string;
};

const ProductConfigurator = () => {
  const { data: session } = useSession();
  const isGuestCheckout = !session?.user;
  const [currentStep, setCurrentStep] = useState<StepId>("mod");
  // default to preset mode with the first popular option selected
  const [configMode, setConfigMode] = useState<ConfigMode | null>("preset");
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>("huto");
  const [selection, setSelection] = useState<Selection>(() => ({
    szenzorok: [],
    anyag: null,
    doboz: null,
    dobozSzin: "",
    tetoSzin: "",
    tapellatas: null,
    elofizetes: null,
    elofizetesekPerUnit: [],
    quantity: 1,
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
    guestContact: {
      name: "",
      email: "",
      phone: "",
    },
  }));
  type Catalog = {
    szenzorok: typeof szenzorok;
    eszkozok: typeof eszkozok;
    dobozok: typeof dobozok;
    dobozSzinek: typeof dobozSzinek;
    tetoSzinek: typeof tetoSzinek;
    tapellatasok: typeof tapellatasok;
    elofizetesek: typeof elofizetesek;
    anyagok: typeof anyagok;
    presetOptions: typeof presetOptions;
    szallitasiArak: typeof SZALLITASI_ARAK;
    szallitasiModok: typeof szallitasiModok;
    fizetesiModok: typeof fizetesiModok;
  };

  const [catalog, setCatalog] = useState<Catalog>({
    szenzorok,
    eszkozok,
    dobozok,
    dobozSzinek,
    tetoSzinek,
    tapellatasok,
    elofizetesek,
    anyagok,
    presetOptions,
    szallitasiArak: SZALLITASI_ARAK,
    szallitasiModok,
    fizetesiModok,
  });

  const [shippingAddressErrors, setShippingAddressErrors] = useState<AddressValidation["errors"]>({});
  const [billingAddressErrors, setBillingAddressErrors] = useState<AddressValidation["errors"]>({});
  const [guestContactErrors, setGuestContactErrors] = useState<GuestContactErrors>({});

  const modelViewerRef = useRef<HTMLDivElement>(null);

  const isAkkus = selection.tapellatas === "akkus";
  const akkusDobozSzinek = dobozSzinek.filter(
    (szin) => szin.id === "feher" || szin.id === "fekete",
  );
  const akkusTetoSzinek = tetoSzinek.filter(
    (szin) => szin.id === "feher" || szin.id === "fekete",
  );

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const res = await fetch("/api/catalog");
        const data = await res.json();

        setCatalog((prev) => ({
          ...prev,
          szenzorok: (data.sensors ?? prev.szenzorok).map((it: any) => ({ ...it, id: String(it.id) })),
          dobozok: (data.boxes ?? prev.dobozok).map((it: any) => ({ ...it, id: String(it.id) })),
          dobozSzinek: (data.colors ?? []).filter((c: any) => c.kind === "box").map((it: any) => ({ ...it, id: String(it.id) })),
          tetoSzinek: (data.colors ?? []).filter((c: any) => c.kind === "top").map((it: any) => ({ ...it, id: String(it.id) })),
          tapellatasok: (data.powerOptions ?? prev.tapellatasok).map((it: any) => ({ ...it, id: String(it.id) })),
          elofizetesek: (data.subscriptions ?? prev.elofizetesek).map((it: any) => ({ ...it, id: String(it.id) })),
          anyagok: (data.materials ?? prev.anyagok).map((it: any) => ({ ...it, id: String(it.id) })),
          szallitasiArak: Object.fromEntries(
            (data.shippingPrices ?? []).map((p: any) => [String(p.id), p.price]),
          ) as typeof SZALLITASI_ARAK,
        }));
      } catch (err) {
        console.error("Catalog betöltése sikertelen:", err);
      }
    };

    loadCatalog();
  }, []);

  useEffect(() => {
    import("@google/model-viewer");
  }, []);

  useEffect(() => {
    if (!isAkkus) return;
    const allowed = new Set(["feher", "fekete"]);
    if (!allowed.has(selection.dobozSzin) || !allowed.has(selection.tetoSzin)) {
      setSelection((prev) => ({
        ...prev,
        dobozSzin: allowed.has(prev.dobozSzin) ? prev.dobozSzin : "feher",
        tetoSzin: allowed.has(prev.tetoSzin) ? prev.tetoSzin : "feher",
      }));
    }
  }, [isAkkus, selection.dobozSzin, selection.tetoSzin]);

  // when component mounts, if we already have a preset selected by default, apply
  useEffect(() => {
    if (configMode === "preset" && selectedPresetId) {
      applyPreset(selectedPresetId);
    }
    // we only want to run this once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync per-unit subscriptions when entering the summary step
  useEffect(() => {
    if (currentStep === "osszesites") {
      setSelection((prev) => {
        if (prev.elofizetesekPerUnit.length === prev.quantity) return prev;
        const perUnit = Array.from({ length: prev.quantity }, (_, i) =>
          i < prev.elofizetesekPerUnit.length
            ? prev.elofizetesekPerUnit[i]
            : prev.elofizetes,
        );
        return { ...prev, elofizetesekPerUnit: perUnit };
      });
    }
  }, [currentStep]);

  const getModelPath = (box: string, top: string) =>
    `/images/hero/${box}/${box}_${top}.glb`;
  const getAkkusModelPath = (box: string, top: string) =>
    `/images/hero/akkus/${box}/${box}_${top}.glb`;
  const modelSrc = isAkkus
    ? getAkkusModelPath(selection.dobozSzin, selection.tetoSzin)
    : getModelPath(selection.dobozSzin, selection.tetoSzin);

  const steps: { id: StepId; title: string; icon: string }[] = [
    { id: "mod", title: "Csomag", icon: "1" },
    { id: "tapellatas", title: "Tápellátás", icon: "2" },
    { id: "doboz", title: "Doboz", icon: "3" },
    { id: "szin", title: "Szín", icon: "4" },
    { id: "elofizetes", title: "Előfizetés", icon: "5" },
    { id: "szallitas", title: "Szállítás", icon: "6" },
    { id: "fizetes", title: "Fizetés", icon: "7" },
    { id: "osszesites", title: "Összesítés", icon: "✓" },
  ];

  const selectedPreset =
    presetOptions.find((preset) => preset.id === selectedPresetId) ?? null;
  const isPresetLocked = configMode === "preset" && Boolean(selectedPreset);
  const hiddenSteps = isPresetLocked
    ? new Set<StepId>(["szenzor", "anyag"])
    : null;
  const visibleSteps = steps.filter((step) => !hiddenSteps?.has(step.id));
  const maxSzenzorok =
    configMode === "preset"
      ? (selectedPreset?.szenzorok.length ?? MAX_SZENZOROK)
      : MAX_SZENZOROK;
  const visibleSzenzorok =
    isPresetLocked && selectedPreset
      ? catalog.szenzorok.filter((szenzor) =>
          selectedPreset.szenzorok.includes(
            // match by old_id slug when available, otherwise by id/string
            (szenzor as any).old_id ? (szenzor as any).old_id : String((szenzor as any).id),
          ),
        )
      : catalog.szenzorok;

  // Helper: match selection value against item's old_id (slug) or id
  const findBySelection = (list: readonly any[], sel: any) => {
    if (sel === null || sel === undefined) return undefined;
    return list.find((item) => {
      const oldId = (item as any).old_id;
      if (oldId != null && String(oldId) === String(sel)) return true;
      return String((item as any).id) === String(sel);
    });
  };
  const matchSelection = (item: any, sel: any) => {
    if (sel === null || sel === undefined) return false;
    const oldId = item?.old_id;
    if (oldId != null && String(oldId) === String(sel)) return true;
    return String(item?.id) === String(sel);
  };

  const calculateSubtotal = () => {
    let total = 0;
    // Több szenzor összege
    for (const szenzorId of selection.szenzorok) {
      const szenzor = findBySelection(catalog.szenzorok, szenzorId);
      if (szenzor) total += szenzor.price;
    }

    // Anyag (burok) ár
    if (selection.anyag) {
      const anyag = findBySelection(anyagok, selection.anyag);
      if (anyag) total += anyag.price;
    }
    if (selection.doboz) {
      const doboz = findBySelection(dobozok, selection.doboz);
      if (doboz) total += doboz.price;
    }
    if (selection.tapellatas) {
      const tap = findBySelection(tapellatasok, selection.tapellatas);
      if (tap) total += tap.price;
    }
    // Szorzunk a darabszámmal
    return total * selection.quantity;
  };

  const calculateSubscriptionFee = () => {
    if (selection.elofizetesekPerUnit.length > 0) {
      return selection.elofizetesekPerUnit.reduce((sum, id) => {
        if (!id) return sum;
        const plan = findBySelection(catalog.elofizetesek, id);
        return sum + (plan ? plan.price : 0);
      }, 0);
    }
    // Fallback before summary is reached
    if (!selection.elofizetes) return 0;
    const elofizetes = findBySelection(catalog.elofizetesek, selection.elofizetes);
    return elofizetes ? elofizetes.price * selection.quantity : 0;
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
        address.houseNumber.trim(),
    );

  const validateGuestContact = (contact: Selection["guestContact"]) => {
    const errors: GuestContactErrors = {};

    if (!contact.name.trim()) {
      errors.name = "A név megadása kötelező";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!contact.email.trim()) {
      errors.email = "Az email cím megadása kötelező";
    } else if (!emailRegex.test(contact.email.trim())) {
      errors.email = "Érvényes email címet adj meg";
    }

    const phoneDigits = contact.phone.replace(/\D/g, "");
    if (!contact.phone.trim()) {
      errors.phone = "A telefonszám megadása kötelező";
    } else if (phoneDigits.length < 9) {
      errors.phone = "Érvényes telefonszámot adj meg";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };

  const isShippingValid = () => {
    if (isGuestCheckout) {
      const guestValidation = validateGuestContact(selection.guestContact);
      if (!guestValidation.isValid) return false;
    }

    if (!selection.shippingMode) return false;

    if (selection.shippingMode === "foxpost") {
      if (!isAddressComplete(selection.billingAddress)) return false;
      const billingValidation = validateShippingAddress(selection.billingAddress);
      if (!billingValidation.isValid) return false;
      if (!selection.foxpostAutomata) return false;
      return true;
    }

    if (!isAddressComplete(selection.shippingAddress)) return false;
    const shippingValidation = validateShippingAddress(selection.shippingAddress);
    if (!shippingValidation.isValid) return false;

    if (!selection.billingSame && !isAddressComplete(selection.billingAddress)) return false;
    if (!selection.billingSame) {
      const billingValidation = validateShippingAddress(selection.billingAddress);
      if (!billingValidation.isValid) return false;
    }

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
    if (isGuestCheckout) {
      const guestValidation = validateGuestContact(selection.guestContact);
      setGuestContactErrors(guestValidation.errors);
      if (!guestValidation.isValid) {
        toast.error("Vendég rendeléshez add meg a nevet, email címet és telefonszámot!");
        return;
      }
    }

    // Kiválasztott szenzorok (több is lehet)
    const selectedSzenzorok = selection.szenzorok
      .map((id) => findBySelection(catalog.szenzorok, id))
      .filter(Boolean as any);

    const selectedAnyag = findBySelection(catalog.anyagok, selection.anyag);
    const selectedDoboz = findBySelection(catalog.dobozok, selection.doboz);
    const selectedTap = findBySelection(catalog.tapellatasok, selection.tapellatas);
    const selectedElofizetes =
      findBySelection(catalog.elofizetesek, selection.elofizetes) ??
      findBySelection(catalog.elofizetesek, "ingyenes") ??
      null;
    const selectedDobozSzin = findBySelection(catalog.dobozSzinek, selection.dobozSzin);
    const selectedTetoSzin = findBySelection(catalog.tetoSzinek, selection.tetoSzin);

    if (
      selectedSzenzorok.length === 0 ||
      !selectedAnyag ||
      !selectedDoboz ||
      !selectedTap
    ) {
      toast.error("Hiányzó termék választás!");
      return;
    }

    if (
      selection.elofizetesekPerUnit.length < selection.quantity ||
      selection.elofizetesekPerUnit.some((id) => !id)
    ) {
      toast.error("Minden eszközhöz kötelező előfizetést választani!");
      return;
    }

    if (!isShippingValid()) {
      // Set validation errors for display
      if (selection.shippingMode === "foxpost") {
        const billingVal = validateShippingAddress(selection.billingAddress);
        setBillingAddressErrors(billingVal.errors);
      } else if (selection.shippingMode === "hazhoz") {
        const shippingVal = validateShippingAddress(selection.shippingAddress);
        setShippingAddressErrors(shippingVal.errors);
        if (!selection.billingSame) {
          const billingVal = validateShippingAddress(selection.billingAddress);
          setBillingAddressErrors(billingVal.errors);
        }
      }
      if (isGuestCheckout) {
        const guestValidation = validateGuestContact(selection.guestContact);
        setGuestContactErrors(guestValidation.errors);
      }
      toast.error("Hiányzó vagy érvénytelen szállítási adatok!");
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

    const resolvedUserName = isGuestCheckout
      ? selection.guestContact.name.trim()
      : session?.user?.name || "Ismeretlen";
    const resolvedUserEmail = isGuestCheckout
      ? selection.guestContact.email.trim()
      : session?.user?.email || "";
    const resolvedUserPhone = isGuestCheckout
      ? selection.guestContact.phone.trim()
      : "";

    const orderPayload: OrderPayload = {
      userId: isGuestCheckout ? "guest" : ((session?.user as any)?.id || "unknown"),
      userEmail: resolvedUserEmail,
      userName: resolvedUserName,
      userPhone: resolvedUserPhone,

      szenzorok: selectedSzenzorok.map((sz) => ({
        id: sz!.id,
        name: sz!.name,
        price: sz!.price,
        quantity: selection.quantity,
      })),
      anyag: {
        id: selectedAnyag.id,
        name: selectedAnyag.name,
        price: selectedAnyag.price,
        quantity: selection.quantity,
      },
      doboz: {
        id: selectedDoboz.id,
        name: selectedDoboz.name,
        price: selectedDoboz.price,
        quantity: selection.quantity,
      },
      tapellatas: {
        id: selectedTap.id,
        name: selectedTap.name,
        price: selectedTap.price,
        quantity: selection.quantity,
      },
      elofizetes: selectedElofizetes
        ? {
            id: selectedElofizetes.id,
            name: selectedElofizetes.name,
            price: selectedElofizetes.price,
            quantity: selection.quantity,
          }
        : {
            id: "ingyenes",
            name: "Ingyenes",
            price: 0,
            quantity: selection.quantity,
          },

      elofizetesekPerUnit: selection.elofizetesekPerUnit.map((id) => {
        const plan = findBySelection(catalog.elofizetesek, id);
        return {
          id: String(plan?.id ?? "ingyenes"),
          name: plan?.name ?? "Ingyenes",
          price: plan?.price ?? 0,
          quantity: 1,
        };
      }),

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
        billingSame:
          selection.shippingMode === "hazhoz" ? selection.billingSame : true,
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
    const orderApiUrl =
      process.env.NEXT_PUBLIC_ORDER_API_URL_LOCAL || "/api/order";

    try {
      const { data } = await axios.post(orderApiUrl, orderPayload);

      if (data.url) {
        // Redirect to Stripe checkout or success page
        window.location.href = data.url;
      } else if (data.success) {
        // Sikeres rendelés - irányítás a sikeres oldalra
        toast.success("Rendelés sikeresen leadva!");
        window.location.href = "/vasarlas/sikeres";
      } else {
        toast.success(
          "Rendelés elküldve! Hamarosan felvesszük Önnel a kapcsolatot.",
        );
        console.log("Order response:", data);
      }
    } catch (error: any) {
      console.error("Rendelési hiba:", error);
      toast.error(
        error.response?.data?.error || "Hiba történt a rendelés során!",
      );
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
    value: string,
  ) => {
    setSelection((prev) => ({
      ...prev,
      [target]: {
        ...prev[target],
        [field]: value,
      },
    }));
  };

  const validateAddress = (
    target: "shippingAddress" | "billingAddress"
  ) => {
    const address = selection[target];
    const validation = validateShippingAddress(address);
    
    if (target === "shippingAddress") {
      setShippingAddressErrors(validation.errors);
    } else {
      setBillingAddressErrors(validation.errors);
    }
    
    return validation.isValid;
  };

  const renderAddressInput = (
    placeholder: string,
    value: string,
    field: keyof Selection["shippingAddress"],
    target: "shippingAddress" | "billingAddress",
    error?: string
  ) => (
    <div className="space-y-1">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(ev) => updateAddressField(target, field, ev.target.value)}
        className={`w-full rounded-lg border px-4 py-3 text-sm text-black outline-none focus:border-primary dark:bg-dark dark:text-white ${
          error
            ? "border-red-500 bg-red-50/10 dark:border-red-400"
            : "border-stroke bg-white focus:border-primary dark:border-stroke-dark"
        }`}
      />
      {error && (
        <p className="text-xs font-medium text-red-500">{error}</p>
      )}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case "mod":
        return (
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {presetOptions.map((preset) => {
                const isSelected = configMode === "preset" && selectedPresetId === preset.id;
                const isPopular = Boolean(preset.popular);
                let styleClass = "rounded-2xl border-2 p-6 text-left transition-all hover:shadow-lg ";

                if (isSelected) {
                styleClass += "border-primary bg-primary/10 dark:border-primary dark:bg-primary/5";
                } else {
                styleClass += "border-stroke dark:border-stroke-dark dark:bg-dark bg-white";
                 }

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset.id)}
                    className={styleClass}
                  >
                    <h4 className="mb-2 text-lg font-semibold text-black dark:text-white flex items-center">
                      <span>{preset.label}</span>
                      <InfoIcon
                        description={
                          preset.infodescription
                        }
                        position="right"
                        className="ml-2"
                      />
                      {preset.popular && (
                        <span className="ml-2 inline-block rounded bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5">
                          népszerű
                        </span>
                      )}
                    </h4>
                    <p className="text-body text-sm">{preset.description}</p>
                  </button>
                );
              })}
            </div>


          </div>
        );
      case "szenzor":
        return (
          <div>
            {configMode === "preset" && selectedPreset && (
              <p className="text-body mb-2 text-center text-sm">
                Előre beállított konfiguráció: {selectedPreset.label}
                {selectedPreset.popular && (
                  <span className="ml-1 inline-block rounded bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5">
                    népszerű
                  </span>
                )} (a
                szenzorok és a burkolat nem módosíthatók)
              </p>
            )}
            {configMode !== "preset" && (
              <p className="text-body mb-4 text-center text-sm">
                Válassz max. {maxSzenzorok} szenzort! (
                {selection.szenzorok.length}/{maxSzenzorok} kiválasztva)
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
                    onClick={
                      isPresetLocked
                        ? undefined
                        : () => toggleSzenzor(szenzor.id)
                    }
                    className={`rounded-xl border-2 p-4 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-stroke dark:border-stroke-dark dark:bg-dark bg-white"
                    } ${isPresetLocked ? "w-full max-w-[240px] cursor-not-allowed opacity-80" : "cursor-pointer hover:shadow-lg"}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-lg bg-slate-100 p-2 sm:h-24 sm:w-24 dark:bg-slate-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={szenzor.imageUrl}
                          alt={szenzor.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-md border-2 ${
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="h-4 w-4 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <h4 className="mb-1 text-base font-semibold text-black dark:text-white">
                      {szenzor.name}
                    </h4>
                    <p className="text-body mb-2 text-xs break-words">
                      {szenzor.description}
                    </p>
                    <p className="text-primary text-lg font-bold">
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
              <p className="text-body mb-4 text-center text-sm">
                A burkolat a(z) {selectedPreset.label} konfigurációhoz kötött,
                nem módosítható.
              </p>
            )}
            {!isPresetLocked && (
              <p className="text-body mb-4 text-center text-sm">
                Válaszd ki a burok anyagát! (PLACEHOLDER - árak és típusok
                később pontosítandók)
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
                ? anyagok.filter((anyag) => matchSelection(anyag, selection.anyag))
                : anyagok
              ).map((anyag) => (
                <div
                  key={anyag.id}
                  onClick={
                    isPresetLocked
                      ? undefined
                      : () => setSelection({ ...selection, anyag: anyag.id })
                  }
                  className={`rounded-xl border-2 p-6 transition-all ${
                    matchSelection(anyag, selection.anyag)
                      ? "border-primary bg-primary/10"
                      : "border-stroke dark:border-stroke-dark dark:bg-dark bg-white"
                  } ${isPresetLocked ? "w-full max-w-[320px] cursor-not-allowed opacity-80" : "cursor-pointer hover:shadow-lg"}`}
                >
                  <div className="mb-3 text-4xl">{anyag.icon}</div>
                  <h4 className="mb-2 text-lg font-semibold text-black dark:text-white">
                    {anyag.name}
                  </h4>
                  <p className="text-body mb-3 text-sm">{anyag.description}</p>
                  <p className="text-primary text-xl font-bold">
                    {anyag.price === 0
                      ? "Alap ár"
                      : `+${anyag.price.toLocaleString("hu-HU")} Ft`}
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
                    matchSelection(doboz, selection.doboz)
                      ? "border-primary bg-primary/10"
                      : "border-stroke dark:border-stroke-dark dark:bg-dark bg-white"
                }`}
              >
                <div className="mb-3 text-4xl">{doboz.icon}</div>
                <h4 className="mb-2 text-lg font-semibold text-black dark:text-white">
                  {doboz.name}
                </h4>
                <p className="text-body mb-3 text-sm">{doboz.description}</p>
                <p className="text-primary text-xl font-bold">
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
                {(isAkkus ? akkusDobozSzinek : dobozSzinek).map((szin) => (
                  <button
                    key={szin.id}
                    onClick={() =>
                      setSelection({ ...selection, dobozSzin: szin.id })
                    }
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
                {(isAkkus ? akkusTetoSzinek : tetoSzinek).map((szin) => (
                  <button
                    key={szin.id}
                    onClick={() =>
                      setSelection({ ...selection, tetoSzin: szin.id })
                    }
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
                  onClick={() =>
                    setSelection({ ...selection, tapellatas: tap.id })
                  }
                  className={`cursor-pointer rounded-xl border-2 p-6 transition-all hover:shadow-lg ${
                    selection.tapellatas === tap.id
                      ? "border-primary bg-primary/10"
                      : "border-stroke dark:border-stroke-dark dark:bg-dark bg-white"
                  }`}
                >
                  <div className="mb-3 text-4xl">{tap.icon}</div>
                  <h4 className="mb-2 text-lg font-semibold text-black dark:text-white">
                    {tap.name}
                  </h4>
                  <p className="text-body mb-3 text-sm">{tap.description}</p>
                  <p className="text-primary text-xl font-bold">
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
            <div className="grid grid-cols-1 gap-6 whitespace-pre-line md:grid-cols-3">
              {elofizetesek.map((plan) => (
                <button
                  type="button"
                  key={plan.id}
                  onClick={() =>
                    setSelection({ ...selection, elofizetes: plan.id })
                  }
                  className={`rounded-xl border-2 p-6 text-left transition-all hover:shadow-lg ${
                      matchSelection(plan, selection.elofizetes)
                        ? "border-primary bg-primary/10"
                        : "border-stroke dark:border-stroke-dark dark:bg-dark bg-white"
                    }`}
                >
                  <h4 className="mb-2 text-center text-lg font-semibold text-black dark:text-white">
                    {plan.name}
                  </h4>
                  <p className="text-body mb-3 text-sm">{plan.description}</p>
                  <p className="text-primary text-xl font-bold">
                    {plan.price === 0
                      ? "0 Ft"
                      : `${plan.price.toLocaleString("hu-HU")} Ft`}
                  </p>
                </button>
              ))}
            </div>
          </div>
        );

      case "szallitas":
        return (
          <div className="mx-auto max-w-4xl space-y-6">
            {isGuestCheckout && (
              <div className="border-stroke dark:border-stroke-dark dark:bg-dark space-y-4 rounded-xl border bg-white p-4">
                <p className="text-body text-sm font-medium">Személyes adatok (vendég rendelés)</p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1 md:col-span-2">
                    <input
                      type="text"
                      placeholder="Teljes név"
                      value={selection.guestContact.name}
                      onChange={(ev) => {
                        const value = ev.target.value;
                        setSelection((prev) => ({
                          ...prev,
                          guestContact: {
                            ...prev.guestContact,
                            name: value,
                          },
                        }));
                        setGuestContactErrors((prev) => ({ ...prev, name: undefined }));
                      }}
                      className={`w-full rounded-lg border px-4 py-3 text-sm text-black outline-none focus:border-primary dark:bg-dark dark:text-white ${
                        guestContactErrors.name
                          ? "border-red-500 bg-red-50/10 dark:border-red-400"
                          : "border-stroke bg-white dark:border-stroke-dark"
                      }`}
                    />
                    {guestContactErrors.name && (
                      <p className="text-xs font-medium text-red-500">{guestContactErrors.name}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <input
                      type="email"
                      placeholder="Email cím"
                      value={selection.guestContact.email}
                      onChange={(ev) => {
                        const value = ev.target.value;
                        setSelection((prev) => ({
                          ...prev,
                          guestContact: {
                            ...prev.guestContact,
                            email: value,
                          },
                        }));
                        setGuestContactErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      className={`w-full rounded-lg border px-4 py-3 text-sm text-black outline-none focus:border-primary dark:bg-dark dark:text-white ${
                        guestContactErrors.email
                          ? "border-red-500 bg-red-50/10 dark:border-red-400"
                          : "border-stroke bg-white dark:border-stroke-dark"
                      }`}
                    />
                    {guestContactErrors.email && (
                      <p className="text-xs font-medium text-red-500">{guestContactErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <input
                      type="tel"
                      placeholder="Telefonszám"
                      value={selection.guestContact.phone}
                      onChange={(ev) => {
                        const value = ev.target.value;
                        setSelection((prev) => ({
                          ...prev,
                          guestContact: {
                            ...prev.guestContact,
                            phone: value,
                          },
                        }));
                        setGuestContactErrors((prev) => ({ ...prev, phone: undefined }));
                      }}
                      className={`w-full rounded-lg border px-4 py-3 text-sm text-black outline-none focus:border-primary dark:bg-dark dark:text-white ${
                        guestContactErrors.phone
                          ? "border-red-500 bg-red-50/10 dark:border-red-400"
                          : "border-stroke bg-white dark:border-stroke-dark"
                      }`}
                    />
                    {guestContactErrors.phone && (
                      <p className="text-xs font-medium text-red-500">{guestContactErrors.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {szallitasiModok.map((mod) => (
                <button
                  type="button"
                  key={mod.id}
                  onClick={() => {
                    setSelection((prev) => ({
                      ...prev,
                      shippingMode: mod.id,
                      billingSame: mod.id === "hazhoz" ? prev.billingSame : true,
                    }));
                    setShippingAddressErrors({});
                    setBillingAddressErrors({});
                  }}
                  className={`rounded-xl border-2 p-5 text-left transition-all hover:shadow-lg ${
                    selection.shippingMode === mod.id
                      ? "border-primary bg-primary/10"
                      : "border-stroke dark:border-stroke-dark dark:bg-dark bg-white"
                  }`}
                >
                  <h4 className="mb-2 text-base font-semibold text-black dark:text-white">
                    {mod.name}
                  </h4>
                  <p className="text-body text-sm">{mod.description}</p>
                </button>
              ))}
            </div>

            {selection.shippingMode === "foxpost" && (
              <div className="space-y-4">
                <p className="text-body text-sm">
                  Foxpost automata esetén a cím a számlázási cím.
                </p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {renderAddressInput(
                    "Irányítószám",
                    selection.billingAddress.zip,
                    "zip",
                    "billingAddress",
                    billingAddressErrors.zip
                  )}
                  {renderAddressInput(
                    "Város",
                    selection.billingAddress.city,
                    "city",
                    "billingAddress",
                    billingAddressErrors.city
                  )}
                  {renderAddressInput(
                    "Utca",
                    selection.billingAddress.street,
                    "street",
                    "billingAddress",
                    billingAddressErrors.street
                  )}
                  {renderAddressInput(
                    "Házszám",
                    selection.billingAddress.houseNumber,
                    "houseNumber",
                    "billingAddress",
                    billingAddressErrors.houseNumber
                  )}
                  <input
                    type="text"
                    placeholder="Lépcsőház (opcionális)"
                    value={selection.billingAddress.stair}
                    onChange={(ev) =>
                      updateAddressField(
                        "billingAddress",
                        "stair",
                        ev.target.value,
                      )
                    }
                    className="border-stroke focus:border-primary dark:border-stroke-dark dark:bg-dark w-full rounded-lg border bg-white px-4 py-3 text-sm text-black outline-none dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Emelet (opcionális)"
                    value={selection.billingAddress.floor}
                    onChange={(ev) =>
                      updateAddressField(
                        "billingAddress",
                        "floor",
                        ev.target.value,
                      )
                    }
                    className="border-stroke focus:border-primary dark:border-stroke-dark dark:bg-dark w-full rounded-lg border bg-white px-4 py-3 text-sm text-black outline-none dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Ajtó (opcionális)"
                    value={selection.billingAddress.door}
                    onChange={(ev) =>
                      updateAddressField(
                        "billingAddress",
                        "door",
                        ev.target.value,
                      )
                    }
                    className="border-stroke focus:border-primary dark:border-stroke-dark dark:bg-dark w-full rounded-lg border bg-white px-4 py-3 text-sm text-black outline-none dark:text-white"
                  />
                </div>

                <div className="border-stroke dark:border-stroke-dark dark:bg-dark rounded-xl border bg-white p-4">
                  <p className="text-body mb-3 text-sm">
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
                <p className="text-body text-sm">Szállítási cím</p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {renderAddressInput(
                    "Irányítószám",
                    selection.shippingAddress.zip,
                    "zip",
                    "shippingAddress",
                    shippingAddressErrors.zip
                  )}
                  {renderAddressInput(
                    "Város",
                    selection.shippingAddress.city,
                    "city",
                    "shippingAddress",
                    shippingAddressErrors.city
                  )}
                  {renderAddressInput(
                    "Utca",
                    selection.shippingAddress.street,
                    "street",
                    "shippingAddress",
                    shippingAddressErrors.street
                  )}
                  {renderAddressInput(
                    "Házszám",
                    selection.shippingAddress.houseNumber,
                    "houseNumber",
                    "shippingAddress",
                    shippingAddressErrors.houseNumber
                  )}
                  <input
                    type="text"
                    placeholder="Lépcsőház (opcionális)"
                    value={selection.shippingAddress.stair}
                    onChange={(ev) =>
                      updateAddressField(
                        "shippingAddress",
                        "stair",
                        ev.target.value,
                      )
                    }
                    className="border-stroke focus:border-primary dark:border-stroke-dark dark:bg-dark w-full rounded-lg border bg-white px-4 py-3 text-sm text-black outline-none dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Emelet (opcionális)"
                    value={selection.shippingAddress.floor}
                    onChange={(ev) =>
                      updateAddressField(
                        "shippingAddress",
                        "floor",
                        ev.target.value,
                      )
                    }
                    className="border-stroke focus:border-primary dark:border-stroke-dark dark:bg-dark w-full rounded-lg border bg-white px-4 py-3 text-sm text-black outline-none dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Ajtó (opcionális)"
                    value={selection.shippingAddress.door}
                    onChange={(ev) =>
                      updateAddressField(
                        "shippingAddress",
                        "door",
                        ev.target.value,
                      )
                    }
                    className="border-stroke focus:border-primary dark:border-stroke-dark dark:bg-dark w-full rounded-lg border bg-white px-4 py-3 text-sm text-black outline-none dark:text-white"
                  />
                </div>

                <label className="text-body flex items-center gap-3 text-sm">
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
                    <p className="text-body text-sm">Számlázási cím</p>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <input
                        type="text"
                        placeholder="Irányítószám"
                        value={selection.billingAddress.zip}
                        onChange={(ev) =>
                          updateAddressField(
                            "billingAddress",
                            "zip",
                            ev.target.value,
                          )
                        }
                        className="border-stroke focus:border-primary dark:border-stroke-dark dark:bg-dark w-full rounded-lg border bg-white px-4 py-3 text-sm text-black outline-none dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Város"
                        value={selection.billingAddress.city}
                        onChange={(ev) =>
                          updateAddressField(
                            "billingAddress",
                            "city",
                            ev.target.value,
                          )
                        }
                        className="border-stroke focus:border-primary dark:border-stroke-dark dark:bg-dark w-full rounded-lg border bg-white px-4 py-3 text-sm text-black outline-none dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Utca"
                        value={selection.billingAddress.street}
                        onChange={(ev) =>
                          updateAddressField(
                            "billingAddress",
                            "street",
                            ev.target.value,
                          )
                        }
                        className="border-stroke focus:border-primary dark:border-stroke-dark dark:bg-dark w-full rounded-lg border bg-white px-4 py-3 text-sm text-black outline-none dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Házszám"
                        value={selection.billingAddress.houseNumber}
                        onChange={(ev) =>
                          updateAddressField(
                            "billingAddress",
                            "houseNumber",
                            ev.target.value,
                          )
                        }
                        className="border-stroke focus:border-primary dark:border-stroke-dark dark:bg-dark w-full rounded-lg border bg-white px-4 py-3 text-sm text-black outline-none dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Lépcsőház (opcionális)"
                        value={selection.billingAddress.stair}
                        onChange={(ev) =>
                          updateAddressField(
                            "billingAddress",
                            "stair",
                            ev.target.value,
                          )
                        }
                        className="border-stroke focus:border-primary dark:border-stroke-dark dark:bg-dark w-full rounded-lg border bg-white px-4 py-3 text-sm text-black outline-none dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Emelet (opcionális)"
                        value={selection.billingAddress.floor}
                        onChange={(ev) =>
                          updateAddressField(
                            "billingAddress",
                            "floor",
                            ev.target.value,
                          )
                        }
                        className="border-stroke focus:border-primary dark:border-stroke-dark dark:bg-dark w-full rounded-lg border bg-white px-4 py-3 text-sm text-black outline-none dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Ajtó (opcionális)"
                        value={selection.billingAddress.door}
                        onChange={(ev) =>
                          updateAddressField(
                            "billingAddress",
                            "door",
                            ev.target.value,
                          )
                        }
                        className="border-stroke focus:border-primary dark:border-stroke-dark dark:bg-dark w-full rounded-lg border bg-white px-4 py-3 text-sm text-black outline-none dark:text-white"
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
                  onClick={() =>
                    setSelection({
                      ...selection,
                      paymentMode: mod.id,
                    })
                  }
                  className={`rounded-xl border-2 p-6 text-left transition-all hover:shadow-lg ${
                    selection.paymentMode === mod.id
                      ? "border-primary bg-primary/10"
                      : "border-stroke dark:border-stroke-dark dark:bg-dark bg-white"
                  }`}
                >
                  <h4 className="mb-2 text-lg font-semibold text-black dark:text-white">
                    {mod.name}
                  </h4>
                  <p className="text-body text-sm">{mod.description}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case "osszesites":
        const selectedSzenzorokList = selection.szenzorok
          .map((id) => findBySelection(catalog.szenzorok, id))
          .filter(Boolean as any);
        const selectedAnyagOssz = findBySelection(anyagok, selection.anyag);
        const selectedDoboz = findBySelection(dobozok, selection.doboz);
        const selectedTap = findBySelection(tapellatasok, selection.tapellatas);
        const selectedElofizetes = findBySelection(elofizetesek, selection.elofizetes);
        const selectedDobozSzin = findBySelection(dobozSzinek, selection.dobozSzin);
        const selectedTetoSzin = findBySelection(tetoSzinek, selection.tetoSzin);
        const szenzorokTotal = selectedSzenzorokList.reduce(
          (sum, sz) => sum + (sz?.price || 0),
          0,
        );
        const subtotal = calculateSubtotal();
        const vatAmount = calculateVatAmount(subtotal);
        const shippingFee = getShippingFee();
        const subscriptionFee = calculateSubscriptionFee();
        const total = subtotal + vatAmount + shippingFee + subscriptionFee;

        return (
          <div className="mx-auto max-w-2xl">
            <div className="border-stroke dark:border-stroke-dark dark:bg-dark rounded-xl border-2 bg-white p-6">
              <h4 className="mb-6 text-center text-xl font-bold text-black dark:text-white">
                Rendelés összesítése
              </h4>

              <div className="space-y-4">
                {/* Szenzorok - több is lehet */}
                <div className="border-stroke dark:border-stroke-dark border-b pb-3">
                  <p className="text-body mb-2 text-sm font-medium">
                    Szenzorok ({selectedSzenzorokList.length} db)
                  </p>
                  {selectedSzenzorokList.map((sz) => (
                    <div
                      key={sz?.id}
                      className="flex items-center justify-between py-1"
                    >
                      <div className="flex items-center gap-2">
                        {sz?.imageUrl && (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={sz.imageUrl}
                              alt={sz.name}
                              className="h-6 w-6 object-contain"
                            />
                          </>
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
                    <p className="text-body text-sm">Szenzorok összesen:</p>
                    <p className="text-primary font-semibold">
                      {szenzorokTotal.toLocaleString("hu-HU")} Ft
                    </p>
                  </div>
                </div>

                {/* Anyag */}
                <div className="border-stroke dark:border-stroke-dark flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="font-medium text-black dark:text-white">
                      {selectedAnyagOssz?.icon} {selectedAnyagOssz?.name}
                    </p>
                    <p className="text-body text-sm">Burok anyaga</p>
                  </div>
                  <p className="font-semibold text-black dark:text-white">
                    {selectedAnyagOssz?.price === 0
                      ? "Alap ár"
                      : `+${selectedAnyagOssz?.price.toLocaleString("hu-HU")} Ft`}
                  </p>
                </div>

                <div className="border-stroke dark:border-stroke-dark flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="font-medium text-black dark:text-white">
                      {selectedDoboz?.icon} {selectedDoboz?.name}
                    </p>
                    <p className="text-body text-sm">
                      Doboz ({selectedDobozSzin?.name} /{" "}
                      {selectedTetoSzin?.name} tető)
                    </p>
                  </div>
                  <p className="font-semibold text-black dark:text-white">
                    {selectedDoboz?.price.toLocaleString("hu-HU")} Ft
                  </p>
                </div>

                <div className="border-stroke dark:border-stroke-dark flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="font-medium text-black dark:text-white">
                      {selectedTap?.icon} {selectedTap?.name}
                    </p>
                    <p className="text-body text-sm">Tápellátás</p>
                  </div>
                  <p className="font-semibold text-black dark:text-white">
                    {selectedTap?.price.toLocaleString("hu-HU")} Ft
                  </p>
                </div>

                <div className="border-stroke dark:border-stroke-dark border-b pb-3">
                  <p className="text-body mb-3 text-sm font-medium">Előfizetés eszközönként</p>
                  <div className="space-y-4">
                    {Array.from({ length: selection.quantity }, (_, i) => {
                      const unitEloId = selection.elofizetesekPerUnit[i] ?? null;
                      return (
                        <div key={i}>
                          <p className="mb-2 text-xs font-semibold text-black dark:text-white">
                            {i + 1}. eszköz
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {catalog.elofizetesek.map((plan) => {
                              const isSelected = matchSelection(plan, unitEloId);
                              return (
                                <button
                                  key={String(plan.id)}
                                  type="button"
                                  onClick={() => {
                                    setSelection((prev) => {
                                      const newPerUnit = [...prev.elofizetesekPerUnit];
                                      newPerUnit[i] = String(plan.id);
                                      return { ...prev, elofizetesekPerUnit: newPerUnit };
                                    });
                                  }}
                                  className={`rounded-lg border-2 px-3 py-1.5 text-xs font-medium transition-all ${
                                    isSelected
                                      ? "border-primary bg-primary/10 text-black dark:text-white"
                                      : "border-stroke dark:border-stroke-dark text-body hover:border-primary/50"
                                  }`}
                                >
                                  {plan.name}{" "}
                                  <span className="opacity-70">
                                    {plan.price === 0
                                      ? "(0 Ft)"
                                      : `(${plan.price.toLocaleString("hu-HU")} Ft)`}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                          {!unitEloId && (
                            <p className="mt-1 text-xs font-medium text-red-500">Kötelező!</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-dashed border-gray-300 pt-2 dark:border-gray-600">
                    <p className="text-body text-sm">Előfizetési díj összesen:</p>
                    <p className="text-primary font-semibold">
                      {calculateSubscriptionFee().toLocaleString("hu-HU")} Ft
                    </p>
                  </div>
                </div>

                {/* Darabszám */}
                <div className="border-stroke dark:border-stroke-dark border-b pb-3">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-black dark:text-white">
                      Darabszám (db)
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          setSelection((prev) => {
                            const newQty = Math.max(1, prev.quantity - 1);
                            return {
                              ...prev,
                              quantity: newQty,
                              elofizetesekPerUnit: prev.elofizetesekPerUnit.slice(0, newQty),
                            };
                          })
                        }
                        className="dark:bg-dark rounded border border-gray-300 bg-white px-3 py-2 text-black hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="999"
                        value={selection.quantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value >= 1 && value <= 999) {
                            setSelection((prev) => {
                              const perUnit = Array.from({ length: value }, (_, i) =>
                                i < prev.elofizetesekPerUnit.length
                                  ? prev.elofizetesekPerUnit[i]
                                  : prev.elofizetes,
                              );
                              return { ...prev, quantity: value, elofizetesekPerUnit: perUnit };
                            });
                          }
                        }}
                        className="dark:bg-dark w-20 rounded border border-gray-300 bg-white px-3 py-2 text-center text-black placeholder-gray-400 dark:border-gray-600 dark:text-white"
                      />
                      <button
                        onClick={() =>
                          setSelection((prev) => {
                            const newQty = Math.min(999, prev.quantity + 1);
                            return {
                              ...prev,
                              quantity: newQty,
                              elofizetesekPerUnit: [...prev.elofizetesekPerUnit, prev.elofizetes],
                            };
                          })
                        }
                        className="dark:bg-dark rounded border border-gray-300 bg-white px-3 py-2 text-black hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-stroke dark:border-stroke-dark border-b pb-3">
                  <p className="text-body mb-2 text-sm font-medium">
                    Szállítás
                  </p>
                  <p className="font-medium text-black dark:text-white">
                    {selection.shippingMode === "foxpost"
                      ? "Foxpost automata"
                      : "Házhozszállítás"}
                  </p>
                  <p className="text-body text-sm">
                    Szállítási díj (ÁFA-mentes):{" "}
                    {shippingFee.toLocaleString("hu-HU")} Ft
                  </p>

                  {selection.shippingMode === "hazhoz" && (
                    <p className="text-body text-sm">
                      Szállítási cím: {selection.shippingAddress.zip}{" "}
                      {selection.shippingAddress.city},{" "}
                      {selection.shippingAddress.street}{" "}
                      {selection.shippingAddress.houseNumber}
                      {selection.shippingAddress.stair
                        ? `, ${selection.shippingAddress.stair}`
                        : ""}
                      {selection.shippingAddress.floor
                        ? `, ${selection.shippingAddress.floor}`
                        : ""}
                      {selection.shippingAddress.door
                        ? `, ${selection.shippingAddress.door}`
                        : ""}
                    </p>
                  )}

                  {selection.shippingMode === "hazhoz" &&
                    !selection.billingSame && (
                      <p className="text-body text-sm">
                        Számlázási cím: {selection.billingAddress.zip}{" "}
                        {selection.billingAddress.city},{" "}
                        {selection.billingAddress.street}{" "}
                        {selection.billingAddress.houseNumber}
                        {selection.billingAddress.stair
                          ? `, ${selection.billingAddress.stair}`
                          : ""}
                        {selection.billingAddress.floor
                          ? `, ${selection.billingAddress.floor}`
                          : ""}
                        {selection.billingAddress.door
                          ? `, ${selection.billingAddress.door}`
                          : ""}
                      </p>
                    )}

                  {selection.shippingMode === "foxpost" && (
                    <>
                      <p className="text-body text-sm">
                        Számlázási cím: {selection.billingAddress.zip}{" "}
                        {selection.billingAddress.city},{" "}
                        {selection.billingAddress.street}{" "}
                        {selection.billingAddress.houseNumber}
                        {selection.billingAddress.stair
                          ? `, ${selection.billingAddress.stair}`
                          : ""}
                        {selection.billingAddress.floor
                          ? `, ${selection.billingAddress.floor}`
                          : ""}
                        {selection.billingAddress.door
                          ? `, ${selection.billingAddress.door}`
                          : ""}
                      </p>
                      {selection.foxpostAutomata && (
                        <div className="mt-1">
                          <p className="text-sm font-medium text-black dark:text-white">
                            Automata: {selection.foxpostAutomata.name}
                          </p>
                          <p className="text-body text-xs">
                            {selection.foxpostAutomata.zip}{" "}
                            {selection.foxpostAutomata.city},{" "}
                            {selection.foxpostAutomata.address}
                          </p>
                          {selection.foxpostAutomata.findme && (
                            <p className="text-body text-xs whitespace-pre-line italic">
                              📍{" "}
                              {formatFoxpostFindme(
                                selection.foxpostAutomata.findme,
                              )}
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="border-stroke dark:border-stroke-dark border-b pb-3">
                  <p className="text-body mb-2 text-sm font-medium">Fizetés</p>
                  <p className="font-medium text-black dark:text-white">
                    {selection.paymentMode === "utalas" ? "Utalás" : "Stripe"}
                  </p>
                </div>

                <div className="border-stroke dark:border-stroke-dark space-y-2 border-t pt-3">
                  <div className="flex items-center justify-between">
                    <p className="text-body text-sm">Nettó összeg:</p>
                    <p className="font-semibold text-black dark:text-white">
                      {subtotal.toLocaleString("hu-HU")} Ft
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-body text-sm">ÁFA ({VAT_PERCENT}%):</p>
                    <p className="font-semibold text-black dark:text-white">
                      {vatAmount.toLocaleString("hu-HU")} Ft
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-body text-sm">Szállítás (ÁFA-mentes):</p>
                    <p className="font-semibold text-black dark:text-white">
                      {shippingFee.toLocaleString("hu-HU")} Ft
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-body text-sm">
                      Előfizetés (ÁFA-t tartalmaz):
                    </p>
                    <p className="font-semibold text-black dark:text-white">
                      {subscriptionFee.toLocaleString("hu-HU")} Ft
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xl font-bold text-black dark:text-white">
                      Bruttó összeg:
                    </p>
                    <p className="text-primary text-2xl font-bold">
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
        return "Válassz csomagot!";
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
    .map((id) => findBySelection(catalog.szenzorok, id)?.name)
    .filter(Boolean) as string[];

  const selectedAnyagName =
    anyagok.find((a) => matchSelection(a, selection.anyag))?.name ?? "-";
  const selectedDobozName = findBySelection(dobozok, selection.doboz)?.name ?? "-";
  const selectedTapName = findBySelection(tapellatasok, selection.tapellatas)?.name ?? "-";
  const selectedElofizetesName = findBySelection(elofizetesek, selection.elofizetes)?.name ?? "-";
  const selectedDobozSzinName = findBySelection(dobozSzinek, selection.dobozSzin)?.name ?? "-";
  const selectedTetoSzinName = findBySelection(tetoSzinek, selection.tetoSzin)?.name ?? "-";
  const shippingLabel =
    selection.shippingMode === "foxpost"
      ? "Foxpost automata"
      : selection.shippingMode === "hazhoz"
        ? "Házhozszállítás"
        : "-";
  const paymentLabel =
    selection.paymentMode === "utalas"
      ? "Utalás"
      : selection.paymentMode === "stripe"
        ? "Stripe"
        : "-";

  return (
    <section className="relative z-10">
      <div className="container">
        {/* Fejléc */}
        <div
          className="wow fadeInUp mx-auto mb-10 max-w-[690px] text-center"
          data-wow-delay=".2s"
        >
          <h2 className="mb-4 text-3xl font-bold text-black sm:text-4xl md:text-[44px] md:leading-tight dark:text-white">
            Termék konfigurátor
          </h2>
          <p className="text-body text-base">
            Állítsd össze a saját szenzor csomagodat lépésről lépésre!
          </p>
        </div>

        {/* Lépés indikátor */}
        <div className="mb-10">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            {visibleSteps.map((step, index) => {
              const stepIndex = visibleSteps.findIndex((s) => s.id === currentStep);
              const isActive = step.id === currentStep;
              const isCompleted = index < stepIndex;

              return (
                <React.Fragment key={step.id}>
                  <div
                    onClick={() => {
                      if (index < stepIndex) {
                        setCurrentStep(step.id);
                      }
                    }}
                    className={`flex flex-col items-center ${
                      index < stepIndex
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
                  {index < visibleSteps.length - 1 && (
                    <div
                      className={`mx-2 h-1 flex-1 rounded ${
                        index < stepIndex
                          ? "bg-green-500"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>


        {/* Navigációs fejléc: Vissza - Cím - Tovább */}
<div className="mb-10 flex items-center justify-between gap-4">
  
  <div className="flex-1">
    <button
      onClick={prevStep}
      disabled={currentStep === "mod"}
      className={`rounded-lg px-6 py-3 font-medium transition-all ${
        currentStep === "mod"
          ? "invisible" 
          : "bg-gray-200 text-black hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
      }`}
    >
      ← Vissza
    </button>
  </div>

  <h3 className="shrink-0 text-center text-xl font-semibold text-black sm:text-2xl dark:text-white">
    {getStepTitle()}
  </h3>

  <div className="flex-1 text-right">
    {currentStep !== "osszesites" ? (
      <button
        onClick={nextStep}
        disabled={!canProceed()}
        className={`rounded-lg px-6 py-3 font-medium transition-all ${
          canProceed()
            ? "bg-primary hover:bg-primary/90 text-white"
            : "cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-700"
        }`}
      >
        Tovább →
      </button>
    ) : (
      <div className="inline-block px-6 py-3" />
    )}
  </div>
</div>
        

        {/* Lépés tartalma + oldalsó összegzés */}
        <div className="mb-10 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>{renderStepContent()}</div>
          <aside className="border-stroke dark:border-stroke-dark dark:bg-dark h-fit rounded-xl border-2 bg-white p-5 lg:sticky lg:top-24">
            {/* <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">
              Folyamatkövető
            </h4> */}
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium text-black dark:text-white">Csomag</p>
                <p className="text-body">
                  {selectedPreset?.label ?? "-"}
                </p>
              </div>
              <div>
                <p className="font-medium text-black dark:text-white">
                  Szenzorok
                </p>
                {selectedSzenzorNames.length > 0 ? (
                  <ul className="text-body mt-1 list-disc pl-5">
                    {selectedSzenzorNames.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-body">-</p>
                )}
              </div>
              <div>
                <p className="font-medium text-black dark:text-white">
                  Burok anyaga
                </p>
                <p className="text-body">{selectedAnyagName}</p>
              </div>
              <div>
                <p className="font-medium text-black dark:text-white">Doboz</p>
                <p className="text-body">{selectedDobozName}</p>
                <p className="text-body">
                  Színek: {selectedDobozSzinName} / {selectedTetoSzinName}
                </p>
              </div>
              <div>
                <p className="font-medium text-black dark:text-white">
                  Tápellátás
                </p>
                <p className="text-body">{selectedTapName}</p>
              </div>
              <div>
                <p className="font-medium text-black dark:text-white">
                  Előfizetés
                </p>
                <p className="text-body">{selectedElofizetesName}</p>
              </div>
              <div>
                <p className="font-medium text-black dark:text-white">
                  Szállítás
                </p>
                <p className="text-body">{shippingLabel}</p>
              </div>
              <div>
                <p className="font-medium text-black dark:text-white">
                  Fizetés
                </p>
                <p className="text-body">{paymentLabel}</p>
              </div>
              <div>
                <p className="font-medium text-black dark:text-white">
                  Bruttó végösszeg
                </p>
                <p className="text-primary text-lg font-semibold">
                  {calculateGrandTotal().toLocaleString("hu-HU")} Ft
                </p>
                <p className="text-[13px] text-gray-500 dark:text-gray-400 italic">
                Az ár tartalmazza a 27% ÁFA-t.
            </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default ProductConfigurator;
