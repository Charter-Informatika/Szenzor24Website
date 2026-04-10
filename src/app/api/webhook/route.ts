import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { sendOrderConfirmationEmail } from "@/lib/orderEmail";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.WEBHOOK_SECRET!; 

export async function POST(req: Request) {
  try {
    const body = await req.text(); 
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      console.error("❌ Hiányzó Stripe signature");
      return NextResponse.json({ error: "Hiányzó Stripe signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
    
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`❌ Webhook signature hiba: ${err.message}`);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`✅ Sikeres Stripe fizetés érkezett! Session ID: ${session.id}`);

      const metadata = session.metadata;
      if (!metadata) {
        console.error("❌ Hiányzó metaadatok a sessionben!");
        return NextResponse.json({ received: true });
      }

      try {
        const orderDataForEmail = {
          userId: metadata.userId,
          userEmail: metadata.userEmail,
          userName: metadata.userName,
          userPhone: metadata.userPhone || "",
          currency: "HUF",
          locale: "hu-HU",
          payment: { mode: "stripe" },

          szenzorok: metadata.szenzorok ? JSON.parse(metadata.szenzorok) : [],
          anyag: metadata.anyag ? JSON.parse(metadata.anyag) : null,
          doboz: metadata.doboz ? JSON.parse(metadata.doboz) : null,
          colors: metadata.colors ? JSON.parse(metadata.colors) : null,
          tapellatas: metadata.tapellatas ? JSON.parse(metadata.tapellatas) : null,
          elofizetes: metadata.elofizetes ? JSON.parse(metadata.elofizetes) : null,
          shipping: metadata.shipping ? JSON.parse(metadata.shipping) : null,

          subtotal: parseInt(metadata.subtotal || "0"),
          vatPercent: parseInt(metadata.vatPercent || "27"),
          vatAmount: parseInt(metadata.vatAmount || "0"),
          shippingFee: parseInt(metadata.shippingFee || "0"),
          total: parseInt(metadata.total || "0"),
        };

        console.log(`📨 Fizetést igazoló email küldése neki: ${orderDataForEmail.userEmail}`);
        
        await sendOrderConfirmationEmail(orderDataForEmail as any);
        
        console.log("✅ Email sikeresen elküldve!");
      } catch (parseOrEmailError) {
        console.error("❌ Hiba az adatok parse-olásakor vagy az email küldésekor:", parseOrEmailError);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error("❌ Webhook általános szerver hiba:", error);
    return NextResponse.json({ error: "Szerver hiba" }, { status: 500 });
  }
}