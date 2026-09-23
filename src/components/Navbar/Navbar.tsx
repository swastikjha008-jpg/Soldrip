import { Droplet, Github, Compass } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-void/40 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href="/" className="flex items-center gap-2.5 group">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-drip-green/20 to-drip-blue/20 ring-1 ring-white/10 transition-shadow group-hover:shadow-glow">
            <Droplet className="h-4 w-4 text-drip-green" strokeWidth={2.5} />
          </span>
          <span className="font-mono text-[15px] font-semibold tracking-tight text-white">
            SOLDRIP
          </span>
        </a>

        <nav className="flex items-center gap-1 sm:gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-drip-green/25 bg-drip-green/[0.06] px-3 py-1 text-[11px] font-medium tracking-wide text-drip-green sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-drip-green shadow-[0_0_8px_theme(colors.drip.green)]" />
            DEVNET
          </span>
          <a
            href="https://explorer.solana.com/?cluster=devnet"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white sm:px-3"
          >
            <Compass className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Explorer</span>
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white sm:px-3"
          >
            <Github className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
