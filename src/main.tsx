import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "@/lib/env"
import "./index.css"
import App from "./App.tsx"

async function bootstrap() {
  if (import.meta.env.DEV) {
    const { startMockApi } = await import("@/lib/api/msw/bootstrap")
    await startMockApi()
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}

void bootstrap()
