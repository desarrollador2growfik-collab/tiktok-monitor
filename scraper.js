const https = require('https');

const USERNAME = "Anyafer_";

const PROXY_HOST = "zproxy.lum-superproxy.io";
const PROXY_PORT = 22225;
const PROXY_USER = "brd-customer-hl_25b9f45b-zone-tiktok";
const PROXY_PASS = "liu6yd4ukvrh";

const WEBHOOK_URL = "https://8pro.growfik.com/webhook/3e830f4a-1b18-49eb-9c5b-5e5e277bd11c";

function fetchTikTok() {
  return new Promise((resolve, reject) => {
    const options = {
      host: PROXY_HOST,
      port: PROXY_PORT,
      method: "GET",
      path: `https://www.tiktok.com/api/post/item_list/?aid=1988&count=5&uniqueId=${USERNAME}`,
      headers: {
        "Proxy-Authorization":
          "Basic " +
          Buffer.from(`${PROXY_USER}:${PROXY_PASS}`).toString("base64"),
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
      }
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    });

    req.on("error", reject);
    req.end();
  });
}

function sendWebhook(videos) {
  return new Promise((resolve, reject) => {
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
      (res) => resolve(res.statusCode)
    );

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

(async () => {
  try {
    console.log("Consultando endpoint interno de TikTok...");

    const response = await fetchTikTok();
    const json = JSON.parse(response);

    if (!json.itemList || !json.itemList.length) {
      console.log("No se encontraron videos.");
      console.log("Respuesta completa:", json);
      return;
    }

    const videos = json.itemList.slice(0, 2).map(
      (item) =>
        `https://www.tiktok.com/@${USERNAME}/video/${item.id}`
    );

    console.log("Videos encontrados:", videos);

    const status = await sendWebhook(videos);
    console.log("Webhook status:", status);

  } catch (err) {
    console.error("Error general:", err);
  }
})();
