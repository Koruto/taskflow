import { useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { ApiError } from "@/lib/api/client"
import { demoUserCredentials } from "@/lib/auth/demo-user"
import { type LoginFormValues, loginFormSchema } from "@/lib/schemas/auth"

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuth()
  const [isDemoSubmitting, setIsDemoSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
  })

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values)
      navigate((location.state as { from?: string } | null)?.from ?? "/dashboard", { replace: true })
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        const fields = (error.payload as { fields?: Record<string, string> } | null)?.fields
        if (fields?.email) {
          setError("email", { message: fields.email })
        }
        if (fields?.password) {
          setError("password", { message: fields.password })
        }
        return
      }
      setError("root", { message: "Unable to login. Please try again." })
    }
  }

  if (isAuthenticated) {
    return <Navigate replace to="/dashboard" />
  }

  const onDemoLogin = async () => {
    setIsDemoSubmitting(true)
    try {
      await login(demoUserCredentials)
      navigate((location.state as { from?: string } | null)?.from ?? "/dashboard", { replace: true })
    } catch {
      setError("root", { message: "Demo login failed. Is the mock API running on port 4000?" })
    } finally {
      setIsDemoSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col justify-center gap-4 px-4">
      <p className="text-title font-medium">Log in</p>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
        <label className="text-body">
          Email
          <input
            {...register("email")}
            autoComplete="email"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-body"
            type="email"
          />
          {errors.email && <span className="text-caption text-destructive">{errors.email.message}</span>}
        </label>
        <label className="text-body">
          Password
          <input
            {...register("password")}
            autoComplete="current-password"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-body"
            type="password"
          />
          {errors.password && <span className="text-caption text-destructive">{errors.password.message}</span>}
        </label>
        {errors.root?.message && <p className="text-caption text-destructive">{errors.root.message}</p>}
        <Button disabled={isSubmitting || isDemoSubmitting} type="submit">
          {isSubmitting ? "Logging in..." : "Log in"}
        </Button>
        <Button
          disabled={isSubmitting || isDemoSubmitting}
          onClick={onDemoLogin}
          type="button"
          variant="outline"
        >
          {isDemoSubmitting ? "Logging in..." : "Login as demo user"}
        </Button>
      </form>
      <Link to="/register" className="text-body text-primary underline-offset-4 hover:underline">
        Create account
      </Link>
    </div>
  )
}
