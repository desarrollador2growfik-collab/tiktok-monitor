const https = require("https");

const USERNAME = "Anyafer_";

const PROXY_HOST = "zproxy.lum-superproxy.io";
const PROXY_PORT = 22225;
const PROXY_USER = "brd-customer-hl_25b9f45b-zone-tiktok";
const PROXY_PASS = "liu6yd4ukvrh";

async function fetchTikTok() {
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
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",

        "Accept": "application/json, text/plain, */*",
        "Referer": `https://www.tiktok.com/@${USERNAME}`,
        "Origin": "https://www.tiktok.com",
        "Accept-Language": "en-US,en;q=0.9"
      }
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        console.log("STATUS:", res.statusCode);
        console.log("RAW RESPONSE:");
        console.log(data.substring(0, 500)); // mostrar primeros 500 chars
        resolve(data);
      });
    });

    req.on("error", reject);
    req.end();
  });
}

(async () => {
  try {
    console.log("Probando endpoint TikTok...");

    const response = await fetchTikTok();

    try {
      const json = JSON.parse(response);
      console.log("JSON válido recibido");
      console.log(json);
    } catch (e) {
      console.log("NO es JSON válido");
    }

  } catch (err) {
    console.error("Error general:", err);
  }
})();
