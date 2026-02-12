const https = require("https");

const USERNAME = "Anyafer_";
const API_KEY = "897015ba-96fc-440a-9e00-2a2b9f6dedff";
const ZONE = "web_unlocker1";

function callBrightData(url) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      zone: ZONE,
      url: url,
      format: "json"
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
      res.on("data", chunk => data += chunk);
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
    console.log("Consultando endpoint JSON real de TikTok...");

    const apiUrl = `https://www.tiktok.com/api/post/item_list/?aid=1988&count=5&uniqueId=${USERNAME}`;

    const response = await callBrightData(apiUrl);

    const json = JSON.parse(response);

    if (!json.itemList || !json.itemList.length) {
      console.log("No se encontraron videos.");
      console.log(json);
      return;
    }

    const videos = json.itemList.slice(0, 2).map(
      item => `https://www.tiktok.com/@${USERNAME}/video/${item.id}`
    );

    console.log("Videos encontrados:");
    console.log(videos);

  } catch (err) {
    console.error("Error general:", err);
  }
})();
