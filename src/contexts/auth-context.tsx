import { createContext, useCallback, useContext, useLayoutEffect, useState } from "react"

import { login as loginRequest, register as registerRequest } from "@/lib/api/auth"
import { configureApiClient } from "@/lib/api/client"
import { clearStoredSession, readStoredSession, writeStoredSession } from "@/lib/auth/storage"
import type { AuthSession } from "@/types"
import type { LoginFormValues, RegisterFormValues } from "@/lib/schemas/auth"

type AuthContextValue = {
  user: AuthSession["user"] | null
  token: string | null
  isAuthenticated: boolean
  login: (values: LoginFormValues) => Promise<void>
  register: (values: RegisterFormValues) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => readStoredSession())

  const logout = useCallback(() => {
    clearStoredSession()
    setSession(null)
  }, [])

  useLayoutEffect(() => {
    configureApiClient({
      getAccessToken: () => readStoredSession()?.token ?? null,
      onUnauthorized: logout,
    })
  }, [logout])

  const value: AuthContextValue = {
    user: session?.user ?? null,
    token: session?.token ?? null,
    isAuthenticated: Boolean(session?.token),
    login: async (values) => {
      const nextSession = await loginRequest(values)
      writeStoredSession(nextSession)
      setSession(nextSession)
    },
    register: async (values) => {
      const nextSession = await registerRequest(values)
      writeStoredSession(nextSession)
      setSession(nextSession)
    },
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
