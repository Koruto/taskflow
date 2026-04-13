import { Outlet, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

export function AppShell() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const handleLogout = () => {
    logout()
    navigate("/login", { replace: true })
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <p className="text-title font-medium">Taskflow</p>
        <div className="flex items-center gap-3">
          <p className="text-body text-muted-foreground">{user?.name ?? "User"}</p>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
