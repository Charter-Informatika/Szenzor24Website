import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { prisma } from "@/lib/prismaDB";
import { OrderPayload } from "@/types/order";
import { sendOrderConfirmationEmail } from "@/lib/orderEmail";

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
  szenzorokJson   Json                            // [{ id, name, price, quantity }] - max 3 elem
  
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
  total           Int                             // Bruttó végösszeg
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
  "szenzorok": [                                  // KÖTELEZŐ - Max 3 elem!
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
  "subtotal": 15000,
  "vatPercent": 27,
  "vatAmount": 4050,
  "total": 19050,
  "currency": "HUF",
  "locale": "hu-HU",
  "createdAt": "2026-02-04T10:30:00.000Z"
}

================================================================================
SZENZOR ID-K:
  - htu21d, mpu6050, gaz, homerseklet, feny, hidrogen, metan, sensorion

ANYAG ID-K (PLACEHOLDER - árak később pontosítandók):
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
  - akkus, vezetekes, napelemes
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
    if (!body.szenzorok || body.szenzorok.length === 0 || !body.anyag || !body.doboz || !body.tapellatas) {
      return NextResponse.json(
        { error: "Hiányzó termék adatok" },
        { status: 400 }
      );
    }

    // Max 3 szenzor ellenőrzés
    if (body.szenzorok.length > 3) {
      return NextResponse.json(
        { error: "Maximum 3 szenzor választható" },
        { status: 400 }
      );
    }

    if (!body.userId || !body.userEmail || !body.userName) {
      return NextResponse.json(
        { error: "Hiányzó felhasználó adatok" },
        { status: 400 }
      );
    }

    // Összeg újraszámolás (biztonság kedvéért)
    const szenzorokTotal = body.szenzorok.reduce((sum, sz) => sum + sz.price * sz.quantity, 0);
    const anyagTotal = body.anyag.price * body.anyag.quantity;
    const eszkozTotal = body.eszkoz ? body.eszkoz.price * body.eszkoz.quantity : 0;
    const calculatedSubtotal =
      szenzorokTotal +
      anyagTotal +
      eszkozTotal +
      body.doboz.price * body.doboz.quantity +
      body.tapellatas.price * body.tapellatas.quantity;

    const vatAmount = Math.round(calculatedSubtotal * (body.vatPercent / 100));
    const total = calculatedSubtotal + vatAmount;

    // TODO: Backend - Stripe Checkout Session létrehozása
    /*
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    
    // Szenzorok line_items (max 3)
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

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      currency: "huf",
      customer_email: body.userEmail,
      line_items: [
        ...szenzorLineItems,
        {
          price_data: {
            currency: "huf",
            product_data: {
              name: body.eszkoz.name,
              description: "Eszköz/Modul",
            },
            unit_amount: body.eszkoz.price * 100,
          },
          quantity: body.eszkoz.quantity,
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
      ],
      metadata: {
        userId: body.userId,
        szenzorokIds: body.szenzorok.map((sz) => sz.id).join(","), // pl. "homerseklet,paratartalom,ajto"
        eszkozId: body.eszkoz.id,
        dobozId: body.doboz.id,
        dobozSzin: body.colors.dobozSzin.id,
        tetoSzin: body.colors.tetoSzin.id,
        tapellatasId: body.tapellatas.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/vasarlas/sikeres?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/vasarlas`,
    });

    return NextResponse.json({ url: checkoutSession.url });
    */

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
      total: total,
    };

    // Email küldés a megrendelőnek
    try {
      await sendOrderConfirmationEmail(orderWithCalculation);
      console.log("✅ Rendelés visszaigazoló email elküldve:", body.userEmail);
    } catch (emailError) {
      console.error("❌ Email küldési hiba:", emailError);
      // Email hiba nem blokkolja a rendelést
    }

    // Placeholder válasz - Backend cseréli ki Stripe-ra
    return NextResponse.json({
      success: true,
      message: "Rendelés fogadva - Stripe integráció TODO",
      order: orderWithCalculation,
      // url: checkoutSession.url  // Backend uncomment-eli
    });

  } catch (error) {
    console.error("Order API error:", error);
    return NextResponse.json(
      { error: "Hiba történt a rendelés feldolgozása során" },
      { status: 500 }
    );
  }
}
