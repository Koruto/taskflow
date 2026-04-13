export type AuthUser = {
  id: string
  name: string
  email: string
}

export type AuthSession = {
  token: string
  user: AuthUser
}

export type AuthResponse = AuthSession
