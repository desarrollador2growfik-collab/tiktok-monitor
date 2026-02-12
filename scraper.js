const { chromium } = require('playwright');
const fs = require('fs');
const https = require('https');

const USERNAME = "Anyafer_";
const WEBHOOK_URL = "https://8pro.growfik.com/webhook/3e830f4a-1b18-49eb-9c5b-5e5e277bd11c";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
  });

  const page = await context.newPage();

  try {
    console.log("Opening profile...");

    await page.goto(`https://www.tiktok.com/@${USERNAME}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await page.waitForSelector('a[href*="/video/"]', { timeout: 20000 });

    const links = await page.$$eval('a[href*="/video/"]', els =>
      [...new Set(els.map(e => e.href))].slice(0, 2)
    );

    console.log("Found videos:", links);

    if (links.length < 2) {
      console.log("Not enough videos found.");
      await browser.close();
      return;
    }

    let lastSaved = [];

    if (fs.existsSync('last.json')) {
      lastSaved = JSON.parse(fs.readFileSync('last.json'));
    }

    const changed = JSON.stringify(links) !== JSON.stringify(lastSaved);

    if (changed) {
      console.log("Change detected!");

      fs.writeFileSync('last.json', JSON.stringify(links, null, 2));

      const data = JSON.stringify({ videos: links });

      const url = new URL(WEBHOOK_URL);

      const options = {
        hostname: url.hostname,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };

      const req = https.request(options, res => {
        console.log("Webhook status:", res.statusCode);
      });

      req.on('error', error => {
        console.error("Webhook error:", error);
      });

      req.write(data);
      req.end();
    } else {
      console.log("No changes detected.");
    }

  } catch (err) {
    console.error("Error:", err);
  }

  await browser.close();
})();
