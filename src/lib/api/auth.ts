import { apiRequest } from "@/lib/api/client"
import type { AuthResponse } from "@/types"
import type { LoginFormValues, RegisterFormValues } from "@/lib/schemas/auth"

export function login(values: LoginFormValues): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(values),
  })
}

export function register(values: RegisterFormValues): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(values),
  })
}
