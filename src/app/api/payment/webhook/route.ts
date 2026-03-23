import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey) {
    return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY." }, { status: 500 });
  }

  if (!secretKey.startsWith("sk_test_")) {
    return NextResponse.json(
      { error: "Sandbox only endpoint: STRIPE_SECRET_KEY must be a test key (sk_test_...)." },
      { status: 400 },
    );
  }

  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET." }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2023-10-16" });
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Stripe checkout completed (sandbox):", {
        id: session.id,
        customerEmail: session.customer_details?.email,
        mode: session.mode,
      });
      break;
    }
    default:
      console.log("Unhandled Stripe webhook event (sandbox):", event.type);
  }

  return NextResponse.json({ received: true });
}
