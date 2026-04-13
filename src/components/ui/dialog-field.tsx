import { type InputHTMLAttributes, type LabelHTMLAttributes, type TextareaHTMLAttributes } from "react"

import { cn } from "@/lib/utils"

const labelClass = "text-[0.8rem] font-medium leading-snug text-muted-foreground"

const fieldClass =
  "rounded-sm border border-border bg-background px-2.5 py-1.5 text-[0.8rem] font-medium text-foreground shadow-none outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25"

/**
 * Move cursor to end on auto-focus from a Dialog.
 * Deferred via setTimeout so it runs after Radix's internal .focus() call
 * which would otherwise select-all after our handler returns.
 */
function deferCursorToEnd(el: HTMLInputElement | HTMLTextAreaElement) {
  const target = el
  setTimeout(() => {
    const len = target.value.length
    target.setSelectionRange(len, len)
  }, 0)
}

type DialogLabelProps = LabelHTMLAttributes<HTMLLabelElement>

export function DialogLabel({ className, ...props }: DialogLabelProps) {
  return <label className={cn(labelClass, className)} {...props} />
}

type DialogSpanLabelProps = React.HTMLAttributes<HTMLSpanElement>

export function DialogSpanLabel({ className, ...props }: DialogSpanLabelProps) {
  return <span className={cn(labelClass, className)} {...props} />
}

type DialogInputProps = InputHTMLAttributes<HTMLInputElement>

export function DialogInput({ className, onFocus, ...props }: DialogInputProps) {
  return (
    <input
      className={cn(fieldClass, "h-9 w-full", className)}
      onFocus={(e) => {
        deferCursorToEnd(e.currentTarget)
        onFocus?.(e)
      }}
      {...props}
    />
  )
}

type DialogTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export function DialogTextarea({ className, onFocus, ...props }: DialogTextareaProps) {
  return (
    <textarea
      className={cn(fieldClass, "min-h-[72px] w-full resize-y", className)}
      onFocus={(e) => {
        deferCursorToEnd(e.currentTarget)
        onFocus?.(e)
      }}
      rows={3}
      {...props}
    />
  )
}
