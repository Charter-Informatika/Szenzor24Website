import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { prisma } from "@/lib/prismaDB";
import { OrderPayload } from "@/types/order";
import { sendOrderConfirmationEmail } from "@/lib/orderEmail";

const PRESET_SENSOR_LIMITS: Record<string, number> = {
  huto: 2,
  akvarium: 3,
  hutokamra: 2,
  hideglanc_monitor: 2,
  gyogyszertarolo: 2,
  raktar_kornyezetfigyelo: 2,
  server_szoba_monitor: 2,
  iroda_levegominoseg: 2,
  tanterem_levegofigyelo: 2,
  kazan_biztonsag: 2,
  garazs_gazfigyelo: 2,
  akku_tolto_helyiseg: 2,
  allattarto_telep: 3,
  logisztikai_csomagfigyelo: 2,
  szallitasi_sokkfigyelo: 1,
  tarolo_kontener: 2,
};

/*
================================================================================
BACKEND KOLLÉGA - ADATBÁZIS SÉMA JAVASLAT (2026-02-04 frissítve)
================================================================================

VÁLTOZÁSOK:
- userName mező HOZZÁADVA (megrendelő neve)
- anyag mező HOZZÁADVA (burok anyag típusa: PLA, UV álló PLA, stb.)
- eszkoz mező továbbra is OPCIONÁLIS

PRISMA MODEL - Order tábla:

model Order {
  id              String   @id @default(cuid())
  userId          String                          // FK -> User.id
  user            User     @relation(fields: [userId], references: [id])
  userEmail       String                          // Rendeléskor aktuális email
  userName        String                          // Megrendelő neve
  
  // Termékek - JSON formátumban vagy külön OrderItem tábla
  szenzorokJson   Json                            // [{ id, name, price, quantity }] - max 2 elem
  
  // Burok anyag (KÖTELEZŐ)
  anyagId         String                          // "sima_pla" | "uv_allo_pla" | "abs" | "petg"
  anyagName       String                          // pl. "UV álló PLA"
  anyagPrice      Int                             // Felár (Ft)
  
  // OPCIONÁLIS - jelenleg nem használt a frontenden
  eszkozId        String?                         // "basic" | "standard" | "pro"
  eszkozName      String?                         // pl. "Basic Modul"
  eszkozPrice     Int?                            // Egységár (Ft)
  
  dobozId         String                          // "muanyag" | "fem" | "rozsdamentes"
  dobozName       String                          // pl. "Műanyag doboz"
  dobozPrice      Int
  dobozSzin       String                          // "zold" | "feher" | "sarga" | "piros" | "kek" | "fekete"
  tetoSzin        String                          // "feher" | "sarga" | "kek" | "zold" | "piros" | "fekete"
  
  tapellatasId    String                          // "akkus" | "vezetekes" | "napelemes"
  tapellatasName  String
  tapellatasPrice Int
  
  // Összegek (Ft)
  subtotal        Int                             // Nettó összeg (ÁFA nélkül)
  vatPercent      Int       @default(27)          // ÁFA százalék
  vatAmount       Int                             // ÁFA összeg
  shippingFee     Int                             // Szállítási díj (ÁFA-mentes)
  total           Int                             // Bruttó végösszeg (ÁFA + szállítás)
  currency        String    @default("HUF")
  
  // Stripe
  stripeSessionId String?   @unique               // Checkout session ID
  stripePaymentId String?                         // Payment Intent ID
  
  // Státusz
  status          OrderStatus @default(PENDING)   // PENDING, PAID, SHIPPED, COMPLETED, CANCELLED
  
  // Időbélyegek
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  paidAt          DateTime?                       // Fizetés időpontja
  
  @@index([userId])
  @@index([status])
  @@index([stripeSessionId])
}

enum OrderStatus {
  PENDING       // Függőben - fizetésre vár
  PAID          // Fizetve - feldolgozásra vár
  SHIPPED       // Kiszállítva
  COMPLETED     // Teljesítve
  CANCELLED     // Törölve
}

================================================================================
BEJÖVŐ JSON STRUKTÚRA (body) - 2026-02-04 frissítve:
================================================================================
{
  "userId": "cml52vail000058c1ltq6lylg",
  "userEmail": "user@example.com",
  "userName": "Kiss Péter",                       // ÚJ - Megrendelő neve
  "szenzorok": [                                  // KÖTELEZŐ - Custom: max 2 elem, preset: preset limit
    { "id": "htu21d", "name": "HTU21D", "price": 5000, "quantity": 1 },
    { "id": "mpu6050", "name": "MPU-6050", "price": 6000, "quantity": 1 }
  ],
  "anyag": { "id": "uv_allo_pla", "name": "UV álló PLA", "price": 1500, "quantity": 1 },  // ÚJ - Burok anyag
  // "eszkoz": { ... },                           // OPCIONÁLIS - jelenleg nem küldi a frontend!
  "doboz": { "id": "muanyag", "name": "Műanyag doboz", "price": 2000, "quantity": 1 },
  "colors": {
    "dobozSzin": { "id": "zold", "name": "Zöld" },
    "tetoSzin": { "id": "feher", "name": "Fehér" }
  },
  "tapellatas": { "id": "vezetekes", "name": "Vezetékes", "price": 2500, "quantity": 1 },
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
    "foxpostAutomata": "FOXP-LIFE-001"
  },
   "payment": {
     "mode": "utalas"
   },
  "subtotal": 15000,
  "vatPercent": 27,
  "vatAmount": 4050,
  "shippingFee": 0,
  "total": 19050,
  "currency": "HUF",
  "locale": "hu-HU",
  "createdAt": "2026-02-04T10:30:00.000Z",
  "presetId": "akvarium",                    // OPCIONÁLIS - preset azonosító
  "presetLabel": "Akvárium",                // OPCIONÁLIS - preset megnevezés
  "presetMaxSzenzorok": 3                     // OPCIONÁLIS - preset limit
}

================================================================================
SZENZOR ID-K:
  - htu21d, mpu6050, gaz, homerseklet, paratartalom, feny, hidrogen, metan, sensorion, o2, co2

ANYAG ID-K (PLACEHOLDER - árak később pontosítandók):
  - normal_burkolat (0 Ft - alap ár)
  - vizallo_burkolat (+2500 Ft)
  - sima_pla (0 Ft - alap ár)
  - uv_allo_pla (+1500 Ft)
  - abs (+2000 Ft)
  - petg (+2500 Ft)

ESZKÖZ ID-K:
  - basic, standard, pro

DOBOZ ID-K:
  - muanyag, fem, rozsdamentes

DOBOZ SZÍN ID-K:
  - zold, feher, sarga, piros, kek, fekete

TETŐ SZÍN ID-K:
  - feher, sarga, kek, zold, piros, fekete

TÁPELLÁTÁS ID-K:
  - akkus, vezetekes

SZÁLLÍTÁSI MÓDOK:
  - foxpost, hazhoz
FIZETÉSI MÓDOK:
  - utalas, stripe
================================================================================
*/

