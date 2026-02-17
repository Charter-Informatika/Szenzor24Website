import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";

export async function GET() {
  try {
    const [
      sensors,
      boxes,
      colors,
      powerOptions,
      subscriptions,
      materials,
      shippingPrices,
    ] = await Promise.all([
      prisma.shop_sensors.findMany({
        where: { isActive: true },
        orderBy: { sort: "asc" },
      }),
      prisma.shop_boxes.findMany({
        where: { isActive: true },
        orderBy: { sort: "asc" },
      }),
      prisma.shop_colors.findMany({
        where: { isActive: true },
        orderBy: { sort: "asc" },
      }),
      prisma.shop_power_options.findMany({
        where: { isActive: true },
        orderBy: { sort: "asc" },
      }),
      prisma.shop_subscriptions.findMany({
        where: { isActive: true },
        orderBy: { sort: "asc" },
      }),
      prisma.shop_materials.findMany({
        where: { isActive: true },
        orderBy: { sort: "asc" },
      }),
      prisma.shop_shipping_prices.findMany(),
    ]);

    return NextResponse.json({
      sensors,
      boxes,
      colors,
      powerOptions,
      subscriptions,
      materials,
      shippingPrices,
    });
  } catch (err) {
    console.error("SHOP META ERROR:", err);
    return NextResponse.json({ error: "meta load failed" }, { status: 500 });
  }
}
