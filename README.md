# SOLDRIP

**Devnet SOL. One drip at a time.**

SOLDRIP is a polished, production-ready Solana **Devnet** faucet: connect a
wallet, see your Devnet balance, claim test SOL, and watch the transaction
land — all wrapped in a cinematic, glassmorphic Web3 interface with a
custom-built animated ASCII/canvas background.

> ⚠️ **This project interacts with Solana Devnet only and does not
> distribute real SOL.**

---

## Features

- **Wallet connect** via `@solana/wallet-adapter-react` — Phantom and
  Solflare out of the box, plus any Wallet Standard wallet (Backpack
  included) auto-detected at runtime.
- **Live Devnet balance** with polling and an animated count-up on change.
- **One-click airdrop claims** with preset (0.5 / 1 / 2 SOL) and custom
  amounts, clamped to a configurable maximum.
- **Real transaction confirmation** — requests the airdrop, polls for
  confirmation, and surfaces the signature with a link to Solana Explorer.
- **Client-side cooldown** persisted in `localStorage` so a page refresh
  can't be used to spam the faucet.
- **Human-readable error handling** for rate limits, RPC failures, wallet
  rejections, network errors, and expired transactions.
- **A from-scratch ASCII/canvas renderer** — not a static image — that
  samples a source texture into a grid and redraws it every frame as one of
  19 render modes (pixels, characters, dots, dither, mosaic, hexagons,
  matrix rain, and more), with tone/color adjustments, post-effects
  (vignette, scanlines, chromatic edge, bloom, film grain), and five
  animation styles (flicker, wave, pulse, shimmer, ripple).
- Fully responsive, keyboard-navigable, and respects
  `prefers-reduced-motion`.

---

## Tech stack

| Layer      | Choice                                                                 |
| ---------- | ----------------------------------------------------------------------- |
| Framework  | React 18 + TypeScript, built with Vite                                 |
| Styling    | Tailwind CSS                                                           |
| Icons      | lucide-react                                                           |
| Solana     | `@solana/web3.js`, `@solana/wallet-adapter-react(-ui)`, `-wallets`      |
| Background | A custom canvas renderer — no third-party ASCII/art library            |

No state-management library, no CSS-in-JS, no UI kit beyond Tailwind — kept
intentionally lean so the repo is easy to read end to end.

---

## Architecture

```
src/
  components/
    AsciiBackground/   full-screen canvas background (mounts AsciiRenderer)
    Navbar/            logo, DEVNET badge, Explorer/GitHub links
    WalletButton/      "Connect Wallet" trigger -> wallet-adapter modal
    WalletStatus/      connected address, copy, disconnect
    BalanceCard/       live Devnet balance with animated count-up
    AirdropForm/       amount selector + claim button + result
    TransactionResult/ success (signature + Explorer link) / error state
    CooldownTimer/     countdown between claims
    Toast/             transient success/error notifications
    Footer/
  hooks/
    useWalletBalance.ts  polls the connected wallet's Devnet balance
    useAirdrop.ts        drives requestAirdrop -> confirmTransaction
    useCooldown.ts       localStorage-backed client-side rate limit
  lib/
    solana.ts            connection, formatting, validation, error mapping
    ascii/
      renderer.ts         AsciiRenderer class: sampling, loop, resize, DPR
      modes.ts             per-cell drawing for all 19 render modes
      colors.ts            brightness/contrast/saturation/tint math
      animation.ts          time-based per-cell modulation for 5 anim styles
      effects.ts            full-frame post effects
  providers/
    WalletContextProvider.tsx  Connection/Wallet/Modal providers, adapters
  types/
    index.ts             shared app + ASCII config types
  App.tsx
  main.tsx
  index.css
```

Nothing lives directly in `App.tsx` beyond composition — every piece of UI
and every side effect (balance polling, airdrop requests, cooldown state)
has its own file.

---

## How the ASCII renderer works

`AsciiRenderer` (in `src/lib/ascii/renderer.ts`) is a plain TypeScript class
— framework-agnostic, owns its own `requestAnimationFrame` loop — that
`AsciiBackground.tsx` mounts on a full-screen `<canvas>`.

1. **Sample.** The source (an image you provide, or a procedurally
   generated fallback texture — see below) is drawn into a small **offscreen
   canvas** sized to the grid (`width / cellSize` × `height / cellSize`),
   using `drawImage`'s scaling to do the downsampling cheaply.
2. **Read.** `getImageData` pulls that low-res canvas back out as raw RGBA,
   one read per resize/config change rather than per frame.
3. **Score each cell.** For every grid cell: average RGB → perceptual
   luminance → a 0–1 brightness value, plus a simple local-gradient "edge"
   score (difference from the right/bottom neighbor) that feeds
   `edgeEmphasis`.
4. **Render.** Each frame, every cell's brightness is adjusted by
   `contrast`, `edgeEmphasis`, `invert`, and a **time-based animation
   modulation** (`animation.ts` — a closed-form function of cell position +
   elapsed time, not per-frame `Math.random()`, so it stays deterministic
   and cheap), then handed to `drawCell()` in `modes.ts`, which switches on
   `renderMode` to draw a square, a monospace character, a dot, a diamond, a
   hexagon, a matrix-style glyph, etc. at that cell's position.
