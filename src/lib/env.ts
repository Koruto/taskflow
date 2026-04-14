import { z } from "zod"

const envSchema = z.object({
  /** Matches Appendix A mock default; override via `.env` / `.env.example`. */
  VITE_API_BASE_URL: z.url().default("http://localhost:4000"),
})

function readEnv(): z.infer<typeof envSchema> {
  const parsed = envSchema.safeParse({
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  })
  if (!parsed.success) {
    console.error("Invalid environment variables!")
    throw new Error("Invalid VITE_API_BASE_URL. Use a full URL (e.g. http://localhost:4000).")
  }
  return parsed.data
}

/** Resolved API origin (no trailing slash). */
export const env = readEnv()

export function getApiBaseUrl(): string {
  return env.VITE_API_BASE_URL.replace(/\/$/, "")
}