// POST /api/order - Rendelés leadása
// A backend kolléga ide írja a Stripe integrációt
export async function POST(request: Request) {
  try {
    const body: OrderPayload = await request.json();

    // DEBUG: Rendelés JSON logolása a terminálba
    console.log("=== ÚJ RENDELÉS ===");
    console.log(JSON.stringify(body, null, 2));
    console.log("===================");

    // TODO: Backend - Session ellenőrzés
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // Validáció - kötelező mezők (eszkoz opcionális)
      if (!body.szenzorok || body.szenzorok.length === 0 || !body.anyag || !body.doboz || !body.tapellatas || !body.shipping || !body.payment) {
      return NextResponse.json(
        { error: "Hiányzó termék adatok" },
        { status: 400 }
      );
    }

    const presetMax = body.presetId
      ? (PRESET_SENSOR_LIMITS[body.presetId] ?? body.presetMaxSzenzorok)
      : undefined;
    const maxSzenzorok = presetMax ?? 2;

    // Max szenzor ellenőrzés
    if (body.szenzorok.length > maxSzenzorok) {
      return NextResponse.json(
        { error: `Maximum ${maxSzenzorok} szenzor választható` },
        { status: 400 }
      );
    }

    if (!body.userId || !body.userEmail || !body.userName) {
      return NextResponse.json(
        { error: "Hiányzó felhasználó adatok" },
        { status: 400 }
      );
    }

    if (!body.shipping || !body.shipping.mode || !body.shipping.billingAddress) {
      return NextResponse.json(
        { error: "Hiányzó szállítási adatok" },
        { status: 400 }
      );
    }

    const billing = body.shipping.billingAddress;
    if (!billing.zip || !billing.city || !billing.street || !billing.houseNumber) {
      return NextResponse.json(
        { error: "Hiányos számlázási cím" },
        { status: 400 }
      );
    }

    if (body.shipping.mode === "hazhoz") {
      if (!body.shipping.shippingAddress) {
        return NextResponse.json(
          { error: "Hiányos szállítási cím" },
          { status: 400 }
        );
      }

      const shipping = body.shipping.shippingAddress;
      if (!shipping.zip || !shipping.city || !shipping.street || !shipping.houseNumber) {
        return NextResponse.json(
          { error: "Hiányos szállítási cím" },
          { status: 400 }
        );
      }
    }

    if (body.shipping.mode === "foxpost" && !body.shipping.foxpostAutomata) {
      return NextResponse.json(
        { error: "Hiányzó Foxpost automata" },
        { status: 400 }
      );
    }

      if (!body.payment.mode) {
        return NextResponse.json(
          { error: "Hiányzó fizetési mód" },
          { status: 400 }
        );
      }

    // Összeg újraszámolás (biztonság kedvéért)
    const szenzorokTotal = body.szenzorok.reduce((sum, sz) => sum + sz.price * sz.quantity, 0);
    const anyagTotal = body.anyag.price * body.anyag.quantity;
    const eszkozTotal = body.eszkoz ? body.eszkoz.price * body.eszkoz.quantity : 0;
    const elofizetesTotal = body.elofizetes
      ? body.elofizetes.price * body.elofizetes.quantity
      : 0;
    const calculatedSubtotal =
      szenzorokTotal +
      anyagTotal +
      eszkozTotal +
      body.doboz.price * body.doboz.quantity +
      body.tapellatas.price * body.tapellatas.quantity;

    const shippingFee = typeof body.shippingFee === "number" ? body.shippingFee : 0;
    const vatAmount = Math.round(calculatedSubtotal * (body.vatPercent / 100));
    const total = calculatedSubtotal + vatAmount + shippingFee + elofizetesTotal;

    // Stripe Checkout Session létrehozása
    if (body.payment.mode === "stripe") {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
        
        // Szenzorok line_items (max preset/custom)
        const szenzorLineItems = body.szenzorok.map((sz) => ({
          price_data: {
            currency: "huf",
            product_data: {
              name: sz.name,
              description: "Szenzor",
            },
            unit_amount: sz.price * 100, // Stripe fillérben várja
          },
          quantity: sz.quantity,
        }));

        // Összes line item
        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
          ...szenzorLineItems,
          {
            price_data: {
              currency: "huf",
              product_data: {
                name: body.anyag.name,
                description: "Burok anyag",
              },
              unit_amount: body.anyag.price * 100,
            },
            quantity: body.anyag.quantity,
          },
          {
            price_data: {
              currency: "huf",
              product_data: {
                name: body.doboz.name,
                description: `Doboz - ${body.colors.dobozSzin.name} / ${body.colors.tetoSzin.name} tető`,
              },
              unit_amount: body.doboz.price * 100,
            },
            quantity: body.doboz.quantity,
          },
          {
            price_data: {
              currency: "huf",
              product_data: {
                name: body.tapellatas.name,
                description: "Tápellátás",
              },
              unit_amount: body.tapellatas.price * 100,
            },
            quantity: body.tapellatas.quantity,
          },
        ];

        // Elofizetes hozzáadása ha van
        if (body.elofizetes && body.elofizetes.price > 0) {
          lineItems.push({
            price_data: {
              currency: "huf",
              product_data: {
                name: body.elofizetes.name,
                description: "Előfizetés",
              },
              unit_amount: body.elofizetes.price * 100,
            },
            quantity: body.elofizetes.quantity,
          });
        }

        const checkoutSession = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "payment",
          currency: "huf",
          customer_email: body.userEmail,
          line_items: lineItems,
          metadata: {
            userId: body.userId,
            szenzorokIds: body.szenzorok.map((sz) => sz.id).join(","),
            dobozId: body.doboz.id,
            dobozSzin: body.colors.dobozSzin.id,
            tetoSzin: body.colors.tetoSzin.id,
            tapellatasId: body.tapellatas.id,
            shippingMode: body.shipping.mode,
            orderTotal: total.toString(),
          },
          success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/vasarlas/sikeres?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/vasarlas`,
        });

        return NextResponse.json({ 
          success: true, 
          url: checkoutSession.url,
          sessionId: checkoutSession.id 
        });
      } catch (stripeError) {
        console.error("Stripe error:", stripeError);
        return NextResponse.json(
          { error: "Stripe fizetési hiba" },
          { status: 500 }
        );
      }
    }

    // TODO: Backend - Rendelés mentése adatbázisba
    /*
    const order = await prisma.order.create({
      data: {
        userId: body.userId,
        szenzorokIds: body.szenzorok.map((sz) => sz.id), // JSON tömb vagy külön tábla
        eszkozId: body.eszkoz.id,
        dobozId: body.doboz.id,
        dobozSzin: body.colors.dobozSzin.id,
        tetoSzin: body.colors.tetoSzin.id,
        tapellatasId: body.tapellatas.id,
        subtotal: calculatedSubtotal,
        vatAmount: vatAmount,
        total: total,
        status: "pending",
      },
    });
    */

    // Rendelés adatok összeállítása
    const orderWithCalculation = {
      ...body,
      subtotal: calculatedSubtotal,
      vatAmount: vatAmount,
      shippingFee: shippingFee,
      total: total,
    };

    // Email küldés a megrendelőnek
    console.log("Rendelés visszaigazoló email küldése:", body.userEmail);
    try {
console.log("📨 Email küldés indítása...");
await sendOrderConfirmationEmail(orderWithCalculation);
console.log("✅ Rendelés visszaigazoló email elküldve:", body.userEmail);
} catch (emailError) {
console.error("❌ Email küldési hiba:", emailError);
// Az email hiba nem blokkolja a rendelést
}

// 2. Rendelés továbbítása az Express backendnek (App2)
try {
console.log("🚀 Rendelés továbbítása az Express szerver felé...");

// Ide beírhatod a .env változót, VAGY fixen az IP/URL-t
const expressApiUrl = process.env.NEXT_PUBLIC_ORDER_API_URL || "Nincs beállítva az Express API URL";

const app2Response = await fetch(expressApiUrl, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(body),
});

if (!app2Response.ok) {
const errorText = await app2Response.text();
console.error("❌ Express hiba válasz:", errorText);
throw new Error(`Express hiba: ${app2Response.status}`);
}

console.log("✅ Express szerver sikeresen fogadta a rendelést!");
} catch (app2Error) {
console.error("❌ Hiba az Express szerver felé továbbításkor:", app2Error);
return NextResponse.json(
{ error: "Hiba a rendelés mentésekor (Express)" },
{ status: 500 }
);
}

// 3. Visszatérés a frontendnek utalás esetén
if (body.payment.mode === "utalas") {
return NextResponse.json({
success: true,
message: "Rendelés fogadva - Banki átutalásra vár",
url: `${process.env.NEXT_PUBLIC_SITE_URL}/vasarlas/sikeres`,
order: orderWithCalculation,
});
}

// Alapértelmezett válasz
return NextResponse.json({
success: true,
message: "Rendelés fogadva",
order: orderWithCalculation,
});

} catch (error) {
console.error("Order API error:", error);
return NextResponse.json(
{ error: "Hiba történt a rendelés feldolgozása során" },
{ status: 500 }
);
}
}
