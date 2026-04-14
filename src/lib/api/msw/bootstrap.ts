import { worker } from "./browser"

export async function startMockApi(): Promise<void> {
  await worker.start({
    quiet: true,
    serviceWorker: {
      url: "/mockServiceWorker.js",
    },
    onUnhandledRequest: "bypass",
  })
}
