export interface ApiInfo {
  ip: string;
  country: string;
  city: string;
  region: string;
  colo: string;
  timezone: string;
}

export interface InfoRow {
  label: string;
  value: string;
  category: string;
}

function countryToFlag(country: string): string {
  if (!country || country === "unknown" || country.length !== 2) return "";
  return country
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
    .join("");
}

const UNMASKED_VENDOR_WEBGL = 0x9245;
const UNMASKED_RENDERER_WEBGL = 0x9246;

function getGpuInfo(): { vendor: string; renderer: string } {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") ?? canvas.getContext("experimental-webgl");
    if (!gl) return { vendor: "", renderer: "" };
    const ext = (
      gl as WebGLRenderingContext & { getExtension(name: string): unknown }
    ).getExtension("WEBGL_debug_renderer_info");
    if (!ext) return { vendor: "", renderer: "" };
    const vendor =
      (gl as WebGLRenderingContext & { getParameter(p: number): string }).getParameter(
        UNMASKED_VENDOR_WEBGL,
      ) ?? "";
    const renderer =
      (gl as WebGLRenderingContext & { getParameter(p: number): string }).getParameter(
        UNMASKED_RENDERER_WEBGL,
      ) ?? "";
    return { vendor, renderer };
  } catch {
    return { vendor: "", renderer: "" };
  }
}

function getDateTimeInfo(): { local: string; timezone: string } {
  const now = new Date();
  const local = now.toLocaleString();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return { local, timezone: tz };
}

function getConnectionString(): string {
  if (typeof navigator === "undefined" || !("connection" in navigator)) return "";
  const c = (
    navigator as Navigator & {
      connection?: { effectiveType?: string; downlink?: number; rtt?: number };
    }
  ).connection;
  if (!c) return "";
  return `${c.effectiveType ?? "?"} · ${c.downlink ?? "?"} Mbps · RTT ${c.rtt ?? "?"} ms`;
}

function getClientInfo(apiInfo: ApiInfo | null): InfoRow[] {
  const nav = typeof navigator !== "undefined" ? navigator : null;
  const w = typeof window !== "undefined" ? window : null;
  const gpu = getGpuInfo();
  const dt = getDateTimeInfo();

  const rows: InfoRow[] = [];

  // Location: IP + city, region, country (merged)
  if (apiInfo) {
    const flag = countryToFlag(apiInfo.country);
    const ipVal = flag ? `${flag} ${apiInfo.ip}` : apiInfo.ip;
    rows.push({ label: "IP", value: ipVal, category: "Location" });
    const locationParts = [apiInfo.city, apiInfo.region, apiInfo.country].filter(
      (x) => x && x !== "unknown",
    );
    rows.push({
      label: "Location",
      value: locationParts.join(", ") || "—",
      category: "Location",
    });
  }

  // Screen: consolidated
  const screenW = w?.screen?.width ?? "";
  const screenH = w?.screen?.height ?? "";
  const dpr = w?.devicePixelRatio ?? "";
  const colorDepth = w?.screen?.colorDepth ?? "";
  const screenVal = [
    screenW && screenH ? `${screenW} × ${screenH}` : "",
    dpr ? `@${dpr}x` : "",
    colorDepth ? `${colorDepth}-bit` : "",
  ]
    .filter(Boolean)
    .join(" ");
  rows.push({ label: "Screen", value: screenVal || "—", category: "Screen" });
  rows.push({
    label: "Window",
    value:
      w?.innerWidth != null && w?.innerHeight != null ? `${w.innerWidth} × ${w.innerHeight}` : "—",
    category: "Screen",
  });

  // Device
  rows.push({
    label: "CPU",
    value: nav ? String(nav.hardwareConcurrency ?? "") : "",
    category: "Device",
  });
  rows.push({
    label: "Memory",
    value:
      nav && "deviceMemory" in nav
        ? `${(nav as Navigator & { deviceMemory?: number }).deviceMemory} GB`
        : "",
    category: "Device",
  });
  rows.push({
    label: "Touch",
    value: nav ? String(nav.maxTouchPoints ?? 0) : "",
    category: "Device",
  });

  // System: Network, GPU, Time (merged)
  const conn = getConnectionString();
  if (conn) rows.push({ label: "Network", value: conn, category: "System" });
  const gpuVal = [gpu.vendor, gpu.renderer].filter(Boolean).join(" · ");
  if (gpuVal) rows.push({ label: "GPU", value: gpuVal, category: "System" });
  rows.push({ label: "Time", value: dt.local, category: "System" });
  rows.push({ label: "Timezone", value: dt.timezone, category: "System" });

  // Browser (compact)
  rows.push({
    label: "User Agent",
    value: nav?.userAgent ?? "",
    category: "Browser",
  });
  rows.push({
    label: "Platform",
    value: [nav?.platform, nav?.language].filter(Boolean).join(" · ") || "—",
    category: "Browser",
  });

  return rows;
}

function escapeHtml(s: string): string {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

export async function initClientInfo(rootId = "browser-info-root"): Promise<void> {
  const root = document.getElementById(rootId);
  if (!root) return;

  let apiInfo: ApiInfo | null = null;
  try {
    const res = await fetch("/api/info");
    if (res.ok) apiInfo = (await res.json()) as ApiInfo;
  } catch {
    // API fetch failed (e.g. static preview), continue with client-only data
  }

  const rows = getClientInfo(apiInfo);
  const byCategory = rows.reduce<Record<string, InfoRow[]>>((acc, row) => {
    (acc[row.category] = acc[row.category] || []).push(row);
    return acc;
  }, {});

  const order = ["Location", "Screen", "Device", "System", "Browser"];
  const fullWidthCards = ["Browser"];

  let html = '<div class="grid grid-cols-1 md:grid-cols-2 gap-3">';

  for (const cat of order) {
    const items = byCategory[cat];
    if (!items?.length) continue;

    const cardClasses = fullWidthCards.includes(cat) ? "md:col-span-2" : "";
    const tableClass = "table table-xs";

    html += `
      <div class="card bg-base-100 shadow-xl card-compact ${cardClasses}">
        <div class="card-body p-3">
          <h2 class="card-title text-base text-primary">${escapeHtml(cat)}</h2>
          <div class="overflow-x-auto">
            <table class="${tableClass}">
              <tbody>
                ${items
                  .map(
                    (r) => `
                  <tr>
                    <td class="font-medium text-base-content/80 w-28 whitespace-nowrap">${escapeHtml(r.label)}</td>
                    <td class="font-mono text-sm break-all">${escapeHtml(r.value || "—")}</td>
                  </tr>`,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  html += "</div>";
  root.innerHTML = html;
}
