export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname.replace(/^\/+|\/+$/g, "").toLowerCase();

  const map = {
    "tnts1.m3u8": "tnts1.txt",
    "tnts2.m3u8": "tnts2.txt",
    "tnts3.m3u8": "tnts3.txt",
    "tnts4.m3u8": "tnts4.txt"
  };

  const file = map[path];

  if (!file) {
    return new Response("Not found", { status: 404 });
  }

  const rawUrl = `https://raw.githubusercontent.com/Kiriyu69/delta69/main/data/${file}?v=${Date.now()}`;

  const res = await fetch(rawUrl, {
    headers: {
      "user-agent": "Mozilla/5.0"
    }
  });

  const text = await res.text();

  const target = text
    .split(/\r?\n/)
    .map(x => x.trim())
    .find(x => x.startsWith("http"));

  if (!target) {
    return new Response("Invalid target\n\n" + text, {
      status: 500
    });
  }

  return Response.redirect(target, 302);
}
