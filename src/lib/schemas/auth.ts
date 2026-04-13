import { z } from "zod"

/** Login form — used with react-hook-form in a later phase. */
export const loginFormSchema = z.object({
  email: z.email({ error: "Enter a valid email address" }),
  password: z.string().min(1, "Password is required"),
})

export type LoginFormValues = z.infer<typeof loginFormSchema>

/** Register form — used with react-hook-form in a later phase. */
export const registerFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email({ error: "Enter a valid email address" }),
  password: z.string().min(8, "Use at least 8 characters"),
})

export type RegisterFormValues = z.infer<typeof registerFormSchema>
