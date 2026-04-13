import type { AuthSession } from "@/lib/auth/types"

const AUTH_STORAGE_KEY = "taskflow.auth.session"

export function readStoredSession(): AuthSession | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as AuthSession
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export function writeStoredSession(session: AuthSession): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function clearStoredSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}
