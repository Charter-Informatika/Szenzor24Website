// Vásárlás/Rendelés típusok - Backend használja a Stripe-hoz

export interface OrderItem {
  id: string;
  name: string;
  price: number; // Forintban, ÁFA nélkül
  quantity: number;
}

export interface OrderColors {
  dobozSzin: {
    id: string;
    name: string;
  };
  tetoSzin: {
    id: string;
    name: string;
  };
}

export interface OrderPayload {
  // Felhasználó adatok
  userId: string;
  userEmail: string;

  // Kiválasztott termékek
  szenzorok: OrderItem[]; // Max 3 szenzor lehet!
  eszkoz: OrderItem;
  doboz: OrderItem;
  tapellatas: OrderItem;

  // Színek (nem befolyásolja az árat)
  colors: OrderColors;

  // Összesítés
  subtotal: number;      // Nettó összeg (ÁFA nélkül)
  vatPercent: number;    // ÁFA százalék (pl. 27)
  vatAmount: number;     // ÁFA összeg
  total: number;         // Bruttó összeg (ÁFA-val)

  // Meta
  currency: "HUF";
  createdAt: string;     // ISO 8601 timestamp
  locale: "hu-HU";
}

// Példa JSON amit a frontend küld a backendnek:
/*
{
  "userId": "clx1234567890",
  "userEmail": "pelda@email.com",
  
  "szenzorok": [
    { "id": "homerseklet", "name": "Hőmérséklet szenzor", "price": 5000, "quantity": 1 },
    { "id": "paratartalom", "name": "Páratartalom szenzor", "price": 6000, "quantity": 1 },
    { "id": "ajto", "name": "Ajtó nyitás érzékelő", "price": 3000, "quantity": 1 }
  ],
  
  "eszkoz": {
    "id": "standard",
    "name": "Standard Modul",
    "price": 15000,
    "quantity": 1
  },
  
  "doboz": {
    "id": "fem",
    "name": "Fém doboz",
    "price": 4500,
    "quantity": 1
  },
  
  "tapellatas": {
    "id": "akkus",
    "name": "Akkumulátoros",
    "price": 5000,
    "quantity": 1
  },
  
  "colors": {
    "dobozSzin": {
      "id": "zold",
      "name": "Zöld"
    },
    "tetoSzin": {
      "id": "feher",
      "name": "Fehér"
    }
  },
  
  "subtotal": 38500,
  "vatPercent": 27,
  "vatAmount": 10395,
  "total": 48895,
  
  "currency": "HUF",
  "createdAt": "2026-02-02T14:30:00.000Z",
  "locale": "hu-HU"
}
*/
