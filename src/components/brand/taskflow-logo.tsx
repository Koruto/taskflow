import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

type TaskflowLogoProps = ComponentProps<"svg">

/**
 * Taskflow wordmark replaced by vector mark (three planes). Uses currentColor for fill.
 */
export function TaskflowLogo({ className, ...props }: TaskflowLogoProps) {
  return (
    <svg
      viewBox="0 0 330 330"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
      {...props}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M408,226 L432,250 L125,556 L102,533 L408,226 Z M408,317 L432,341 L216,556 L193,533 L408,317 Z M318,226 L341,250 L125,465 L102,442 L318,226 Z"
        transform="translate(-102 -226)"
      />
    </svg>
  )
}
