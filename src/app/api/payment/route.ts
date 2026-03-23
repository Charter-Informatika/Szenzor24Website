import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { pricingData } from "@/stripe/pricingData";

type PaymentPayload = {
  priceId?: string;
  productId?: string;
};

type ResolvedPrice = {
  id: string;
  fromProduct: boolean;
};

function getBaseSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (!raw) {
    throw new Error("Missing NEXT_PUBLIC_SITE_URL or SITE_URL environment variable.");
  }

  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

async function resolvePriceId(stripe: Stripe, payload: PaymentPayload): Promise<ResolvedPrice> {
  const configuredProductId = process.env.STRIPE_PRODUCT_ID?.trim();

  // If a product ID is configured in env, always use that in sandbox mode.
  const productIdFromPayload = payload.productId || (payload.priceId?.startsWith("prod_") ? payload.priceId : undefined);
  const productId = productIdFromPayload || configuredProductId;

  if (productId) {
    const prices = await stripe.prices.list({
      product: productId,
      active: true,
      limit: 10,
    });

    const recurringPrice = prices.data.find((p) => p.type === "recurring" && p.active);
    if (!recurringPrice?.id) {
      throw new Error("No active recurring price found for the given productId.");
    }

    return { id: recurringPrice.id, fromProduct: true };
  }

  if (payload.priceId?.startsWith("price_")) {
    return { id: payload.priceId, fromProduct: false };
  }

  throw new Error("priceId or productId is required (or set STRIPE_PRODUCT_ID).");
}

export async function POST(request: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: "Missing STRIPE_SECRET_KEY." },
        { status: 500 },
      );
    }

    // Hard-stop if someone accidentally tries to use live mode here.
    if (!secretKey.startsWith("sk_test_")) {
      return NextResponse.json(
        { error: "Sandbox only endpoint: STRIPE_SECRET_KEY must be a test key (sk_test_...)." },
        { status: 400 },
      );
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: "2023-10-16",
    });

    const payload = (await request.json()) as PaymentPayload;
    const resolvedPrice = await resolvePriceId(stripe, payload);

    if (!resolvedPrice.fromProduct) {
      const allowedPriceIds = new Set(pricingData.map((item) => item.id));
      if (!allowedPriceIds.has(resolvedPrice.id)) {
        return NextResponse.json(
          { error: "Invalid or unsupported priceId." },
          { status: 400 },
        );
      }
    }

    const baseUrl = getBaseSiteUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: resolvedPrice.id,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/vasarlas/sikeres?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/vasarlas`,
      metadata: {
        environment: "sandbox",
      },
    });

    return NextResponse.json(session.url);
  } catch (error) {
    console.error("Stripe sandbox checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create Stripe Checkout session." },
      { status: 500 },
    );
  }
}
