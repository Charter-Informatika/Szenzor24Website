#!/usr/bin/env node

/**
 * Teszt script - Order JSON küldése
 * Futtatás: node test-order.js
 */

const axios = require("axios");

const mockOrder = {
  userId: "test-user-123",
  userEmail: "test@example.com",
  userName: "Test User",
  szenzorok: [
    { id: "htu21d", name: "HTU21D", price: 5000, quantity: 1 },
    { id: "mpu6050", name: "MPU-6050", price: 6000, quantity: 1 },
    { id: "homerseklet", name: "Hőmérséklet szenzor", price: 4500, quantity: 1 },
  ],
  anyag: {
    id: "uv_allo_pla",
    name: "UV álló PLA",
    price: 1500,
    quantity: 1,
  },
  doboz: {
    id: "muanyag",
    name: "Műanyag doboz",
    price: 2000,
    quantity: 1,
  },
  tapellatas: {
    id: "napelemes",
    name: "Napelemes",
    price: 12000,
    quantity: 1,
  },
  colors: {
    dobozSzin: { id: "sarga", name: "Sárga" },
    tetoSzin: { id: "feher", name: "Fehér" },
  },
  subtotal: 31000,
  vatPercent: 27,
  vatAmount: 8370,
  total: 39370,
  currency: "HUF",
  createdAt: new Date().toISOString(),
  locale: "hu-HU",
};

async function testOrder() {
  try {
    console.log("📤 Order JSON küldés...\n");
    console.log("URL:", "http://192.168.88.210:3000/api/orders/create");
    console.log("Payload:", JSON.stringify(mockOrder, null, 2));
    console.log("\n⏳ Várakozás a válaszra...\n");

    const response = await axios.post(
      "https://szenzor24.hu/api/orders/create",
      mockOrder,
      {
        timeout: 5000,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ SIKERES!\n");
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    console.error("❌ HIBA!\n");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else if (error.code === "ECONNREFUSED") {
      console.error("❌ Nem lehet csatlakozni a szerverhez!");
      console.error("   Szerver: http://192.168.88.210:3000");
      console.error("   Ellenőrizd, hogy az endpoint fut-e!");
    } else {
      console.error("Message:", error.message);
    }
  }
}

testOrder();
