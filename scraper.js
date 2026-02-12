const { chromium } = require('playwright');
const https = require('https');

const USERNAME = "Anyafer_";
const WEBHOOK_URL = "https://8pro.growfik.com/webhook/3e830f4a-1b18-49eb-9c5b-5e5e277bd11c";

(async () => {
  const browser = await chromium.launch({
    headless: true,
    proxy: {
      server: "http://zproxy.lum-superproxy.io:22225",
      username: "brd-customer-hl_25b9f45b-zone-tiktok",
      password: "liu6yd4ukvrh"
    }
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    locale: "es-CO",
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();

  try {
    console.log("Conectando con proxy residencial...");
    
    await page.goto(`https://www.tiktok.com/@${USERNAME}`, {
      waitUntil: "networkidle",
      timeout: 90000
    });

    console.log("Perfil cargado.");

    const html = await page.content();

    const match = html.match(
      /<script id="SIGI_STATE" type="application\/json">(.*?)<\/script>/
    );

    if (!match) {
      console.log("No se encontró el JSON interno de TikTok.");
      await browser.close();
      return;
    }

    const data = JSON.parse(match[1]);

    const items = Object.values(data.ItemModule || {});
    const videos = items.slice(0, 2).map(
      (item) =>
        `https://www.tiktok.com/@${USERNAME}/video/${item.id}`
    );

    console.log("Videos encontrados:", videos);

    if (!videos.length) {
      console.log("No hay videos.");
      await browser.close();
      return;
    }

    const payload = JSON.stringify({ videos });

    const url = new URL(WEBHOOK_URL);

    const req = https.request(
      {
        hostname: url.hostname,
        path: url.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": payload.length
        }
      },
      (res) => {
        console.log("Webhook status:", res.statusCode);
      }
    );

    req.on("error", (err) => {
      console.error("Error enviando webhook:", err);
    });

    req.write(payload);
    req.end();

  } catch (err) {
    console.error("Error general:", err);
  }

  await browser.close();
})();
