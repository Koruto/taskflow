import { useEffect, useState } from "react"

/**
 * Subscribes to `window.matchMedia(query)`. Initial value is read synchronously
 * on the client so the first paint matches the viewport (no flash in SPA).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [query])

  return matches
}
