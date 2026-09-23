<div align="center">

# 💧 SOLDRIP

### Devnet SOL. One drip at a time.

A polished **Solana Devnet faucet** with real wallet integration, live balance tracking, airdrop confirmations, and a custom animated ASCII/Canvas 2D background.

<p>
  <img src="https://img.shields.io/badge/Solana-Devnet-9945FF?style=for-the-badge&logo=solana&logoColor=white" alt="Solana Devnet" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
</p>

<p>
  <img src="https://img.shields.io/badge/Phantom-AB9FF2?style=flat-square&logo=phantom&logoColor=white" alt="Phantom" />
  <img src="https://img.shields.io/badge/Solflare-F6C343?style=flat-square" alt="Solflare" />
  <img src="https://img.shields.io/badge/Canvas_2D-Custom_Renderer-111827?style=flat-square" alt="Canvas 2D" />
  <img src="https://img.shields.io/badge/Network-Devnet-14F195?style=flat-square&logo=solana&logoColor=black" alt="Devnet" />
</p>

> ⚠️ **SOLDRIP interacts with Solana Devnet only and does not distribute real SOL.**

</div>

---

## ✨ About

SOLDRIP is a modern **Solana Devnet faucet** designed to make getting test SOL simple while keeping the experience visually polished.

Connect a wallet, check your Devnet balance, request test SOL, confirm the transaction, and view it directly on Solana Explorer.

The interface combines real Solana functionality with a custom-built animated ASCII/Canvas 2D rendering engine.

---

## 🚀 Features

### 🔐 Wallet & Solana

- Connect Phantom and Solflare wallets
- Wallet Standard wallet detection
- Live Devnet balance
- Animated balance updates
- One-click airdrops
- Preset amounts: `0.5 / 1 / 2 SOL`
- Custom claim amounts
- Configurable maximum claim amount
- Real transaction confirmation
- Solana Explorer transaction links

### ⚡ User Experience

- Client-side claim cooldown
- Cooldown persisted using `localStorage`
- Human-readable transaction errors
- RPC failure handling
- Wallet rejection handling
- Network error handling
- Expired transaction handling
- Fully responsive interface
- Keyboard navigable
- `prefers-reduced-motion` support

### 🎨 ASCII / Canvas Renderer

Built completely from scratch using the **Canvas 2D API**.

Features include:

- 19 rendering modes
- Pixel rendering
- Character rendering
- Dots
- Dithering
- Mosaic
- Hexagons
- Matrix-style rendering
- Custom brightness and contrast
- Saturation and grayscale processing
- Tint effects
- Vignette
- Scanlines
- Chromatic edge effects
- Bloom
- Film grain
- Flicker animation
- Wave animation
- Pulse animation
- Shimmer animation
- Ripple animation

The background can also react to a successful airdrop with a temporary visual boost.

---

## 🧰 Tech Stack

### Frontend

<p>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
</p>

### Solana

<p>
  <img src="https://img.shields.io/badge/Solana-Web3.js-9945FF?style=for-the-badge&logo=solana&logoColor=white" />
  <img src="https://img.shields.io/badge/Wallet_Adapter-Phantom_%7C_Solflare-111827?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Cluster-Devnet-14F195?style=for-the-badge&logo=solana&logoColor=black" />
</p>

### Rendering

<p>
  <img src="https://img.shields.io/badge/Canvas-2D_API-111827?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Rendering-Custom_Engine-7C3AED?style=for-the-badge" />
</p>

### Utilities

<p>
  <img src="https://img.shields.io/badge/lucide--react-Icons-F59E0B?style=for-the-badge" />
  <img src="https://img.shields.io/badge/localStorage-Client_State-2563EB?style=for-the-badge" />
</p>

---

## 🏗️ Project Architecture

```text
src/
├── components/
│   ├── AsciiBackground/
│   │   └── Full-screen Canvas background
│   ├── Navbar/
│   │   └── Logo, Devnet badge and navigation
│   ├── WalletButton/
│   │   └── Wallet connection trigger
│   ├── WalletStatus/
│   │   └── Connected wallet information
│   ├── BalanceCard/
│   │   └── Live Devnet balance
│   ├── AirdropForm/
│   │   └── Amount selection and claim action
│   ├── TransactionResult/
│   │   └── Success and error states
│   ├── CooldownTimer/
│   │   └── Claim cooldown countdown
│   ├── Toast/
│   │   └── Success/error notifications
│   └── Footer/
│
├── hooks/
│   ├── useWalletBalance.ts
│   ├── useAirdrop.ts
│   └── useCooldown.ts
│
├── lib/
│   ├── solana.ts
│   │
│   └── ascii/
│       ├── renderer.ts
│       ├── modes.ts
│       ├── colors.ts
│       ├── animation.ts
│       └── effects.ts
│
├── providers/
│   └── WalletContextProvider.tsx
│
├── types/
│   └── index.ts
│
├── App.tsx
├── main.tsx
└── index.css
```

The codebase keeps UI, Solana logic, hooks, rendering logic and providers separated so each part can be understood and modified independently.

---

