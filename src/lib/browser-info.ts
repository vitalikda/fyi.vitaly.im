const UNMASKED_RENDERER_WEBGL = 0x9246;

export function getGpuRenderer(): string {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") as WebGL2RenderingContext | null;
    if (!gl) return "";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (!ext) return "";
    return gl.getParameter(UNMASKED_RENDERER_WEBGL) ?? "";
  } catch {
    return "";
  }
}

export function getConnection(): string {
  if (!("connection" in navigator)) return "";
  const c = (
    navigator as Navigator & {
      connection?: { effectiveType?: string; downlink?: number; rtt?: number };
    }
  ).connection;
  if (!c) return "";
  return `${c.effectiveType ?? "?"} · ${c.downlink ?? "?"} Mbps · RTT ${c.rtt ?? "?"} ms`;
}

export function countryToFlag(code: string): string {
  if (!code || code === "unknown" || code.length !== 2) return "";
  return code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
    .join("");
}
