#!/usr/bin/env node

/**
 * Szerver ellenőrzés script
 * Futtatás: node check-server.js
 */

const http = require("http");

const SERVER = "192.168.88.210";
const PORT = 3000;

function checkServer() {
  console.log(`\n🔍 Szerver ellenőrzés: http://${SERVER}:${PORT}\n`);

  const options = {
    hostname: SERVER,
    port: PORT,
    path: "/api/orders/create",
    method: "OPTIONS",
    timeout: 3000,
  };

  const req = http.request(options, (res) => {
    console.log("✅ SZERVER ELÉRHETŐ!");
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   URL: http://${SERVER}:${PORT}\n`);
  });

  req.on("error", (error) => {
    console.log("❌ SZERVER NEM ELÉRHETŐ!\n");
    console.log("Lehetséges okok:");
    console.log(
      `  1. A szerver (${SERVER}:${PORT}) nem fut`
    );
    console.log(`  2. Rossz az IP cím (${SERVER})`);
    console.log(`  3. Rossz a port (${PORT})`);
    console.log("  4. Firewall blokkolja az összeköttetést\n");
    console.log("Hiba detailok:");
    console.log(`  ${error.message}\n`);
  });

  req.on("timeout", () => {
    req.destroy();
    console.log("❌ TIMEOUT! A szerver nem válaszol 3 másodpercen belül\n");
  });

  req.end();
}

checkServer();
