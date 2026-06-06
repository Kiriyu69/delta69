export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);

  const HOMEPAGE = "https://alphadevs99.web.id/";

  // Redirect domain lama ke custom domain
  if (url.hostname === "delta69.pages.dev") {
    url.hostname = "alphadevs99.web.id";
    return Response.redirect(url.toString(), 301);
  }

  const path = url.pathname
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();

  // Homepage / file statis tetap normal
  if (
    path === "" ||
    path === "index.html" ||
    path === "style.css" ||
    path === "script.js" ||
    path === "favicon.ico"
  ) {
    return context.next();
  }

  const map = {
    "tnts1.m3u8": "tnts1.txt",
    "tnts2.m3u8": "tnts2.txt",
    "tnts3.m3u8": "tnts3.txt",
    "tnts4.m3u8": "tnts4.txt"
  };

  const file = map[path];

  // Selain path playlist, balik ke homepage
  if (!file) {
    return Response.redirect(HOMEPAGE, 302);
  }

  const ua = request.headers.get("user-agent") || "";
  const accept = request.headers.get("accept") || "";
  const secFetchDest = request.headers.get("sec-fetch-dest") || "";
  const secFetchMode = request.headers.get("sec-fetch-mode") || "";

  const lowerUA = ua.toLowerCase();

  // Block browser langsung
  const isBrowser =
    accept.includes("text/html") ||
    secFetchDest === "document" ||
    secFetchMode === "navigate" ||
    lowerUA.includes("chrome") ||
    lowerUA.includes("firefox") ||
    lowerUA.includes("safari") ||
    lowerUA.includes("edge") ||
    lowerUA.includes("opr");

  // Block curl / downloader
  const isBlockedTool =
    lowerUA.includes("curl") ||
    lowerUA.includes("wget") ||
    lowerUA.includes("httpie") ||
    lowerUA.includes("aria2") ||
    lowerUA.includes("axel") ||
    lowerUA.includes("idm") ||
    lowerUA.includes("internet download manager") ||
    lowerUA.includes("adm") ||
    lowerUA.includes("advanced download manager");

  // Player / OTT yang diizinkan
  const isOTT =
    lowerUA.includes("ott") ||
    lowerUA.includes("tivimate") ||
    lowerUA.includes("vlc") ||
    lowerUA.includes("kodi") ||
    lowerUA.includes("exoplayer") ||
    lowerUA.includes("mxplayer") ||
    lowerUA.includes("iptv") ||
    lowerUA.includes("dalvik") ||
    lowerUA.includes("lavf") ||
    lowerUA.includes("nsplayer");

  if (isBlockedTool || isBrowser || !isOTT) {
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