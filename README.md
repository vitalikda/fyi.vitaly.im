# Browser Info App

A small web app that shows your browser and device information. Built with **Astro**, deployed on **Cloudflare** (Pages/Workers), and styled with **DaisyUI** (Tailwind).

## What it shows

- **IP Address**: Your IP and country (from Cloudflare headers)
- **Region**: City, region, colo (Cloudflare data center)
- **Browser**: User agent, vendor, platform, language, cookies, Do Not Track
- **Device**: CPU cores, device memory, max touch points
- **Network**: Connection type and quality (when available)
- **Screen**: Dimensions, pixel ratio, color depth, orientation
- **GPU**: WebGL vendor and renderer
- **Date and Time**: Local datetime, timezone, UTC offset

Browser, device, screen, GPU, and date/time data are read client-side from `navigator`, `window`, and WebGL. IP and region come from the `/api/info` server route (Cloudflare request metadata).

This project uses **pnpm**. Install with `pnpm install` (or enable [Corepack](https://nodejs.org/api/corepack.html) so the `packageManager` field is respected).

## Commands

| Command          | Action                                   |
| ---------------- | ---------------------------------------- |
| `pnpm dev`       | Start dev server at `localhost:4321`     |
| `pnpm build`     | Build for Cloudflare (output in `dist/`) |
| `pnpm preview`   | Preview production build locally         |
| `pnpm typecheck` | Run TypeScript check                     |

## Deploy to Cloudflare

1. Install [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) and log in.
2. From the project root:
   - **Cloudflare Pages**: connect the repo in the dashboard and set build command `pnpm run build` (or `pnpm build`) and output directory `dist`, or use `pnpm exec wrangler pages deploy dist`.
   - **Workers**: run `pnpm exec wrangler deploy` (uses `wrangler.jsonc`).

## Stack

- [Astro](https://astro.build)
- [Tailwind CSS](https://tailwindcss.com) + [DaisyUI](https://daisyui.com)
- [@astrojs/cloudflare](https://docs.astro.build/en/guides/deploy/cloudflare/)
