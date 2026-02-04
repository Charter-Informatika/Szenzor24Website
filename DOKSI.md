# Vásárlás Funkció Dokumentáció

**Utolsó frissítés:** 2026. február 4.  
**Branch:** `dev_style`  
**Státusz:** Frontend kész ✅ | Backend integráció TODO ⏳

---

## 📋 Tartalomjegyzék

1. [Összefoglaló](#összefoglaló)
2. [Frontend - Jelenlegi állapot](#frontend---jelenlegi-állapot)
3. [Vásárlási folyamat](#vásárlási-folyamat)
4. [JSON struktúra](#json-struktúra)
5. [Backend teendők](#backend-teendők)
6. [API dokumentáció](#api-dokumentáció)
7. [Adatbázis séma](#adatbázis-séma)
8. [Stripe integráció](#stripe-integráció)
9. [Tesztelési checklist](#tesztelési-checklist)

---

## Összefoglaló

A vásárlás funkció lehetővé teszi a felhasználók számára, hogy egyedi szenzor-csomagot állítsanak össze:
- Maximum 3 szenzor kiválasztása
- Burok anyag típus választás (PLA, UV álló PLA, stb.)
- Doboz típus választás
- Doboz és tető szín választás (3D előnézettel)
- Tápellátás típus választás (vezetékes v. akkus)
- Automatikus ár kalkuláció ÁFA-val

**Jelenlegi állapot:** A frontend teljesen működőképes, a rendelés JSON formátumban elkészül és elküldésre kerül a `/api/order` végpontra. A backend integráció (Stripe fizetés, adatbázis mentés) még hiányzik.

---

## Frontend - Jelenlegi állapot

### Elérési út
- **URL:** `/vasarlas`
- **Komponens:** `src/components/Vasarlas/ProductConfigurator.tsx`
- **API route:** `src/app/api/order/route.ts`

### Belépési pont
A vásárlás oldalra a főoldali "Vásárlás" gombbal lehet eljutni:
- **Fájl:** `src/components/Pricing/index.tsx`
- **Gomb:** "Vásárlás" → navigál a `/vasarlas` oldalra

### Autentikáció
- ⚠️ **Bejelentkezés kötelező** a vásárláshoz
- Ha nincs bejelentkezve → átirányítás `/auth/signin?callbackUrl=/vasarlas`
- Sikeres bejelentkezés után visszakerül a `/vasarlas` oldalra

### 6 lépéses konfigurátor

| Lépés | Név | Leírás |
|-------|-----|--------|
| 1 | Szenzorok | Max 3 szenzor kiválasztása (checkbox multi-select) |
| 2 | Anyag | Burok anyag típusa (Sima PLA, UV álló PLA, ABS, PETG) |
| 3 | Doboz | Doboz típus (műanyag/fém/rozsdamentes) |
| 4 | Színek | Doboz szín + tető szín (3D előnézet) |
| 5 | Tápellátás | Akkumulátoros/Vezetékes/Napelemes |
| 6 | Összesítés | Végleges rendelés áttekintés + "Megrendelés" gomb |

### Elérhető opciók

#### Szenzorok (max 3 választható)
| ID | Név | Leírás | Ár |
|----|-----|--------|-----|
| `htu21d` | HTU21D | Hőmérséklet és páratartalom szenzor | 5 000 Ft |
| `mpu6050` | MPU-6050 | 6 tengelyes gyorsulásmérő és giroszkóp | 6 000 Ft |
| `gaz` | Gáz szenzor | Általános gáz érzékelő | 7 000 Ft |
| `homerseklet` | Hőmérséklet szenzor | Precíz hőmérséklet mérés | 4 500 Ft |
| `feny` | Fény szenzor | Fényerősség mérő szenzor | 4 000 Ft |
| `hidrogen` | Hidrogén szenzor | Hidrogén gáz érzékelő | 8 000 Ft |
| `metan` | Metán szenzor | Metán gáz érzékelő | 7 500 Ft |
| `sensorion` | SENSORION | SENSORION precíziós hőmérséklet szenzor | 9 000 Ft |

#### Burok anyag típusok (PLACEHOLDER - árak később pontosítandók)
| ID | Név | Leírás | Ár |
|----|-----|--------|-----|
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
| `napelemes` | Napelemes | Napelem + akkumulátor kombináció | 12 000 Ft |

### 3D Előnézet
- **Technológia:** Google Model Viewer (`@google/model-viewer`)
- **GLB fájlok helye:** `/public/images/hero/{doboz_szin}/{doboz_szin}_{teto_szin}.glb`
- **Példa:** sárga doboz + kék tető → `/images/hero/sarga/sarga_kek.glb`
- **Összes kombináció:** 6 × 6 = 36 GLB fájl

---

## Vásárlási folyamat

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
│  3. Szenzor választás (1-3 db)                                  │
│           │                                                      │
│           ▼                                                      │
│  4. Doboz típus választás                                       │
│           │                                                      │
│           ▼                                                      │
│  5. Szín választás (3D előnézet)                                │
│           │                                                      │
│           ▼                                                      │
│  6. Tápellátás választás                                        │
│           │                                                      │
│           ▼                                                      │
│  7. Összesítés + "Megrendelés" gomb                             │
│           │                                                      │
│           ▼                                                      │
│  8. POST /api/order                                              │
│           │                                                      │
│           ▼                                                      │
│  ┌────────────────────────────────────┐                         │
│  │  JELENLEG: Console.log + Toast     │  ◄── ITT TART           │
│  │  TODO: Stripe Checkout Session     │                         │
│  └────────────────────────────────────┘                         │
│           │                                                      │
│           ▼                                                      │
│  9. [TODO] Stripe fizetési oldal                                │
│           │                                                      │
│           ▼                                                      │
│  10. [TODO] Webhook → DB mentés                                 │
│           │                                                      │
│           ▼                                                      │
│  11. [TODO] Visszairányítás + email                             │
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
    { "id": "htu21d", "name": "HTU21D", "price": 5000, "quantity": 1 },
    { "id": "mpu6050", "name": "MPU-6050", "price": 6000, "quantity": 1 },
    { "id": "homerseklet", "name": "Hőmérséklet szenzor", "price": 4500, "quantity": 1 }
  ],
  "anyag": {
    "id": "uv_allo_pla",
    "name": "UV álló PLA",
    "price": 1500,
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
    "id": "napelemes",
    "name": "Napelemes",
    "price": 12000,
    "quantity": 1
  },
  "locale": "hu-HU",
  "currency": "HUF",
  "createdAt": "2026-02-04T10:30:00.000Z"
}
```

**Fontos mezők:**
- `userId`: A bejelentkezett felhasználó egyedi azonosítója
- `userEmail`: A felhasználó email címe
- `userName`: A megrendelő neve (session-ből)
- `szenzorok`: Tömb, 1-3 elemmel, mindegyikben id, name, price, quantity
- `anyag`: Burok anyag típusa (Sima PLA, UV álló PLA, ABS, PETG)
- `doboz`: Objektum a kiválasztott dobozzal
- `colors`: Doboz szín és tető szín külön objektumokban
- `tapellatas`: Kiválasztott tápellátás típus (vezetékes v. akkus)
- `locale`: Nyelv és régió (hu-HU)
- `currency`: Pénznem (HUF)
- `createdAt`: ISO 8601 időbélyeg

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
      { "id": "htu21d", "name": "HTU21D", "price": 5000, "quantity": 1 },
      { "id": "mpu6050", "name": "MPU-6050", "price": 6000, "quantity": 1 },
      { "id": "homerseklet", "name": "Hőmérséklet szenzor", "price": 4500, "quantity": 1 }
    ],
    "anyag": {
      "id": "uv_allo_pla",
      "name": "UV álló PLA",
      "price": 1500,
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
      "id": "napelemes",
      "name": "Napelemes",
      "price": 12000,
      "quantity": 1
    },
    "subtotal": 31000,
    "vatPercent": 27,
    "vatAmount": 8370,
    "total": 39370,
    "locale": "hu-HU",
    "currency": "HUF",
    "createdAt": "2026-02-04T10:30:00.000Z"
  }
}
```

**Számított mezők (backend számolja):**
| Mező | Leírás | Példa |
|------|--------|-------|
| `subtotal` | Nettó összeg (szenzorok + anyag + doboz + tápellátás) | 31 000 Ft |
| `vatPercent` | ÁFA kulcs | 27% |
| `vatAmount` | ÁFA összeg (subtotal × 0.27) | 8 370 Ft |
| `total` | Bruttó végösszeg (subtotal + vatAmount) | 39 370 Ft |

### TypeScript típusok

**Fájl:** `src/types/order.ts`

```typescript
export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface ColorSelection {
  id: string;
  name: string;
}

export interface OrderColors {
  dobozSzin: ColorSelection;
  tetoSzin: ColorSelection;
}

export interface OrderPayload {
  userId: string;
  userEmail: string;
  userName: string;          // Megrendelő neve
  szenzorok: OrderItem[];
  anyag: OrderItem;          // Burok anyag típusa
  eszkoz?: OrderItem;        // OPCIONÁLIS - jelenleg nem használt
  doboz: OrderItem;
  colors: OrderColors;
  tapellatas: OrderItem;
  locale: string;
  currency: string;
  createdAt: string;
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
  eszkozName         String?
  eszkozPrice        Int?
  dobozName          String
  dobozPrice         Int
  dobozSzin          String
  tetoSzin           String
  tapellatasName     String
  tapellatasPrice    Int
  
  // Összegek
  subtotal           Int
  vatPercent         Int      @default(27)
  vatAmount          Int
  total              Int
  currency           String   @default("HUF")
  
  // Szállítás
  shippingName       String?
  shippingAddress    String?  @db.Text
  shippingStatus     String   @default("pending") // pending, processing, shipped, delivered
  trackingNumber     String?
  
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

### POST /api/order

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
| `szenzorok` | Kötelező, 1-3 elem |
| `doboz` | Kötelező, id + name + price + quantity |
| `colors` | Kötelező, dobozSzin + tetoSzin |
| `tapellatas` | Kötelező, id + name + price + quantity |
| `eszkoz` | **OPCIONÁLIS** |

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
```

---

## Tesztelési checklist

### Frontend ✅

- [x] Bejelentkezés nélkül átirányít signin-ra
- [x] Bejelentkezés után visszakerül /vasarlas-ra
- [x] Szenzor választás működik (max 3)
- [x] Anyag választás működik (PLA típusok)
- [x] Doboz választás működik
- [x] Szín választás működik
- [x] 3D előnézet betölt minden kombinációra
- [x] Tápellátás választás működik
- [x] Összesítés helyes árakat mutat
- [x] ÁFA kalkuláció helyes (27%)
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
| `src/app/(site)/vasarlas/page.tsx` | Vásárlás oldal |
| `src/components/Vasarlas/ProductConfigurator.tsx` | 6 lépéses konfigurátor |
| `src/types/order.ts` | TypeScript típusok |
| `src/app/api/order/route.ts` | API endpoint + email küldés |
| `src/lib/orderEmail.ts` | Rendelés visszaigazoló email template |
| `src/lib/email.ts` | Nodemailer konfiguráció |
| `src/components/Pricing/index.tsx` | "Rendelés" gomb |

---

## Kapcsolattartás

Ha kérdés van a frontend működésével kapcsolatban, nézd meg:
1. A böngésző konzolt (F12 → Console)
2. A Network tabot a request/response-ért
3. Ezt a dokumentációt

**Frontend fejlesztő:** Péter (szenzor24.hu)  
**Backend fejlesztő:** [Név] (rendszer.szenzor24.hu)

---

*Dokumentáció generálva: 2025. február 4.*
