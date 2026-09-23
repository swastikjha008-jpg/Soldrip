/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SOLANA_RPC_URL?: string;
  readonly VITE_EXPLORER_CLUSTER?: string;
  readonly VITE_MAX_AIRDROP_SOL?: string;
  readonly VITE_COOLDOWN_SECONDS?: string;
  readonly VITE_ASCII_SOURCE_IMAGE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
