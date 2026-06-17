export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);

  const HOMEPAGE = "https://alphadevs99.web.id/";

  if (url.hostname === "delta69.pages.dev") {
    url.hostname = "alphadevs99.web.id";
    return Response.redirect(url.toString(), 301);
  }

  const path = url.pathname
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();

  // /fs1 -> ambil file asli /fs1.html
  if (path === "fs1") {
    const assetUrl = new URL(request.url);
    assetUrl.pathname = "/fs1.html";

    return context.env.ASSETS.fetch(
      new Request(assetUrl.toString(), request)
    );
  }

  // Static normal
  if (
    path === "" ||
    path === "index.html" ||
    path === "style.css" ||
    path === "script.js" ||
    path === "fs1.html" ||
    path === "vx-orion-core.js" ||
    path === "favicon.ico" ||
    path === "robots.txt" ||
    path === "nyawits.png" ||
    path === "app.apk"
  ) {
    return context.env.ASSETS.fetch(request);
  }

  const map = {
    "tnts1.m3u8": "tnts1.txt",
    "tnts2.m3u8": "tnts2.txt",
    "tnts3.m3u8": "tnts3.txt",
    "tnts4.m3u8": "tnts4.txt",
    "aniplus.m3u8": "aniplus.txt",
    "anibox.m3u8": "anibox.txt",
    "anione.m3u8": "anione.txt",
    "animax.m3u8": "animax.txt",
    "anipluss.m3u8": "anipluss.txt",
    "gtv.m3u8": "gtv.txt"
  };

  const file = map[path];

  if (!file) {
    return new Response("Not found", {
      status: 404
    });
  }

  const ua = (request.headers.get("user-agent") || "").toLowerCase();
  const accept = request.headers.get("accept") || "";
  const secFetchDest = request.headers.get("sec-fetch-dest") || "";
  const secFetchMode = request.headers.get("sec-fetch-mode") || "";

  const isBrowser =
    accept.includes("text/html") ||
    secFetchDest === "document" ||
    secFetchMode === "navigate";

  const isDownloader =
    ua.includes("curl") ||
    ua.includes("wget") ||
    ua.includes("httpie") ||
    ua.includes("aria2") ||
    ua.includes("axel") ||
    ua.includes("idm") ||
    ua.includes("internet download manager") ||
    ua.includes("adm") ||
    ua.includes("advanced download manager");

  if (isBrowser || isDownloader) {
    return Response.redirect(HOMEPAGE, 302);
  }

  const rawUrl =
    `https://raw.githubusercontent.com/Kiriyu69/delta69/main/data/${file}?v=${Date.now()}`;

  const res = await fetch(rawUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  if (!res.ok) {
    return new Response("Source file not found", {
      status: 500
    });
  }

  const text = await res.text();

  const target = text
    .split(/\r?\n/)
    .map(x => x.trim())
    .find(x => x.startsWith("http"));

  if (!target) {
    return new Response("Invalid target", {
      status: 500
    });
  }

  return Response.redirect(target, 302);
}