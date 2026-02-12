const { chromium } = require('playwright');
const https = require('https');

const USERNAME = "Anyafer_";
const WEBHOOK_URL = "https://8pro.growfik.com/webhook/3e830f4a-1b18-49eb-9c5b-5e5e277bd11c";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log("Opening profile...");

    await page.goto(`https://www.tiktok.com/@${USERNAME}`, {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    const content = await page.content();

    const jsonMatch = content.match(/<script id="SIGI_STATE" type="application\/json">(.*?)<\/script>/);

    if (!jsonMatch) {
      console.log("Could not find profile data.");
      await browser.close();
      return;
    }

    const data = JSON.parse(jsonMatch[1]);

    const items = Object.values(data.ItemModule || {});
    const latest = items.slice(0, 2).map(item =>
      `https://www.tiktok.com/@${USERNAME}/video/${item.id}`
    );

    console.log("Latest videos:", latest);

    if (latest.length === 0) {
      console.log("No videos found.");
      await browser.close();
      re
