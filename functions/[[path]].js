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

  // File homepage / static tetap normal
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
    "tnts4.m3u8": "tnts4.txt",
    "aniplus.m3u8": "aniplus.txt",
    "anibox.m3u8": "anibox.txt",
    "anione.m3u8": "anione.txt",
    "gtv.m3u8": "gtv.txt"
  };

  const file = map[path];

  // Selain URL playlist, arahkan ke homepage
  if (!file) {
    return Response.redirect(HOMEPAGE, 302);
  }

  const ua = (
    request.headers.get("user-agent") || ""
  ).toLowerCase();

  const accept =
    request.headers.get("accept") || "";

  const secFetchDest =
    request.headers.get("sec-fetch-dest") || "";

  const secFetchMode =
    request.headers.get("sec-fetch-mode") || "";

  // Blokir browser desktop/android
  // Jangan blokir dari kata chrome/safari/firefox,
  // karena player bisa pakai UA mirip browser.
  const isBrowser =
    accept.includes("text/html") ||
    secFetchDest === "document" ||
    secFetchMode === "navigate";

  // Blokir curl / downloader
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