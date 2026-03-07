import type { APIRoute } from "astro";

export const prerender = false;

interface CloudflareRequest extends Request {
  cf?: {
    city?: string;
    region?: string;
    regionCode?: string;
    country?: string;
    colo?: string;
    timezone?: string;
  };
}

export const GET: APIRoute = ({ request }) => {
  const req = request as CloudflareRequest;
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const country = request.headers.get("cf-ipcountry") ?? req.cf?.country ?? "unknown";
  const city = req.cf?.city ?? "unknown";
  const region = req.cf?.region ?? req.cf?.regionCode ?? "unknown";
  const colo = req.cf?.colo ?? "unknown";
  const timezone = req.cf?.timezone ?? "unknown";

  return new Response(JSON.stringify({ ip, country, city, region, colo, timezone }), {
    headers: { "Content-Type": "application/json" },
  });
};
