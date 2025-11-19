# Stripe dokumentáció

## 1. Stripe Secret Key beszerzése
1. Developers tab
2. Api Keys tab, legörgetés a Secret Key-ig
3. Ki kell másolni
4. .env fájlba bele kell másolni: ```STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY```

## 2. Stripe Dashboardon belül Product regisztrálása
Most hogy az API kulcs bent van a **.env**-ben, kell a Dashboardba Productot tenni

1. Products tab
2. Add a Product
3. Product adatait megadni, majd Save Product
    * Látni kell a productot a Dashboardon

## 3. Product Data beszerzése
priceId és price kell egy ```stripe/priceData.ts``` fájlban.

```
export const pricingData = [
    {
        id: "price_valami",
        unit_amount: 100 * 100,
        nickname: "Basic",
    },
    {
        id: "price_valami",
        unit_amount: 200 * 100,
        nickname: "Premium",
    },
    {
        id: "price_valami",
        unit_amount: 300 * 100,
        nickname: "Business",
    },
];
```

*Megjegyzés: a priceID a product page-ben megtalálható*

Ha ez megvan, akkor a **Dashboard**on, illetve a frontend **/pricing** oldalán látni fogod a termékeket

## 4. Webhook intergráció
Megvan a subscription setup, most a Stripe webhookot kell integrálni

1. Developers oldal Webhooks tabja
2. Add endpoint gomb
3. Test in a local environment
4. Le kell tölteni a [Stripe CLI](https://docs.stripe.com/stripe-cli)-t és belépni: ```stripe login```
5. Ezzel a paranccsal továbbítjuk az eventet a webhooknak: ```npm run stripe:listen```
6. Ez adni fog egy webhook secretet, ezt a *.env*-be kell betenni: ```STRIPE_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET```

## 5. PRODUCTION KÖRNYEZET
Az előző környezet **lokálisan** futott, át kell tenni productionra.
1. Developers oldal Webhooks tabja
2. be kell írni a site URL-t az Endpoint URL mezőbe a **következő módon**: ```yoursite.com/api/webhooks/stripe```
3. Drop-down menüből a *Latest API version*t kell kiválasztani
4. Select Events gomb
    * Select all events kiválasztás, majd Add events gomb
5. Add endpoint gomb

### Hosted endpoints menü a Developers/webhooks alatt
1. URL-re rányomni
2. Reveal a Signing secret alatt, ezt kimásolni a live oldal .env-jébe
3. Ha ez megvan akkor npm run dev, a ```localhost:3000```-en fog futni.