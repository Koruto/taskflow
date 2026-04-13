import { getApiBaseUrl } from "@/lib/env"

export type ApiValidationError = {
  error: string
  fields?: Record<string, string>
}

export class ApiError extends Error {
  public readonly status: number
  public readonly payload?: unknown

  constructor(
    message: string,
    status: number,
    payload?: unknown
  ) {
    super(message)
    this.status = status
    this.payload = payload
  }
}

type ApiClientConfig = {
  getAccessToken: () => string | null
  onUnauthorized: () => void
}

let config: ApiClientConfig = {
  getAccessToken: () => null,
  onUnauthorized: () => undefined,
}

export function configureApiClient(nextConfig: ApiClientConfig): void {
  config = nextConfig
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  headers.set("Content-Type", "application/json")

  const token = config.getAccessToken()
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
  })

  const payload = response.status === 204 ? null : await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status === 401) {
      config.onUnauthorized()
    }
    throw new ApiError((payload as { error?: string } | null)?.error ?? "Request failed", response.status, payload)
  }

  return payload as T
}
