export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const HOMEPAGE = "https://alphadevs99.web.id/";
  const OLD_DOMAIN = "delta69.pages.dev";
  const CUSTOM_DOMAIN = "alphadevs99.web.id";

  if (url.hostname === OLD_DOMAIN) {
    url.hostname = CUSTOM_DOMAIN;
    return Response.redirect(url.toString(), 301);
  }

  const path = normalizePath(url.pathname);

  if (path === "fs1") {
    return serveCleanUrlAsset(request, env, "/fs1.html");
  }

  if (path === "vx-orion-core.js") {
    return handleProtectedPlayerCore(request, context, HOMEPAGE);
  }

  if (STATIC_FILES.has(path)) {
    return context.next();
  }

  const file = PLAYLIST_MAP[path];

  if (!file) {
    return Response.redirect(HOMEPAGE, 302);
  }

  if (isBrowserRequest(request) || isDownloader(request)) {
    return Response.redirect(HOMEPAGE, 302);
  }

  const rawUrl = buildRawUrl(file);
  const target = await getTargetUrl(rawUrl);

  if (!target) {
    return new Response("Invalid target", {
      status: 500
    });
  }

  return Response.redirect(target, 302);
}

const STATIC_FILES = new Set([
  "",
  "index.html",
  "style.css",
  "script.js",
  "fs1.html",
  "favicon.ico",
  "robots.txt",
  "nyawits.png",
  "app.apk"
]);

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

function normalizePath(pathname) {
  return pathname
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();
}

function serveCleanUrlAsset(request, env, pathname) {
  const assetUrl = new URL(request.url);
  assetUrl.pathname = pathname;

  return env.ASSETS.fetch(
    new Request(assetUrl.toString(), request)
  );
}

function handleProtectedPlayerCore(request, context, homepage) {
  const referer = request.headers.get("referer") || "";

  const fromAllowedPage =
    referer.startsWith("https://alphadevs99.web.id/fs1") ||
    referer.startsWith("https://alphadevs99.web.id/fs1.html");

  if (isBrowserRequest(request) || !fromAllowedPage) {
    return Response.redirect(homepage, 302);
  }

  return context.next();
}

function isBrowserRequest(request) {
  const accept = request.headers.get("accept") || "";
  const secFetchDest = request.headers.get("sec-fetch-dest") || "";
  const secFetchMode = request.headers.get("sec-fetch-mode") || "";

  return (
    accept.includes("text/html") ||
    secFetchDest === "document" ||
    secFetchMode === "navigate"
  );
}

function isDownloader(request) {
  const ua = (request.headers.get("user-agent") || "").toLowerCase();

  return (
    ua.includes("curl") ||
    ua.includes("wget") ||
    ua.includes("httpie") ||
    ua.includes("aria2") ||
    ua.includes("axel") ||
    ua.includes("idm") ||
    ua.includes("internet download manager") ||
    ua.includes("adm") ||
    ua.includes("advanced download manager")
  );
}

function buildRawUrl(file) {
  return `https://raw.githubusercontent.com/Kiriyu69/delta69/main/data/${file}?v=${Date.now()}`;
}

async function getTargetUrl(rawUrl) {
  const res = await fetch(rawUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  if (!res.ok) {
    return null;
  }

  const text = await res.text();

  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .find(line => line.startsWith("http"));
}