5. **Color.** Each cell's color runs through `brightness/contrast` →
   `saturation` → `grayscale` → `tint` (in `colors.ts`) before being handed
   to the drawing step.
6. **Post effects.** After the grid is drawn, `effects.ts` layers
   full-frame effects — vignette, scanlines, a cheap edge-only chromatic
   aberration, bloom (a blurred screen-blended re-draw of the frame), and
   tiled film grain — directly on the 2D context.
7. **React.** `AsciiRenderer.triggerBoost()` is called by `App.tsx` right
   after a successful claim; for ~1.4s it raises the brightness multiplier
   and tint opacity so the background visibly "reacts."

Resizing is handled with a `ResizeObserver` on the canvas's parent, DPR is
capped at 2 and applied via `ctx.setTransform`, and `prefers-reduced-motion`
disables the animation modulation entirely.

**No external/shipped image is required.** If `VITE_ASCII_SOURCE_IMAGE` is
unset, or the image fails to load, `drawProceduralSource()` generates a
deterministic layered radial-gradient "terrain" texture directly on the
offscreen canvas — so the renderer's full pipeline (sampling, luminance,
edge detection, render modes, animation) still runs against real per-cell
variance, with zero network dependency. Drop your own image in
`public/assets/` and point the env var at it to use a real photo/artwork
instead — see `public/assets/README.md`.

---

## How Solana Devnet airdrops work

- The app connects to Devnet via `clusterApiUrl("devnet")` by default
  (override with `VITE_SOLANA_RPC_URL` for a dedicated provider).
- `useAirdrop` calls `connection.requestAirdrop(publicKey, lamports)`, then
  fetches the latest blockhash and calls `connection.confirmTransaction(...)`
  to wait for confirmation before reporting success.
- Devnet's public faucet is itself rate-limited and capped per request by
  Solana Labs — SOLDRIP's own `VITE_MAX_AIRDROP_SOL` and cooldown are an
  additional, configurable client-side guardrail on top of that, not a
  replacement for it.
- Errors are mapped to plain-English messages in
  `describeAirdropError()` (`src/lib/solana.ts`) — rate limits, RPC
  failures, wallet rejections, network errors, and expired blockhashes are
  all handled distinctly.

### About abuse prevention

This is a static frontend talking directly to a public Devnet RPC, so the
only rate-limiting SOLDRIP can enforce itself is client-side (the
cooldown timer + max-amount cap). That's a UX guardrail, not a security
boundary — a determined user can clear `localStorage` and call the RPC
directly regardless of what this UI does. If you deploy this publicly and
want real abuse prevention, put a small backend in front of the airdrop
call (a serverless function is enough) that enforces server-side rate
limiting per IP/wallet before it ever talks to the RPC, and keep any
provider API keys there rather than in `VITE_`-prefixed frontend env vars.

---

## Environment variables

Copy `.env.example` to `.env` and adjust as needed:

| Variable                    | Default                          | Description                                      |
| ---------------------------- | --------------------------------- | ------------------------------------------------- |
| `VITE_SOLANA_RPC_URL`        | `clusterApiUrl("devnet")`         | Devnet RPC endpoint                                |
| `VITE_EXPLORER_CLUSTER`      | `devnet`                          | Cluster query param for Explorer links             |
| `VITE_MAX_AIRDROP_SOL`       | `2`                               | Max SOL per claim                                  |
| `VITE_COOLDOWN_SECONDS`      | `60`                              | Seconds between claims per browser                 |
| `VITE_ASCII_SOURCE_IMAGE`    | *(unset → procedural fallback)*   | Path under `/public` to the background source image |

All values here are safe to expose to the client — never put a secret key
in a `VITE_`-prefixed variable.

---

## Installation

```bash
npm install
cp .env.example .env
```

## Development

```bash
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

`npm run build` runs a full TypeScript project check (`tsc -b`) before
bundling with Vite, so type errors fail the build rather than shipping.

---

## Deployment

SOLDRIP is a static Vite build — deploy the `dist/` output anywhere that
serves static files.

**Vercel** (recommended):

1. Push this repo to GitHub.
2. Import it in Vercel. Framework preset: **Vite**.
3. Set any of the environment variables above under Project Settings →
   Environment Variables (all are optional; sane defaults are baked in).
4. Deploy — build command `npm run build`, output directory `dist`.

If you later add a backend for server-side rate limiting (see "About abuse
prevention" above), deploy it separately (e.g. as a Vercel Serverless
Function or a small standalone service) — the frontend only needs its
public URL.

---

## Project structure

See [Architecture](#architecture) above for the annotated `src/` tree.

---

## Future improvements

- Server-side rate limiting per wallet/IP for public deployments
- Persist claim history per wallet (beyond the single most recent result)
- Additional wallet adapters (Ledger, Torus) behind a "more wallets" toggle
- A settings panel to tweak `AsciiConfig` (render mode, animation style,
  post effects) live, for anyone forking this as a design playground
- Swap the procedural fallback texture for a shipped reference image and
  compare renderer output side-by-side

---

## Disclaimer

This project interacts with Solana Devnet only and does not distribute
real SOL.
