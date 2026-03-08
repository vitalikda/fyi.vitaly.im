# fyi.vitaly.im

A tiny web app that tells you things about yourself. Your browser knows more than you think.

## What you'll see

- **Location** — IP address, city, region, country (via Cloudflare)
- **Screen** — resolution, pixel ratio, color depth, window size
- **Device** — CPU cores, memory, touch points
- **System** — network type, GPU, timezone
- **Browser** — user agent, platform, language

## Get started

```bash
pnpm install
pnpm dev
```

Open [localhost:4321](http://localhost:4321) and meet your browser.

## Commands

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview the build |
| `pnpm typecheck` | Check types |
| `pnpm lint` | Lint with oxlint |
| `pnpm format` | Format with oxfmt |

## Deploy

```bash
pnpm build
pnpm exec wrangler deploy
```

Or connect the repo to Cloudflare Pages and let it do its thing.

## Built with

[Astro](https://astro.build) + [Preact](https://preactjs.com) + [Tailwind](https://tailwindcss.com) + [DaisyUI](https://daisyui.com) + [Cloudflare](https://cloudflare.com)
