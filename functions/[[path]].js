export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);

  const path = url.pathname
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();

  return new Response(
    JSON.stringify({
      hostname: url.hostname,
      pathname: url.pathname,
      path: path,
      accept: request.headers.get("accept"),
      secFetchDest: request.headers.get("sec-fetch-dest"),
      secFetchMode: request.headers.get("sec-fetch-mode"),
      referer: request.headers.get("referer")
    }, null, 2),
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}
