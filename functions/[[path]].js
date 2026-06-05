export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname.replace(/^\/+|\/+$/g, "").toLowerCase();

  const map = {
    "tnts1.m3u8": "tnts1.txt",
    "tnts2.m3u8": "tnts2.txt",
    "tnts3.m3u8": "tnts3.txt",
    "tnts4.m3u8": "tnts4.txt"
  };

  if (!map[path]) {
    return new Response("Not found", { status: 404 });
  }

  const res = await fetch(`${url.origin}/data/${map[path]}`, {
    headers: {
      "cache-control": "no-cache"
    }
  });

  const target = (await res.text()).trim();

  if (!target.startsWith("http")) {
    return new Response("Invalid target", { status: 500 });
  }

  return Response.redirect(target, 302);
}
