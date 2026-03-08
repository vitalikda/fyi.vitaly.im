import { useEffect, useState } from "preact/hooks";
import type { ApiInfo } from "../lib/types";
import { countryToFlag, getConnection, getGpuRenderer } from "../lib/browser-info";
import { InfoCard } from "./info-card";

function InfoRow({ label, value }: { label: string; value: string | preact.ComponentChildren }) {
  return (
    <tr>
      <td class="font-medium text-base-content/60 w-28 whitespace-nowrap">{label}</td>
      <td class="font-mono text-sm break-all">{value || "—"}</td>
    </tr>
  );
}

function BrowserInfo() {
  const [apiInfo, setApiInfo] = useState<ApiInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/info")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setApiInfo(data as ApiInfo | null);
      })
      .catch(() => setApiInfo(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div class="flex justify-center py-8">
        <span class="loading loading-spinner loading-md text-primary" />
      </div>
    );
  }

  const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const ipTz = apiInfo?.timezone;
  const tzMismatch = ipTz && ipTz !== "unknown" && ipTz !== browserTz;

  const locationParts = apiInfo
    ? [apiInfo.city, apiInfo.region, apiInfo.country].filter((x) => x && x !== "unknown")
    : [];
  const flag = apiInfo ? countryToFlag(apiInfo.country) : "";
  const ipVal = flag && apiInfo ? `${flag} ${apiInfo.ip}` : (apiInfo?.ip ?? "—");

  return (
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      {apiInfo && (
        <InfoCard title="Location">
          <table class="table table-xs">
            <tbody>
              <InfoRow label="IP" value={ipVal} />
              <InfoRow label="Location" value={locationParts.join(", ") || "—"} />
            </tbody>
          </table>
        </InfoCard>
      )}

      <InfoCard title="Screen">
        <table class="table table-xs">
          <tbody>
            <InfoRow
              label="Screen"
              value={
                [
                  window.screen?.width && window.screen?.height
                    ? `${window.screen.width} × ${window.screen.height}`
                    : "",
                  window.devicePixelRatio ? `@${window.devicePixelRatio}x` : "",
                  window.screen?.colorDepth ? `${window.screen.colorDepth}-bit` : "",
                ]
                  .filter(Boolean)
                  .join(" ") || "—"
              }
            />
            <InfoRow
              label="Window"
              value={
                window.innerWidth != null && window.innerHeight != null
                  ? `${window.innerWidth} × ${window.innerHeight}`
                  : "—"
              }
            />
          </tbody>
        </table>
      </InfoCard>

      <InfoCard title="Device">
        <table class="table table-xs">
          <tbody>
            <InfoRow label="CPU" value={String(navigator.hardwareConcurrency ?? "")} />
            <InfoRow
              label="Memory"
              value={
                "deviceMemory" in navigator
                  ? `${(navigator as Navigator & { deviceMemory?: number }).deviceMemory} GB`
                  : ""
              }
            />
            <InfoRow label="Touch" value={String(navigator.maxTouchPoints ?? 0)} />
          </tbody>
        </table>
      </InfoCard>

      <InfoCard title="System">
        <table class="table table-xs">
          <tbody>
            <InfoRow label="Network" value={getConnection()} />
            <InfoRow label="GPU" value={getGpuRenderer()} />
            <InfoRow
              label="Timezone"
              value={
                <>
                  {browserTz}
                  {tzMismatch && (
                    <span class="tooltip" data-tip="This is the timezone of the IP address">
                      <span class="badge badge-soft badge-primary badge-sm ml-2">{ipTz}</span>
                    </span>
                  )}
                </>
              }
            />
          </tbody>
        </table>
      </InfoCard>

      <InfoCard title="Browser" class="md:col-span-2">
        <table class="table table-xs">
          <tbody>
            <InfoRow label="User Agent" value={navigator.userAgent} />
            <InfoRow
              label="Platform"
              value={
                [
                  (
                    navigator as Navigator & {
                      userAgentData?: { platform: string };
                    }
                  ).userAgentData?.platform ?? navigator.platform,
                  navigator.language,
                ]
                  .filter(Boolean)
                  .join(" · ") || "—"
              }
            />
          </tbody>
        </table>
      </InfoCard>
    </div>
  );
}

export default BrowserInfo;
