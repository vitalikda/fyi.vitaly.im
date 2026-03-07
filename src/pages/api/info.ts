import type { APIRoute } from "astro";
import type { ApiInfo } from "../../lib/types";

export const prerender = false;

interface CloudflareRequest extends Request {
  cf?: {
    city?: string;
    region?: string;
    regionCode?: string;
    country?: string;
    timezone?: string;
  };
}

export const GET: APIRoute = ({ request }) => {
  const req = request as CloudflareRequest;
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const country = request.headers.get("cf-ipcountry") ?? req.cf?.country ?? "unknown";
  const city = req.cf?.city ?? "unknown";
  const region = req.cf?.region ?? req.cf?.regionCode ?? "unknown";
  const timezone = req.cf?.timezone ?? "unknown";

  const body: ApiInfo = { ip, country, city, region, timezone };
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
  });
};
