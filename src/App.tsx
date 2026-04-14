import { RouterProvider } from "react-router-dom"
import { Analytics } from "@vercel/analytics/react"

import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/contexts/theme-context"
import { Toaster } from "@/components/ui/sonner"
import { router } from "@/routes"

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster position="bottom-right" richColors />
        <Analytics />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