## 🎨 ASCII Rendering Pipeline

SOLDRIP's background is not a static image.

The renderer samples a source texture and converts it into animated cells in real time.

```text
Source Image / Procedural Texture
                ↓
        Offscreen Canvas
                ↓
        Downsample Texture
                ↓
          Read Pixel Data
                ↓
       Calculate Luminance
                ↓
         Edge Detection
                ↓
     Brightness / Contrast
                ↓
      Animation Modulation
                ↓
         Render Cell
                ↓
       Color Processing
                ↓
        Post Processing
                ↓
         Final Canvas
```

### Rendering Steps

**1. Sampling**
The source is downsampled to match the renderer's grid.

**2. Pixel Analysis**
RGBA values are read from the low-resolution canvas.

**3. Luminance**
Each cell receives a brightness value based on perceived luminance.

**4. Edge Detection**
Local gradients are calculated to enhance important visual edges.

**5. Cell Rendering**
The selected render mode draws the cell.

**6. Color Processing**
Brightness, contrast, saturation, grayscale and tint are applied.

**7. Post Processing**
Additional effects such as bloom, scanlines, vignette and film grain are added.

**8. Animation**
Time-based formulas animate the renderer without relying on random values every frame.

---

## ⚡ Solana Devnet Flow

SOLDRIP connects to Solana Devnet by default:

```ts
clusterApiUrl("devnet")
```

A custom RPC endpoint can be supplied with:

```env
VITE_SOLANA_RPC_URL=
```

### Claim Flow

```text
Connect Wallet
      ↓
Read Wallet Address
      ↓
Select SOL Amount
      ↓
requestAirdrop()
      ↓
Fetch Latest Blockhash
      ↓
confirmTransaction()
      ↓
Refresh Balance
      ↓
Show Transaction Signature
      ↓
Open Solana Explorer
```

---

## 🛡️ Abuse Prevention

The current project is a static frontend communicating directly with a public Devnet RPC.

Therefore, the built-in cooldown and maximum amount are **client-side guardrails**, not a true security boundary.

A user can technically clear `localStorage` or interact with the RPC directly.

For a public deployment, a backend or serverless function should sit between the frontend and the Solana RPC.

```text
Frontend
   ↓
Backend / Serverless Function
   ↓
Rate Limiting
   ↓
Wallet + Amount Validation
   ↓
Solana RPC
```

This would allow server-side enforcement of:

- IP-based rate limits
- Wallet-based rate limits
- Claim limits
- Request validation
- RPC provider protection

---

## ⚙️ Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

| Variable                  | Default    | Description              |
| -------------------------- | ---------- | ------------------------ |
| `VITE_SOLANA_RPC_URL`      | Devnet RPC | Solana RPC endpoint       |
| `VITE_EXPLORER_CLUSTER`    | `devnet`   | Explorer cluster          |
| `VITE_MAX_AIRDROP_SOL`     | `2`        | Maximum SOL per claim     |
| `VITE_COOLDOWN_SECONDS`    | `60`       | Cooldown between claims   |
| `VITE_ASCII_SOURCE_IMAGE`  | unset      | Optional source image     |

> ⚠️ Never place secret keys or sensitive credentials inside `VITE_` environment variables.

---

## 🧑‍💻 Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd soldrip
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

### 4. Start the development server

```bash
npm run dev
```

Open the local URL shown in your terminal.

---

## 📦 Production Build

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

The build performs the TypeScript project check before bundling with Vite.

---

## ☁️ Deployment

SOLDRIP produces a static Vite build.

The generated output is:

```text
dist/
```

### Vercel

Recommended settings:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```

Add your environment variables inside the Vercel project settings before deploying.

---

## 🗺️ Roadmap

- [ ] Server-side wallet/IP rate limiting
- [ ] Persistent claim history
- [ ] More wallet adapters
- [ ] Live ASCII configuration panel
- [ ] Additional rendering modes
- [ ] Optional reference image support
- [ ] Transaction history
- [ ] Dedicated faucet backend
- [ ] Improved analytics

---

## 🎯 Project Focus

SOLDRIP combines three areas of development:

### ⛓️ Solana Development
Wallet integration, Devnet transactions, RPC communication, confirmations and Explorer integration.

### ⚛️ Frontend Engineering
React, TypeScript, reusable components, hooks and responsive UI design.

### 🎨 Graphics Programming
Canvas 2D rendering, image sampling, pixel analysis, procedural textures, animation and post-processing.

---

## 📸 Screenshots

Add screenshots here:

```text
/docs/
├── hero.png
├── wallet.png
├── airdrop.png
└── transaction.png
```

Example:

```markdown
![SOLDRIP Interface](docs/hero.png)
```

---

## 🤝 Contributing

Contributions, ideas and improvements are welcome.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Open a pull request

---

## 📜 Disclaimer

SOLDRIP interacts with **Solana Devnet only**.

It does **not** distribute real SOL.

Devnet SOL is intended for development and testing purposes.

---

<div align="center">

## 💧 SOLDRIP

### Build. Test. Ship.

Made with ⚡ for the Solana ecosystem.

</div>
