import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { prisma } from "@/lib/prismaDB";
import { OrderPayload } from "@/types/order";

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

    // Validáció - kötelező mezők
    if (!body.szenzorok || body.szenzorok.length === 0 || !body.eszkoz || !body.doboz || !body.tapellatas) {
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

    if (!body.userId || !body.userEmail) {
      return NextResponse.json(
        { error: "Hiányzó felhasználó adatok" },
        { status: 400 }
      );
    }

    // Összeg újraszámolás (biztonság kedvéért)
    const szenzorokTotal = body.szenzorok.reduce((sum, sz) => sum + sz.price * sz.quantity, 0);
    const calculatedSubtotal =
      szenzorokTotal +
      body.eszkoz.price * body.eszkoz.quantity +
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

    // Placeholder válasz - Backend cseréli ki
    return NextResponse.json({
      success: true,
      message: "Rendelés fogadva - Stripe integráció TODO",
      order: {
        ...body,
        subtotal: calculatedSubtotal,
        vatAmount: vatAmount,
        total: total,
      },
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
