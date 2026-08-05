/// <reference types="vite/client" />

interface ImportMetaEnv {
  // No frontend env vars needed — API keys are server-side only
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
