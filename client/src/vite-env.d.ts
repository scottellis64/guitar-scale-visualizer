/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_FFMPEG_BASE_URL: string
  readonly VITE_CONSUL_HOST: string
  readonly VITE_CONSUL_PORT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 