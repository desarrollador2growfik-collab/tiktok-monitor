const { chromium } = require('playwright');
const https = require('https');

const USERNAME = "Anyafer_";
const WEBHOOK_URL = "https://8pro.growfik.com/webhook/3e830f4a-1b18-49eb-9c5b-5e5e277bd11c";

(async () => {
  const browser = await chromium.launch({
    headless: true,
    proxy: {
      server: "http://brd.superproxy.io:33335",
      username: "brd-customer-hl_25b9f45b-zone-tiktok",
      password: "liu6yd4ukvrh"
    }
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    locale: "es-CO"
  });

  const page = await context.newPage();

  try {
    console.log("Abriendo perfil con proxy...");

    await page.goto(`https://www.tiktok.com/@${USERNAME}`, {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    await page.waitForTimeout(5000);

    const content = await page.content();

    const jsonMatch = content.match(
      /<script id="SIGI_STATE" type="application\/json">(.*?)<\/script>/
    );

    if (!jsonMatch) {
      console.log("No se pudieron encontrar los datos del perfil.");
      await browser.close();
      return;
    }

    const data = JSON.parse(jsonMatch[1]);

    const items = Object.values(data.ItemModule || {});
    const latest = items.slice(0, 2).map(
      (item) =>
        `https://www.tiktok.com/@${USERNAME}/video/${item.id}`
    );

    console.log("Videos encontrados:", latest);

    if (latest.length === 0) {
      console.log("No se encontraron videos.");
      await browser.close();
      return;
    }

    const payload = JSON.stringify({ videos: latest });

    const url = new URL(WEBHOOK_URL);

    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": payload.length
      }
    };

    const req = https.request(options, (res) => {
      console.log("Webhook status:", res.statusCode);
    });

    req.on("error", (err) => {
      console.error("Error webhook:", err);
    });

    req.write(payload);
    req.end();

  } catch (err) {
    console.error("Error general:", err);
  }

  await browser.close();
})();
