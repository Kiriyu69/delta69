export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  const HOMEPAGE = "https://alphadevs99.web.id/";
  const OLD_DOMAIN = "delta69.pages.dev";
  const CUSTOM_DOMAIN = "alphadevs99.web.id";

  if (url.hostname === OLD_DOMAIN) {
    url.hostname = CUSTOM_DOMAIN;
    return Response.redirect(url.toString(), 301);
  }

  const path = normalizePath(url.pathname);

  const WHITELIST = new Set([
    "",
    "index.html",
    "style.css",
    "script.js",
    "fs1.html",
    "vx-orion-core.js",
    "favicon.ico"
  ]);

  if (WHITELIST.has(path)) {
    return context.next();
  }

  const PLAYLIST_MAP = {
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

  const file = PLAYLIST_MAP[path];

  if (!file) {
    return Response.redirect(HOMEPAGE, 302);
  }

  if (isBlockedClient(request)) {
    return Response.redirect(HOMEPAGE, 302);
  }

  const rawUrl = buildRawUrl(file);

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
  const target = extractFirstUrl(text);

  if (!target) {
    return new Response("Invalid target", {
      status: 500
    });
  }

  return Response.redirect(target, 302);
}

function normalizePath(pathname) {
  return pathname
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();
}

function isBlockedClient(request) {
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

  return isBrowser || isDownloader;
}

function buildRawUrl(file) {
  return `https://raw.githubusercontent.com/Kiriyu69/delta69/main/data/${file}?v=${Date.now()}`;
}

function extractFirstUrl(text) {
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .find(line => line.startsWith("http"));
}