const https = require("https");

const USERNAME = "Anyafer_";
const API_KEY = "897015ba-96fc-440a-9e00-2a2b9f6dedff";
const ZONE = "web_unlocker1";

function callBrightData(url) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      zone: ZONE,
      url: url,
      format: "raw"
    });

    const options = {
      hostname: "api.brightdata.com",
      path: "/request",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Length": payload.length
      }
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        console.log("STATUS:", res.statusCode);
        resolve(data);
      });
    });

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

(async () => {
  try {
    console.log("Consultando TikTok con Web Unlocker...");

    const tiktokUrl = `https://www.tiktok.com/@${USERNAME}`;
    const response = await callBrightData(tiktokUrl);

    // Mostrar primeros 1000 caracteres para debug
    console.log("Respuesta parcial:");
    console.log(response.substring(0, 1000));

    // Intentar extraer JSON interno
    const match = response.match(/<script id="SIGI_STATE" type="application\/json">(.*?)<\/script>/);

    if (!match) {
      console.log("No se encontró SIGI_STATE.");
      return;
    }

    const json = JSON.parse(match[1]);

    const items =
      json?.ItemModule ? Object.values(json.ItemModule) : [];

    if (!items.length) {
      console.log("No se encontraron videos.");
      return;
    }

    const videos = items.slice(0, 2).map(
      (item) => `https://www.tiktok.com/@${USERNAME}/video/${item.id}`
    );

    console.log("Videos encontrados:");
    console.log(videos);

  } catch (err) {
    console.error("Error general:", err);
  }
})();
