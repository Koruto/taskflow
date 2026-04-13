import * as React from "react"
import { Select as SelectPrimitive } from "radix-ui"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({ ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = "default",
  variant = "field",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "default" | "sm"
  /** `segmented` = inner control inside `rounded-sm border border-toolbar-field-border bg-toolbar-field p-1` (same as Board/List toggle). */
  variant?: "field" | "segmented"
}) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "inline-flex min-w-0 cursor-pointer items-center justify-between gap-1 text-left outline-none transition-colors",
        /* Match `Button` size="sm" + toolbar tokens */
        "h-7 min-h-7 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] font-medium leading-none text-foreground",
        "data-placeholder:text-muted-foreground [&>span]:line-clamp-1",
        "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variant === "field" &&
          "w-full min-w-[10.5rem] justify-between gap-2 rounded-sm border border-toolbar-field-border bg-toolbar-field shadow-none focus-visible:border-border",
        variant === "segmented" &&
          "w-auto min-w-[8.5rem] max-w-[14rem] shrink-0 border-0 bg-transparent shadow-none hover:bg-muted/70 dark:hover:bg-muted/50",
        size === "sm" && "h-6 min-h-6 px-2 text-xs",
        className
      )}
      data-slot="select-trigger"
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="size-4 shrink-0 opacity-55" aria-hidden />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn(
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "relative z-50 max-h-[min(24rem,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-sm border border-border bg-popover text-[0.8rem] font-medium leading-snug text-popover-foreground shadow-md",
          position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        data-slot="select-content"
        position={position}
        sideOffset={4}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton className="flex cursor-default items-center justify-center py-1">
          <ChevronUp className="size-4 opacity-60" />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="flex cursor-default items-center justify-center py-1">
          <ChevronDown className="size-4 opacity-60" />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      className={cn("px-2 py-1 text-[0.8rem] font-medium text-muted-foreground", className)}
      data-slot="select-label"
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-[calc(var(--radius-sm)-2px)] py-1.5 pr-8 pl-2 text-[0.8rem] font-medium leading-snug text-foreground outline-none",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        "data-[highlighted]:bg-muted/65 data-[highlighted]:text-foreground",
        className
      )}
      data-slot="select-item"
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="size-3" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      data-slot="select-separator"
      {...props}
    />
  )
}

export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue }
