import { worker } from "./browser"

export async function startMockApi(): Promise<void> {
  await worker.start({
    serviceWorker: {
      url: "/mockServiceWorker.js",
    },
    onUnhandledRequest: "bypass",
  })
}
