import { NextRequest, NextResponse } from "next/server";

/**
 * Foxpost WebAPI integráció – szerver oldali route.
 *
 * Ez a route a Foxpost WebAPI-val kommunikál szerver oldalon,
 * így az API credentials (username, password, api-key) nem kerülnek a kliensre.
 *
 * Dokumentáció: https://foxpost.hu/uzleti-partnereknek/integracios-segedlet/webapi-integracio
 * Swagger (éles): https://webapi.foxpost.hu/swagger-ui/index.html
 * Swagger (sandbox): https://webapi-test.foxpost.hu/swagger-ui/index.html
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Szükséges .env változók:
 *
 *   FOXPOST_API_URL        – "https://webapi.foxpost.hu/api" (éles) vagy "https://webapi-test.foxpost.hu/api" (sandbox)
 *   FOXPOST_API_USERNAME   – Basic Auth username (foxpost.hu -> Beállítások)
 *   FOXPOST_API_PASSWORD   – Basic Auth password
 *   FOXPOST_API_KEY        – API-key header (foxpost.hu -> Beállítások -> Új generálása)
 *
 * Az üzleti partner regisztráció: https://foxpost.hu/uzleti-partner-regisztracio
 * Sandbox hozzáférés: b2chelpdesk@foxpost.hu
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * Végpontok:
 *
 * POST /api/foxpost/create-parcel
 *   Új csomag létrehozása a Foxpost rendszerében.
 *   Body: { destination, recipientName, recipientPhone, recipientEmail, size, cod?, comment?, refCode? }
 *
 * GET /api/foxpost/automata-list
 *   Csomagautomata lista lekérése (proxy a https://cdn.foxpost.hu/foxplus.json -hoz).
 *   Ez cache-elhető kliens oldalon is – a Foxpost óránként frissíti.
 */

// ──────────────────────────────────────
// Helpers
// ──────────────────────────────────────

function getFoxpostConfig() {
  const baseUrl = process.env.FOXPOST_API_URL;
  const username = process.env.FOXPOST_API_USERNAME;
  const password = process.env.FOXPOST_API_PASSWORD;
  const apiKey = process.env.FOXPOST_API_KEY;

  if (!baseUrl || !username || !password || !apiKey) {
    return null;
  }

  return { baseUrl, username, password, apiKey };
}

function buildFoxpostHeaders(apiKey: string, username: string, password: string) {
  const basicAuth = Buffer.from(`${username}:${password}`).toString("base64");
  return {
    "Content-Type": "Application/json",
    "Api-key": apiKey,
    Authorization: `Basic ${basicAuth}`,
  };
}

// ──────────────────────────────────────
// POST – Csomag létrehozása
// ──────────────────────────────────────

/**
 * POST /api/foxpost
 *
 * APM (csomagautomata) csomag létrehozása.
 *
 * Request body:
 * {
 *   "destination": "FP-HU-BUD-0115",        // operator_id a foxplus.json-ből
 *   "recipientName": "Teszt Elek",
 *   "recipientPhone": "+36201234567",
 *   "recipientEmail": "teszt@example.com",
 *   "size": "M",                             // XS, S, M, L, XL (raktárban kerül pontosításra)
 *   "cod": 0,                                // Utánvét (0 = nincs)
 *   "comment": "Szenzor csomag",             // max 50 karakter
 *   "refCode": "SZ24-ORD-00123"              // Belső rendelésazonosító (max 30 kar.)
 * }
 *
 * A Foxpost API válasza 201 Created esetén tartalmazza:
 *   clFoxId, barcode, destination, sendType ("APM"), stb.
 */
export async function POST(req: NextRequest) {
  const config = getFoxpostConfig();
  if (!config) {
    return NextResponse.json(
      {
        error: "Foxpost API nincs konfigurálva. Állítsd be a FOXPOST_API_* .env változókat!",
        hint: "Szükséges: FOXPOST_API_URL, FOXPOST_API_USERNAME, FOXPOST_API_PASSWORD, FOXPOST_API_KEY",
      },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();

    // Validáció
    const { destination, recipientName, recipientPhone, recipientEmail, size, cod, comment, refCode } = body;

    if (!destination || !recipientName || !recipientPhone || !recipientEmail) {
      return NextResponse.json(
        {
          error: "Hiányzó kötelező mező(k)",
          required: ["destination", "recipientName", "recipientPhone", "recipientEmail"],
        },
        { status: 400 }
      );
    }

    // Foxpost telefon validáció: ^(\+36|36)(20|30|31|70|50|51)\d{7}$
    const phoneRegex = /^(\+36|36)(20|30|31|70|50|51)\d{7}$/;
    if (!phoneRegex.test(recipientPhone)) {
      return NextResponse.json(
        {
          error: "Érvénytelen telefonszám formátum. Helyes: +36201234567",
          regex: "^(\\+36|36)(20|30|31|70|50|51)\\d{7}$",
        },
        { status: 400 }
      );
    }

    // APM Request Item összeállítása
    const apmRequestItem = {
      destination,
      recipientName,
      recipientPhone,
      recipientEmail,
      size: size || "M", // Alapértelmezetten M – a raktárban pontosítják
      cod: cod || 0,
      comment: comment ? String(comment).substring(0, 50) : null,
      refCode: refCode ? String(refCode).substring(0, 30) : null,
    };

    // Foxpost API hívás: POST /api/parcel
    const foxpostResponse = await fetch(`${config.baseUrl}/parcel`, {
      method: "POST",
      headers: buildFoxpostHeaders(config.apiKey, config.username, config.password),
      body: JSON.stringify([apmRequestItem]), // Array-ként kell küldeni!
    });

    const foxpostData = await foxpostResponse.json();

    if (foxpostResponse.status === 201) {
      // Sikeres létrehozás
      return NextResponse.json(
        {
          success: true,
          parcels: foxpostData,
        },
        { status: 201 }
      );
    }

    // Foxpost hiba válasz (200 = valid:false, 400/500 = hiba)
    return NextResponse.json(
      {
        success: false,
        foxpostStatus: foxpostResponse.status,
        foxpostData,
      },
      { status: foxpostResponse.status === 200 ? 422 : foxpostResponse.status }
    );
  } catch (error: any) {
    console.error("[Foxpost API] Error:", error);
    return NextResponse.json(
      { error: "Foxpost API hiba", details: error.message },
      { status: 500 }
    );
  }
}

// ──────────────────────────────────────
// GET – Automata lista (proxy/cache)
// ──────────────────────────────────────

/**
 * GET /api/foxpost
 *
 * Visszaadja a Foxpost csomagautomata listát.
 * Forrás: https://cdn.foxpost.hu/foxplus.json (óránként frissül)
 *
 * Ez hasznos ha a kliens oldalon saját térképet akarunk építeni a hivatalos
 * APT Finder widget helyett, vagy ha szűrni, keresni akarunk benne.
 *
 * A válasz Next.js revalidate-tel cache-elve van 1 órára.
 */
export async function GET() {
  try {
    const response = await fetch("https://cdn.foxpost.hu/foxplus.json", {
      next: { revalidate: 3600 }, // 1 óra cache
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Nem sikerült lekérni a Foxpost automata listát" },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Foxpost Automata List] Error:", error);
    return NextResponse.json(
      { error: "Hiba az automata lista lekérésekor", details: error.message },
      { status: 500 }
    );
  }
}
