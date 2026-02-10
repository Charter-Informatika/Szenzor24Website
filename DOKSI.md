# Rendelés Funkció Dokumentáció

**Utolsó frissítés:** 2026. február 10.  
**Branch:** `dev_style`  
**Státusz:** Frontend kész ✅ | Backend integráció TODO ⏳

---

## 📋 Tartalomjegyzék

1. [Összefoglaló](#összefoglaló)
2. [Frontend - Jelenlegi állapot](#frontend---jelenlegi-állapot)
3. [Rendelési folyamat](#rendelési-folyamat)
4. [JSON struktúra](#json-struktúra)
5. [Backend teendők](#backend-teendők)
6. [API dokumentáció](#api-dokumentáció)
7. [Adatbázis séma](#adatbázis-séma)
8. [Stripe integráció](#stripe-integráció)
9. [Foxpost integráció](#foxpost-integráció)
10. [Tesztelési checklist](#tesztelési-checklist)

---

## Összefoglaló

A rendelés funkció lehetővé teszi a felhasználók számára, hogy egyedi szenzor-csomagot állítsanak össze:
- Custom módban maximum 2 szenzor kiválasztása
- 16 db előre beállított konfiguráció (preset) közül választhat a felhasználó
- Előre beállított konfiguráció esetén a konfigurációhoz tartozó szenzor-szám érvényes (1–3 szenzor)
- Előre beállított konfiguráció csak szenzorokat és burkot állít be; tápellátás, doboz, szín, előfizetés továbbra is választandók
- Előre beállított konfiguráció választásakor a Szenzor és Anyag lépések automatikusan átugrásra kerülnek (a progress bar-on zölden/kész-ként jelennek meg)
- A preset-zárolt lépések nem kattinthatók (cursor-not-allowed)
- Burok anyag típus választás (Normál, Vízálló, PLA, UV álló PLA, ABS, PETG)
- Doboz típus választás
- Doboz és tető szín választás (3D előnézettel)
- Tápellátás típus választás (vezetékes v. akkus)
- Előfizetés választás (Ingyenes / Havi / Éves)
- Fizetési mód kiválasztás
- Automatikus ár kalkuláció ÁFA-val (előfizetés bruttóként, ÁFA nélkül kezelve)

**Jelenlegi állapot:** A frontend teljesen működőképes, a rendelés JSON formátumban elkészül és elküldésre kerül a `NEXT_PUBLIC_ORDER_API_URL` végpontra (rendszer.szenzor24.hu backend). Az email-t a szenzor24.hu API még elküldi a megrendelőnek.

---

## Frontend - Jelenlegi állapot

### Elérési út
- **URL:** `/vasarlas`
- **Komponens:** `src/components/Vasarlas/ProductConfigurator.tsx`
- **API route:** `NEXT_PUBLIC_ORDER_API_URL`

### Belépési pont
A rendelés oldalra a főoldali "Rendelés" CTA-val és a fejléc menüponttal lehet eljutni:
- **Fájl:** `src/components/HeroArea/index.tsx`
- **CTA:** "Rendelés" → navigál a `/vasarlas` oldalra
- **Fájl:** `src/components/Header/index.tsx`
- **Menü:** "Rendelés" → navigál a `/vasarlas` oldalra

### Autentikáció
- ⚠️ **Bejelentkezés kötelező** a rendeléshez
- Ha nincs bejelentkezve → átirányítás `/auth/signin?callbackUrl=/vasarlas`
- Sikeres bejelentkezés után visszakerül a `/vasarlas` oldalra

### 10 lépéses konfigurátor

| Lépés | Ikon | Név | StepId | Leírás |
|-------|------|-----|--------|--------|
| 1 | 1 | Mód | `mod` | Előre beállított konfiguráció (preset kártyák) vagy Teljeskörű személyre szabás |
| 2 | 2 | Szenzor | `szenzor` | Custom: max 2 szenzor; preset: átugorva (zöld/kész) |
| 3 | 3 | Anyag | `anyag` | Burok anyag típusa; preset: átugorva (zöld/kész) |
| 4 | 4 | Tápellátás | `tapellatas` | Akkumulátoros/Vezetékes |
| 5 | 5 | Doboz | `doboz` | Doboz típus (műanyag/fém/rozsdamentes) |
| 6 | 6 | Szín | `szin` | Doboz szín + tető szín (3D előnézet) |
| 7 | 7 | Előfizetés | `elofizetes` | Ingyenes / Havi / Éves |
| 8 | 8 | Szállítás | `szallitas` | Szállítási mód + cím megadása |
| 9 | 9 | Fizetés | `fizetes` | Fizetési mód kiválasztása |
| 10 | ✓ | Összesítés | `osszesites` | Végleges rendelés áttekintés + "Megrendelés" gomb |

### UI/UX jellemzők

- **Mód lépés**: 16 preset kártya 2 oszlopos grid-ben + alul középre igazított "Teljeskörű személyre szabás" gomb
- **Preset mód**: Szenzor és Anyag lépések átugrásra kerülnek (nem navigálható), de a progress bar-on zölden/kész-ként megjelennek
- **Progress bar**: Kattintható visszafelé navigációhoz (csak a már meglátogatott lépésekre); preset-zárolt lépések `cursor-not-allowed` stílusúak és nem kattinthatók
- **Folyamatkövető**: Jobb oldali sidebar panel mutatja az összes aktuális kiválasztást valós időben
- **Összesítés lépés**: Nettó, ÁFA, szállítás, előfizetés (ÁFA-t tartalmaz) sorok + "Bruttó összeg" végösszeg megjelenítés

### Elérhető opciók

#### Szenzorok (custom max 2, konfiguráció limit érvényes)
| ID | Név | Leírás | Ár |
|----|-----|--------|-----|
| `htu21d` | HTU21D | Hőmérséklet és páratartalom szenzor | 5 000 Ft |
| `mpu6050` | MPU-6050 | 6 tengelyes gyorsulásmérő és giroszkóp | 6 000 Ft |
| `gaz` | Gáz szenzor | Általános gáz érzékelő | 7 000 Ft |
| `homerseklet` | Hőmérséklet szenzor | Precíz hőmérséklet mérés | 4 500 Ft |
| `paratartalom` | Páratartalom szenzor | Páratartalom mérés | 4 500 Ft |
| `feny` | Fény szenzor | Fényerősség mérő szenzor | 4 000 Ft |
| `hidrogen` | Hidrogén szenzor | Hidrogén gáz érzékelő | 8 000 Ft |
| `metan` | Metán szenzor | Metán gáz érzékelő | 7 500 Ft |
| `sensorion` | SENSORION | SENSORION precíziós hőmérséklet szenzor | 9 000 Ft |
| `o2` | O2 szenzor | Oldott oxigén mérés | 8 000 Ft |
| `co2` | CO2 szenzor | CO2 szint mérés | 8 500 Ft |

Megjegyzés: az új szenzorok és burkolatok árai jelenleg PLACEHOLDER értékek.

#### Burok anyag típusok (PLACEHOLDER - árak később pontosítandók)
| ID | Név | Leírás | Ár |
|----|-----|--------|-----|
| `normal_burkolat` | Normál burkolat | Alap burkolat | Alap ár (0 Ft) |
| `vizallo_burkolat` | Vízálló burkolat | Nedves környezethez | +2 500 Ft |
| `sima_pla` | Sima PLA | Alap PLA anyag, beltéri használatra | Alap ár (0 Ft) |
| `uv_allo_pla` | UV álló PLA | UV sugárzásnak ellenálló, kültéri használatra | +1 500 Ft |
| `abs` | ABS | Hőálló, ütésálló műanyag | +2 000 Ft |
| `petg` | PETG | Vegyszerálló, erős és rugalmas | +2 500 Ft |

#### Doboz típusok
| ID | Név | Leírás | Ár |
|----|-----|--------|-----|
| `muanyag` | Műanyag doboz | IP54 védettség, beltéri használatra | 2 000 Ft |
| `fem` | Fém doboz | IP65 védettség, kültéri/ipari használatra | 4 500 Ft |
| `rozsdamentes` | Rozsdamentes doboz | IP67 védettség, élelmiszeripari felhasználásra | 8 000 Ft |

#### Doboz színek
| ID | Név | HEX |
|----|-----|-----|
| `zold` | Zöld | #22c55e |
| `feher` | Fehér | #f9fafb |
| `sarga` | Sárga | #eab308 |
| `piros` | Piros | #ef4444 |
| `kek` | Kék | #3b82f6 |
| `fekete` | Fekete | #1f2937 |

#### Tető színek
| ID | Név | HEX |
|----|-----|-----|
| `feher` | Fehér | #f9fafb |
| `sarga` | Sárga | #eab308 |
| `kek` | Kék | #3b82f6 |
| `zold` | Zöld | #22c55e |
| `piros` | Piros | #ef4444 |
| `fekete` | Fekete | #1f2937 |

#### Tápellátás
| ID | Név | Leírás | Ár |
|----|-----|--------|-----|
| `akkus` | Akkumulátoros | Beépített Li-Ion akku, ~6 hónap üzemidő | 5 000 Ft |
| `vezetekes` | Vezetékes | 230V AC adapter, folyamatos üzem | 2 500 Ft |

#### Szállítási módok
| ID | Név | Leírás |
|----|-----|--------|
| `foxpost` | Foxpost automata | Csomagautomata átvétel |
| `hazhoz` | Házhozszállítás | Kézbesítés a megadott címre |

Megjegyzés: Foxpost esetén a címmezők a számlázási címet jelentik. Házhozszállításnál választható, hogy a számlázási cím megegyezik-e a szállítási címmel.

#### Fizetési módok
| ID | Név | Leírás |
|----|-----|--------|
| `utalas` | Utalás | Díjbekérő / előre utalás |
| `stripe` | Stripe | Bankkártyás fizetés |

#### Előre beállított konfigurációk (16 db)
| ID | Név | Szenzorok | Burok anyag |
|----|-----|-----------|-------------|
| `huto` | Hűtő | Hő + páratartalom | Normál burkolat (`normal_burkolat`) |
| `akvarium` | Akvárium | Hő + O2 + CO2 | Vízálló burkolat (`vizallo_burkolat`) |
| `hutokamra` | Hűtőkamra | SENSORION + páratartalom | Normál burkolat (`normal_burkolat`) |
| `hideglanc_monitor` | Hideglánc monitor | SENSORION + MPU-6050 | PETG (`petg`) |
| `gyogyszertarolo` | Gyógyszertároló | SENSORION + páratartalom | ABS (`abs`) |
| `raktar_kornyezetfigyelo` | Raktár környezetfigyelő | HTU21D + MPU-6050 | PETG (`petg`) |
| `server_szoba_monitor` | Server szoba monitor | SENSORION + CO2 | ABS (`abs`) |
| `iroda_levegominoseg` | Iroda levegőminőség | CO2 + HTU21D | Sima PLA (`sima_pla`) |
| `tanterem_levegofigyelo` | Tanterem levegőfigyelő | CO2 + hőmérséklet | Sima PLA (`sima_pla`) |
| `kazan_biztonsag` | Kazánház biztonság | Gáz + O2 | ABS (`abs`) |
| `garazs_gazfigyelo` | Garázs gázfigyelő | Gáz + CO2 | PETG (`petg`) |
| `akku_tolto_helyiseg` | Akkumulátor töltő helyiség | Hidrogén + hőmérséklet | ABS (`abs`) |
| `allattarto_telep` | Állattartó telep levegőfigyelő | Metán + CO2 + O2 | Vízálló burkolat (`vizallo_burkolat`) |
| `logisztikai_csomagfigyelo` | Logisztikai csomagfigyelő | MPU-6050 + hőmérséklet | PETG (`petg`) |
| `szallitasi_sokkfigyelo` | Szállítási sokkfigyelő | MPU-6050 | PETG (`petg`) |
| `tarolo_kontener` | Tároló konténer monitor | Hőmérséklet + MPU-6050 | PETG (`petg`) |

Megjegyzés: előre beállított konfiguráció módban a szenzorok és a burkolat nem módosíthatók, a Szenzor és Anyag lépések automatikusan kihagyásra kerülnek (a progress bar-on zöld pipa jelöli őket).

#### Előfizetés opciók
| ID | Név | Leírás | Ár (bruttó, ÁFA-t tartalmaz) |
|----|-----|--------|------|
| `ingyenes` | Ingyenes | Alap csomag | 0 Ft |
| `havi` | Havi | Havi előfizetés | 1 000 Ft |
| `eves` | Éves | Éves előfizetés | 10 000 Ft |

Megjegyzés: az előfizetés díja **bruttó összeg** (ÁFA-t tartalmaz), nem kerül bele az ÁFA alapba, és a bruttó végösszeghez külön sorként adódik hozzá.

### 3D Előnézet
- **Technológia:** Google Model Viewer (`@google/model-viewer`)
- **GLB fájlok helye:** `/public/images/hero/{doboz_szin}/{doboz_szin}_{teto_szin}.glb`
- **Példa:** sárga doboz + kék tető → `/images/hero/sarga/sarga_kek.glb`
- **Összes kombináció:** 6 × 6 = 36 GLB fájl

---

## Rendelési folyamat

```
┌─────────────────────────────────────────────────────────────────┐
│                     FELHASZNÁLÓI FOLYAMAT                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Főoldal "Rendelés" gomb                                     │
│           │                                                      │
│           ▼                                                      │
│  2. Bejelentkezés ellenőrzés                                    │
│           │                                                      │
│     ┌─────┴─────┐                                               │
│     │           │                                                │
│  Nincs       Van session                                         │
│     │           │                                                │
│     ▼           ▼                                                │
│  /auth/signin   /vasarlas                                        │
│     │           │                                                │
│     └─────┬─────┘                                               │
│           ▼                                                      │
│  3. Mód választás (Preset kártya / Teljeskörű)                  │
│           │                                                      │
│     ┌─────┴─────┐                                               │
│     │           │                                                │
│  Preset      Custom                                              │
│     │           │                                                │
│     │           ▼                                                │
│     │    4. Szenzor választás (max 2)                            │
│     │           │                                                │
│     │           ▼                                                │
│     │    5. Anyag választás                                      │
│     │           │                                                │
│     └─────┬─────┘  (preset: 4-5 átugorva, zölden jelölve)      │
│           ▼                                                      │
│  6. Tápellátás választás                                        │
│           │                                                      │
│           ▼                                                      │
│  7. Doboz típus választás                                       │
│           │                                                      │
│           ▼                                                      │
│  8. Szín választás (3D előnézet)                                │
│           │                                                      │
│           ▼                                                      │
│  9. Előfizetés választás (Ingyenes/Havi/Éves)                  │
│           │                                                      │
│           ▼                                                      │
│  10. Szállítás mód + cím                                        │
│           │                                                      │
│           ▼                                                      │
│  11. Fizetési mód                                               │
│           │                                                      │
│           ▼                                                      │
│  12. Összesítés + "Megrendelés" gomb                            │
│           │                                                      │
│           ▼                                                      │
│  13. POST NEXT_PUBLIC_ORDER_API_URL                              │
│           │                                                      │
│           ▼                                                      │
│  ┌────────────────────────────────────┐                         │
│  │  JELENLEG: Console.log + Toast     │  ◄── ITT TART           │
│  │  TODO: Stripe Checkout Session     │                         │
│  └────────────────────────────────────┘                         │
│           │                                                      │
│           ▼                                                      │
│  14. [TODO] Stripe fizetési oldal                               │
│           │                                                      │
│           ▼                                                      │
│  15. [TODO] Webhook → DB mentés                                 │
│           │                                                      │
│           ▼                                                      │
│  16. [TODO] Visszairányítás + email                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## JSON struktúra

### Példa rendelés (amit a frontend küld)

```json
{
  "userId": "cml52vail000058c1ltq6lylg",
  "userEmail": "charterinformatikus@gmail.com",
  "userName": "Kiss Péter",
  "szenzorok": [
    { "id": "homerseklet", "name": "Hőmérséklet szenzor", "price": 4500, "quantity": 1 },
    { "id": "o2", "name": "O2 szenzor", "price": 8000, "quantity": 1 },
    { "id": "co2", "name": "CO2 szenzor", "price": 8500, "quantity": 1 }
  ],
  "anyag": {
    "id": "vizallo_burkolat",
    "name": "Vízálló burkolat",
    "price": 2500,
    "quantity": 1
  },
  "doboz": {
    "id": "muanyag",
    "name": "Műanyag doboz",
    "price": 2000,
    "quantity": 1
  },
  "tapellatas": {
    "id": "vezetekes",
    "name": "Vezetékes",
    "price": 2500,
    "quantity": 1
  },
  "elofizetes": {
    "id": "havi",
    "name": "Havi",
    "price": 1000,
    "quantity": 1
  },
  "shipping": {
    "mode": "foxpost",
    "shippingAddress": null,
    "billingSame": true,
    "billingAddress": {
      "zip": "1138",
      "city": "Budapest",
      "street": "Váci út",
      "houseNumber": "99",
      "stair": null,
      "floor": null,
      "door": null
    },
    "foxpostAutomata": "BP Nyugati 115 csomagautomata",
    "foxpostAutomataDetails": {
      "place_id": "115",
      "operator_id": "FP-HU-BUD-0115",
      "name": "BP Nyugati 115 csomagautomata",
      "address": "1062 Budapest, Teréz krt. 55.",
      "city": "Budapest",
      "zip": "1062",
      "geolat": "47.5100",
      "geolng": "19.0630",
      "findme": "A Nyugati pályaudvar mellett"
    }
  },
  "payment": {
    "mode": "utalas"
  },
  "colors": {
    "dobozSzin": { "id": "sarga", "name": "Sárga" },
    "tetoSzin": { "id": "sarga", "name": "Sárga" }
  },
  "subtotal": 27500,
  "vatPercent": 27,
  "vatAmount": 7425,
  "shippingFee": 0,
  "total": 35925,
  "currency": "HUF",
  "createdAt": "2026-02-10T10:30:00.000Z",
  "locale": "hu-HU",
  "presetId": "akvarium",
  "presetLabel": "Akvárium",
  "presetMaxSzenzorok": 3
}
```

**MINDEN mező amit a frontend küld:**
| Mező | Típus | Leírás |
|------|-------|--------|
| `userId` | string | Bejelentkezett felhasználó ID-ja |
| `userEmail` | string | Felhasználó email címe |
| `userName` | string | Megrendelő neve (session-ből) |
| `szenzorok` | array | Custom: 1-2 elem, preset: preset szenzor-szám |
| `anyag` | object | Burok anyag: `{ id, name, price, quantity }` |
| `doboz` | object | Doboz típus: `{ id, name, price, quantity }` |
| `tapellatas` | object | Tápellátás: `{ id, name, price, quantity }` |
| `elofizetes` | object? | Előfizetés (opcionális): `{ id, name, price, quantity }` — bruttó ár (ÁFA-t tartalmaz) |
| `shipping` | object | Szállítás: `{ mode, shippingAddress?, billingSame?, billingAddress, foxpostAutomata?, foxpostAutomataDetails? }` |
| `payment` | object | Fizetés: `{ mode }` |
| `colors` | object | `{ dobozSzin: { id, name }, tetoSzin: { id, name } }` |
| `subtotal` | number | Nettó összeg (Ft) — szenzorok + anyag + doboz + tápellátás (előfizetés NÉLKÜL) |
| `vatPercent` | number | ÁFA kulcs (27) |
| `vatAmount` | number | ÁFA összeg (Ft) — subtotal × 27% |
| `shippingFee` | number | Szállítási díj (Ft) — ÁFA-mentes, jelenleg 0 (PLACEHOLDER) |
| `total` | number | Bruttó végösszeg (Ft) — subtotal + vatAmount + shippingFee + elofizetes.price |
| `currency` | string | Pénznem ("HUF") |
| `createdAt` | string | ISO 8601 időbélyeg |
| `locale` | string | Nyelv/régió ("hu-HU") |
| `presetId` | string? | Opcionális preset azonosító (pl. `akvarium`) |
| `presetLabel` | string? | Opcionális preset megnevezés |
| `presetMaxSzenzorok` | number? | Opcionális preset szenzor-szám |

### API válasz (amit a backend visszaad)

A backend **MINDEN** eredeti mezőt visszaad, plusz a számított értékeket:

```json
{
  "success": true,
  "message": "Rendelés fogadva - Stripe integráció TODO",
  "order": {
    "userId": "cml52vail000058c1ltq6lylg",
    "userEmail": "charterinformatikus@gmail.com",
    "userName": "Kiss Péter",
    "szenzorok": [
      { "id": "homerseklet", "name": "Hőmérséklet szenzor", "price": 4500, "quantity": 1 },
      { "id": "o2", "name": "O2 szenzor", "price": 8000, "quantity": 1 },
      { "id": "co2", "name": "CO2 szenzor", "price": 8500, "quantity": 1 }
    ],
    "anyag": {
      "id": "vizallo_burkolat",
      "name": "Vízálló burkolat",
      "price": 2500,
      "quantity": 1
    },
    "doboz": {
      "id": "muanyag",
      "name": "Műanyag doboz",
      "price": 2000,
      "quantity": 1
    },
    "colors": {
      "dobozSzin": { "id": "sarga", "name": "Sárga" },
      "tetoSzin": { "id": "sarga", "name": "Sárga" }
    },
    "tapellatas": {
      "id": "vezetekes",
      "name": "Vezetékes",
      "price": 2500,
      "quantity": 1
    },
    "elofizetes": {
      "id": "havi",
      "name": "Havi",
      "price": 1000,
      "quantity": 1
    },
    "shipping": {
      "mode": "foxpost",
      "shippingAddress": null,
      "billingSame": true,
      "billingAddress": {
        "zip": "1138",
        "city": "Budapest",
        "street": "Váci út",
        "houseNumber": "99",
        "stair": null,
        "floor": null,
        "door": null
      },
      "foxpostAutomata": "BP Nyugati 115 csomagautomata",
      "foxpostAutomataDetails": {
        "place_id": "115",
        "operator_id": "FP-HU-BUD-0115",
        "name": "BP Nyugati 115 csomagautomata",
        "address": "1062 Budapest, Teréz krt. 55.",
        "city": "Budapest",
        "zip": "1062"
      }
    },
    "payment": {
      "mode": "utalas"
    },
    "subtotal": 27500,
    "vatPercent": 27,
    "vatAmount": 7425,
    "shippingFee": 0,
    "total": 35925,
    "locale": "hu-HU",
    "currency": "HUF",
    "createdAt": "2026-02-10T10:30:00.000Z",
    "presetId": "akvarium",
    "presetLabel": "Akvárium",
    "presetMaxSzenzorok": 3
  }
}
```

**Számított mezők (backend számolja):**
| Mező | Leírás | Példa |
|------|--------|-------|
| `subtotal` | Nettó összeg (szenzorok + anyag + doboz + tápellátás) — előfizetés NÉLKÜL | 27 500 Ft |
| `vatPercent` | ÁFA kulcs | 27% |
| `vatAmount` | ÁFA összeg (subtotal × 0.27) | 7 425 Ft |
| `shippingFee` | Szállítási díj (ÁFA-mentes, jelenleg PLACEHOLDER 0 Ft) | 0 Ft |
| `total` | Bruttó végösszeg (subtotal + vatAmount + shippingFee + elofizetesTotal) | 35 925 Ft |

**ÁFA kalkuláció logika:**
- `subtotal` = szenzorok árak összege + anyag ár + doboz ár + tápellátás ár
- `vatAmount` = Math.round(subtotal × vatPercent / 100)
- Az **előfizetés** díja bruttóként kezelendő (ÁFA-t már tartalmaz), ezért NEM része a subtotal-nak és NEM kerül rá plusz ÁFA
- A **szállítási díj** ÁFA-mentes (jelenleg 0 Ft placeholder)
- `total` = subtotal + vatAmount + shippingFee + elofizetesTotal

### TypeScript típusok

**Fájl:** `src/types/order.ts`

```typescript
export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderColors {
  dobozSzin: {
    id: string;
    name: string;
  };
  tetoSzin: {
    id: string;
    name: string;
  };
}

export interface ShippingAddress {
  zip: string;
  city: string;
  street: string;
  houseNumber: string;
  stair?: string | null;
  floor?: string | null;
  door?: string | null;
}

export interface FoxpostAutomataInfo {
  place_id: string;
  operator_id: string;
  name: string;
  address: string;
  city: string;
  zip: string;
  geolat?: string;
  geolng?: string;
  findme?: string;
}

export interface ShippingDetails {
  mode: "foxpost" | "hazhoz";
  shippingAddress?: ShippingAddress | null;
  billingSame?: boolean;
  billingAddress: ShippingAddress;
  foxpostAutomata?: string | null;
  foxpostAutomataDetails?: FoxpostAutomataInfo | null;
}

export interface PaymentDetails {
  mode: "utalas" | "stripe";
}

export interface OrderPayload {
  userId: string;
  userEmail: string;
  userName: string;          // Megrendelő neve

  szenzorok: OrderItem[];     // Custom max 2, preset limit
  eszkoz?: OrderItem;        // OPCIONÁLIS - jelenleg nem használt
  anyag: OrderItem;          // Burok anyag típusa
  doboz: OrderItem;
  tapellatas: OrderItem;
  elofizetes?: OrderItem;    // OPCIONÁLIS - előfizetés díja (bruttó, ÁFA-t tartalmaz)

  colors: OrderColors;
  shipping: ShippingDetails;
  payment: PaymentDetails;

  // Összesítés
  subtotal: number;      // Nettó összeg (ÁFA nélkül, előfizetés nélkül)
  vatPercent: number;    // ÁFA százalék (pl. 27)
  vatAmount: number;     // ÁFA összeg
  shippingFee: number;   // Szállítási díj (ÁFA-mentes)
  total: number;         // Bruttó végösszeg (subtotal + ÁFA + szállítás + előfizetés)

  currency: "HUF";
  createdAt: string;     // ISO 8601 timestamp
  locale: "hu-HU";

  // Preset meta (opcionális)
  presetId?: string;
  presetLabel?: string;
  presetMaxSzenzorok?: number;
}
```

---

## Backend teendők

### 1. Stripe Checkout Session létrehozása

**Fájl:** `src/app/api/order/route.ts`

```typescript
// JELENLEG:
return NextResponse.json({
  success: true,
  message: "Rendelés fogadva - Stripe integráció TODO",
  order: orderWithCalculation
});

// CSERÉLNI ERRE:
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [/* dinamikusan generálni a rendelésből */],
  mode: 'payment',
  success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/vasarlas/sikeres?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/vasarlas/megszakitva`,
  customer_email: body.userEmail,
  metadata: {
    userId: body.userId,
    orderId: generatedOrderId,
    // teljes rendelés JSON stringként
    orderData: JSON.stringify(orderWithCalculation)
  }
});

return NextResponse.json({
  success: true,
  checkoutUrl: session.url
});
```

### 2. Stripe Webhook kezelés

**Új fájl:** `src/app/api/webhook/stripe/route.ts`

```typescript
// Kezelendő események:
// - checkout.session.completed → rendelés mentése DB-be
// - payment_intent.succeeded → státusz frissítés
// - payment_intent.payment_failed → hiba kezelés
```

### 3. Prisma séma bővítése

**Fájl:** `prisma/schema.prisma`

```prisma
model Order {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  
  // Stripe
  stripeSessionId    String?  @unique
  stripePaymentId    String?
  paymentStatus      String   @default("pending") // pending, paid, failed
  
  // Rendelés adatok
  szenzorokJson      String   @db.Text  // JSON string
  anyagId            String
  anyagName          String
  anyagPrice         Int
  eszkozName         String?
  eszkozPrice        Int?
  dobozName          String
  dobozPrice         Int
  dobozSzin          String
  tetoSzin           String
  tapellatasName     String
  tapellatasPrice    Int
  
  // Előfizetés (bruttó ár, ÁFA-t tartalmaz)
  elofizetesId       String?  // "ingyenes" | "havi" | "eves"
  elofizetesName     String?
  elofizetesPrice    Int?     // Bruttó ár (Ft)
  
  // Összegek
  subtotal           Int      // Nettó (előfizetés nélkül)
  vatPercent         Int      @default(27)
  vatAmount          Int
  shippingFee        Int      @default(0) // ÁFA-mentes
  total              Int      // subtotal + vatAmount + shippingFee + elofizetesPrice
  currency           String   @default("HUF")
  
  // Szállítás
  shippingName       String?
  shippingAddress    String?  @db.Text
  shippingStatus     String   @default("pending") // pending, processing, shipped, delivered
  trackingNumber     String?
  
  // Preset meta
  presetId           String?
  presetLabel        String?
  
  // Időbélyegek
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  paidAt             DateTime?
  shippedAt          DateTime?
  
  @@index([userId])
  @@index([stripeSessionId])
  @@index([paymentStatus])
}
```

### 4. Sikeres/Megszakított oldalak

**Létrehozandó:**
- `src/app/(site)/vasarlas/sikeres/page.tsx` - Sikeres fizetés visszaigazolás
- `src/app/(site)/vasarlas/megszakitva/page.tsx` - Megszakított/hibás fizetés

### 5. Email értesítés

Sikeres fizetés után:
- Vevőnek: Rendelés visszaigazolás
- Adminnak: Új rendelés értesítés

---

## API dokumentáció

### POST NEXT_PUBLIC_ORDER_API_URL

**Request Headers:**
```
Content-Type: application/json
Cookie: next-auth.session-token=...
```

**Request Body:** Lásd [JSON struktúra](#json-struktúra)

**Sikeres válasz (jelenleg):**
```json
{
  "success": true,
  "message": "Rendelés fogadva - Stripe integráció TODO",
  "order": { /* teljes rendelés kalkulációval */ }
}
```

**Sikeres válasz (Stripe után):**
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_live_..."
}
```

**Hibás válasz:**
```json
{
  "error": "Hiányzó kötelező mező: szenzorok"
}
```

### Validációs szabályok

| Mező | Szabály |
|------|---------|
| `userId` | Kötelező, string |
| `userEmail` | Kötelező, valid email |
| `szenzorok` | Kötelező, custom: 1-2 elem, preset: preset szenzor-szám |
| `anyag` | Kötelező, id + name + price + quantity |
| `doboz` | Kötelező, id + name + price + quantity |
| `colors` | Kötelező, dobozSzin + tetoSzin |
| `tapellatas` | Kötelező, id + name + price + quantity |
| `elofizetes` | **OPCIONÁLIS**, id + name + price + quantity (bruttó ár) |
| `shipping` | Kötelező, mode + billingAddress + (hazhoz esetén shippingAddress) + (foxpost esetén foxpostAutomata) |
| `payment` | Kötelező, mode |
| `eszkoz` | **OPCIONÁLIS** |
| `presetId` | OPCIONÁLIS, preset azonosító |
| `presetMaxSzenzorok` | OPCIONÁLIS, preset szenzor-szám |

---

## Adatbázis séma

### Jelenlegi User model

```prisma
model User {
  id                    String    @id @default(cuid())
  name                  String?
  email                 String?   @unique
  emailVerified         DateTime?
  image                 String?
  password              String?
  passwordResetToken    String?   @unique
  passwordResetTokenExp DateTime?
  accounts              Account[]
  sessions              Session[]
  // TODO: orders Order[]
}
```

### Bővítés szükséges

1. User → Order reláció hozzáadása
2. Order model létrehozása (lásd fent)
3. Migráció futtatása: `npx prisma migrate dev --name add_orders`

---

## Stripe integráció

### Szükséges környezeti változók

```env
# .env.local
NEXT_PUBLIC_ORDER_API_URL=https://rendszer.szenzor24.hu/api/orders/create
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Stripe Dashboard beállítások

1. **Webhook endpoint:** `https://yourdomain.com/api/webhook/stripe`
2. **Események:** `checkout.session.completed`, `payment_intent.succeeded`
3. **Teszt mód:** Fejlesztés alatt használd a `sk_test_` kulcsokat

### Line items generálás

```typescript
const lineItems = [];

// Szenzorok
for (const szenzor of body.szenzorok) {
  lineItems.push({
    price_data: {
      currency: 'huf',
      product_data: { name: szenzor.name },
      unit_amount: szenzor.price * 100, // Stripe fillérben számolja
    },
    quantity: szenzor.quantity,
  });
}

// Anyag (burok)
if (body.anyag.price > 0) {
  lineItems.push({
    price_data: {
      currency: 'huf',
      product_data: { name: `Burok: ${body.anyag.name}` },
      unit_amount: body.anyag.price * 100,
    },
    quantity: 1,
  });
}

// Doboz
lineItems.push({
  price_data: {
    currency: 'huf',
    product_data: { 
      name: `${body.doboz.name} (${body.colors.dobozSzin.name}/${body.colors.tetoSzin.name})` 
    },
    unit_amount: body.doboz.price * 100,
  },
  quantity: 1,
});

// Tápellátás
lineItems.push({
  price_data: {
    currency: 'huf',
    product_data: { name: body.tapellatas.name },
    unit_amount: body.tapellatas.price * 100,
  },
  quantity: 1,
});

// Előfizetés (bruttó, ha nem ingyenes)
if (body.elofizetes && body.elofizetes.price > 0) {
  lineItems.push({
    price_data: {
      currency: 'huf',
      product_data: { name: `Előfizetés: ${body.elofizetes.name}` },
      unit_amount: body.elofizetes.price * 100,
    },
    quantity: 1,
  });
}
```

### Ismert backend teendők / hiányosságok

| Probléma | Leírás | Prioritás |
|----------|--------|-----------|
| `PRESET_SENSOR_LIMITS` hiányos | A `route.ts` fájlban csak `huto: 2` és `akvarium: 3` van regisztrálva. A 14 új preset NEM szerepel, ezért a backend fallback-ként a `body.presetMaxSzenzorok` kliens-oldali értéket használja — ez elméletileg spoofable. | ⚠️ Közepes |
| Szállítási díjak placeholder | `SZALLITASI_ARAK` jelenleg `{ foxpost: 0, hazhoz: 0 }` — éles értékek szükségesek | ⚠️ Közepes |
| Szenzorok/anyagok árai placeholder | Több szenzor és anyag ára PLACEHOLDER — végleges árak szükségesek | ⚠️ Közepes |

---

## Foxpost integráció

### Összefoglaló

A Foxpost integráció lehetővé teszi, hogy a felhasználó a rendelés "Szállítás" lépésében
egy **térképes automata-keresőből** válasszon csomagautomatát.

**Dokumentáció forrás:** https://foxpost.hu/uzleti-partnereknek/integracios-segedlet/webapi-integracio

### Architektúra

```
┌──────────────────────────────────────────────────────────────┐
│  FRONTEND (kliens)                                            │
│                                                               │
│  ProductConfigurator.tsx                                      │
│       │                                                       │
│       └─── FoxpostSelector.tsx                                │
│                 │                                             │
│                 ├── iframe: cdn.foxpost.hu/apt-finder/v1/app/ │
│                 │     (Foxpost hivatalos APT Finder widget)   │
│                 │                                             │
│                 └── window.postMessage ← automata adatok      │
│                       (operator_id, name, address, stb.)      │
│                                                               │
│  Kiválasztott automata → foxpostAutomataDetails (OrderPayload)│
└──────────────────────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────────────────────┐
│  BACKEND (szerver)                                            │
│                                                               │
│  src/app/api/foxpost/route.ts                                │
│       │                                                       │
│       ├── POST /api/foxpost → Foxpost csomag létrehozása     │
│       │     (destination = operator_id)                       │
│       │                                                       │
│       └── GET /api/foxpost  → Automata lista (foxplus.json)  │
│                                                               │
│  Foxpost WebAPI (Basic Auth + Api-key header)                │
│  Éles:    https://webapi.foxpost.hu/api                      │
│  Sandbox: https://webapi-test.foxpost.hu/api                 │
└──────────────────────────────────────────────────────────────┘
```

### Frontend – FoxpostSelector komponens

**Fájl:** `src/components/Vasarlas/FoxpostSelector.tsx`

- A Foxpost hivatalos **APT Finder** widgetjét tölti be iframe-ben
- Widget URL: `https://cdn.foxpost.hu/apt-finder/v1/app/?lang=hu&country=HU&noHeader=1&...`
- A felhasználó a térképen keres/kiválaszt egy automatát
- A widget `postMessage`-en küldi vissza a kiválasztott automatát
- Biztonsági ellenőrzés: csak `cdn.foxpost.hu` / `foxpost.hu` origin elfogadva
- A kiválasztott automata adatai megjelennek kártyaként (név, cím, kültéri/beltéri, telítettség)

**Kiválasztott automata mezők:**

| Mező | Leírás |
|------|--------|
| `place_id` | Automata ID (régi, Packeta kompatibilis) |
| `operator_id` | Automata ID (**ezt kell API-nak küldeni** mint `destination`) |
| `name` | Automata neve |
| `address` | Teljes cím |
| `city` | Település |
| `zip` | Irányítószám |
| `geolat` / `geolng` | GPS koordináták |
| `findme` | Megtalálhatóság (pl. "A Nyugati pályaudvar mellett") |
| `load` | Telítettség: `normal loaded`, `medium loaded`, `overloaded` |
| `apmType` | Gyártó: Cleveron / Keba / Rollkon / Rotte |
| `isOutdoor` | Kültéri-e (boolean) |

### Backend – Foxpost API route

**Fájl:** `src/app/api/foxpost/route.ts`

#### POST /api/foxpost – Csomag létrehozása

A rendelés feldolgozásakor a backend ezzel hozza létre a csomagot a Foxpost rendszerében.

**Request body:**
```json
{
  "destination": "FP-HU-BUD-0115",
  "recipientName": "Kiss Péter",
  "recipientPhone": "+36201234567",
  "recipientEmail": "pelda@email.com",
  "size": "M",
  "cod": 0,
  "comment": "Szenzor csomag",
  "refCode": "SZ24-ORD-00123"
}
```

**Foxpost válasz (201 Created):**
```json
{
  "success": true,
  "parcels": [{ "clFoxId": "CLFOX...", "destination": "FP-HU-BUD-0115", "sendType": "APM", ... }]
}
```

#### GET /api/foxpost – Automata lista

Proxy a `https://cdn.foxpost.hu/foxplus.json` fájlhoz (1 óra cache).
Használható saját térkép megoldáshoz ha nem az iframe widgetet használjuk.

### Környezeti változók

```env
# .env
# Foxpost WebAPI (szerver oldali – NEM NEXT_PUBLIC_!)
FOXPOST_API_URL=https://webapi-test.foxpost.hu/api    # Sandbox
# FOXPOST_API_URL=https://webapi.foxpost.hu/api       # Éles
FOXPOST_API_USERNAME=                                   # foxpost.hu -> Beállítások
FOXPOST_API_PASSWORD=                                   # foxpost.hu -> Beállítások
FOXPOST_API_KEY=                                        # foxpost.hu -> Beállítások -> API kulcs
```

### Foxpost üzleti partner regisztráció (senior dev feladata)

1. Regisztráció: https://foxpost.hu/uzleti-partner-regisztracio
2. Bejelentkezés: foxpost.hu → Üzleti partnereknek
3. Beállítások: https://foxpost.hu/beallitasok → API kulcs generálás
4. Sandbox hozzáférés kérése: `b2chelpdesk@foxpost.hu`
5. `.env` kitöltése a kapott adatokkal
6. Tesztelés sandbox-ban (`isWeb: false` paraméterrel)
7. Éles környezetre váltás: `FOXPOST_API_URL=https://webapi.foxpost.hu/api`

### Fontos megjegyzések

- A **frontend** NEM kommunikál közvetlenül a Foxpost WebAPI-val (credentials nem kerülnek kliens oldalra)
- Az APT Finder widget **iframe-ben** fut, nincs szükség API kulcsra hozzá
- A `destination` mező értéke az `operator_id` a foxplus.json-ből. Ha `operator_id` üres → `place_id`-t kell használni
- Telefon validáció regex: `^(\+36|36)(20|30|31|70|50|51)\d{7}$`
- A `size` mező (XS/S/M/L/XL) a raktárban pontosításra kerül, bátran küldhető "M"
- A `postMessage` formátum widget-verziótól függ – szükség esetén a `parseMessagePayload()` módosítandó

---

## Tesztelési checklist

### Frontend ✅

- [x] Bejelentkezés nélkül átirányít signin-ra
- [x] Bejelentkezés után visszakerül /vasarlas-ra
- [x] Szenzor választás működik (custom max 2)
- [x] 16 db előre beállított konfiguráció (preset kártyák) működnek
- [x] Preset módban Szenzor és Anyag lépések átugrásra kerülnek
- [x] Preset-zárolt lépések nem kattinthatók (cursor-not-allowed)
- [x] Anyag választás működik (6 típus: Normál, Vízálló, PLA, UV álló PLA, ABS, PETG)
- [x] Doboz választás működik
- [x] Szín választás működik
- [x] 3D előnézet betölt minden kombinációra
- [x] Tápellátás választás működik
- [x] Előfizetés választás működik (Ingyenes / Havi / Éves)
- [x] Előfizetés bruttóként kezelve (nincs dupla ÁFA)
- [x] Összesítés helyes árakat mutat (Nettó, ÁFA, Szállítás, Előfizetés, Bruttó összeg)
- [x] Progress bar kattintható (visszafelé navigáció)
- [x] Folyamatkövető sidebar mutatja az aktuális kiválasztásokat
- [x] Szállítási adatok megadása kötelező (mód + cím + Foxpost automata ha szükséges)
- [x] Foxpost automata választó (térképes iframe widget) megnyílik és bezáródik
- [x] Kiválasztott automata adatai megjelennek a szállítás lépésben és az összesítésben
- [x] foxpostAutomataDetails bekerül a rendelés JSON-ba
- [x] ÁFA kalkuláció helyes (27%, egyszeri, előfizetés nem része az ÁFA alapnak)

### Foxpost TODO ⏳

- [ ] Foxpost üzleti partner regisztráció
- [ ] FOXPOST_API_* .env változók kitöltése
- [ ] Sandbox tesztelés (csomag létrehozás)
- [ ] postMessage formátum ellenőrzése az APT Finder widgettel
- [ ] Éles Foxpost API URL váltás
- [x] Megrendelés gomb elküldi a JSON-t
- [x] Toast üzenet megjelenik
- [x] Console-ban látható a válasz
- [x] Email küldés sikeres rendelésnél

### Backend TODO ⏳

- [ ] Stripe Checkout Session létrehozás
- [ ] Prisma Order model
- [ ] Prisma migráció
- [ ] Webhook endpoint
- [ ] Sikeres oldal
- [ ] Megszakított oldal
- [ ] Admin dashboard (rendelések listája)

---

## Email értesítés 📧

A sikeres rendelés után automatikusan email megy a megrendelőnek.

**Fájl:** `src/lib/orderEmail.ts`

### Email tartalma:
- ✅ Rendelés visszaigazolás
- 📦 Részletes termék lista (szenzorok, anyag, doboz, színek, tápellátás)
- 💰 Árak és összesítés (nettó, ÁFA, bruttó)
- 🚀 **CTA gomb: Regisztráció a rendszer.szenzor24.hu-ra**
- 📊 Rendelés státusz info

### Email beállítások (.env):
```env
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=465
EMAIL_SERVER_USER=your-user
EMAIL_SERVER_PASSWORD=your-password
EMAIL_FROM=info@szenzor24.hu
```

---

## Fájlok listája

| Fájl | Leírás |
|------|--------|
| `src/app/(site)/vasarlas/page.tsx` | Rendelés oldal (/vasarlas) |
| `src/components/Vasarlas/ProductConfigurator.tsx` | 10 lépéses konfigurátor + 16 preset + előfizetés + folyamatkövető |
| `src/components/Vasarlas/FoxpostSelector.tsx` | Foxpost automata választó (iframe APT Finder widget) |
| `src/types/order.ts` | TypeScript típusok (incl. FoxpostAutomataInfo, elofizetes) |
| `src/app/api/order/route.ts` | Lokális API referencia/validáció (ÁFA kalkuláció, előfizetés bruttó kezelés) |
| `src/app/api/foxpost/route.ts` | Foxpost WebAPI szerver-oldali route (csomaglétrehozás + automata lista) |
| `src/lib/orderEmail.ts` | Rendelés visszaigazoló email template |
| `src/lib/email.ts` | Nodemailer konfiguráció |
| `src/lib/modelPaths.ts` | 3D modell elérési utak (akkus model path) |
| `src/components/HeroArea/index.tsx` | Főoldali "Rendelés" CTA |
| `src/components/Header/index.tsx` | Fejléc "Rendelés" menüpont |

---
*Dokumentáció generálva: 2026. február 10.*
