import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link, Navigate, useNavigate } from "react-router-dom"

import { TaskflowLogo } from "@/components/brand/taskflow-logo"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { ApiError } from "@/lib/api/client"
import { type RegisterFormValues, registerFormSchema } from "@/lib/schemas/auth"

export function RegisterPage() {
  const navigate = useNavigate()
  const { register: registerUser, isAuthenticated } = useAuth()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
  })

  if (isAuthenticated) {
    return <Navigate replace to="/dashboard" />
  }

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await registerUser(values)
      navigate("/dashboard", { replace: true })
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        const fields = (error.payload as { fields?: Record<string, string> } | null)?.fields
        if (fields?.name) {
          setError("name", { message: fields.name })
        }
        if (fields?.email) {
          setError("email", { message: fields.email })
        }
        if (fields?.password) {
          setError("password", { message: fields.password })
        }
        return
      }
      setError("root", { message: "Unable to register. Please try again." })
    }
  }

  return (
    <div className="tf-marketing-canvas">
      <div className="relative flex min-h-svh flex-col px-4 py-10 sm:px-6 sm:py-12">
        <main className="relative mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
          <div className="rounded-sm border border-border/55 bg-card/90 p-6 shadow-sm backdrop-blur-sm dark:border-border/50 dark:bg-zinc-900/80">
            <Link
              to="/"
              className="mb-6 flex justify-center rounded-sm outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-brand/35 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              aria-label="Taskflow home"
            >
              <TaskflowLogo className="h-11 w-11 text-brand-logo" />
            </Link>
            <h1 className="text-center text-base font-semibold leading-tight text-foreground">
              Create your account
            </h1>
            <form className="mt-6 flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
              <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
                Name
                <input
                  {...register("name")}
                  autoComplete="name"
                  className="h-8 w-full rounded-sm border border-border bg-background px-2.5 py-1 text-sm dark:bg-zinc-950/50"
                  type="text"
                />
                {errors.name && <span className="text-caption text-destructive">{errors.name.message}</span>}
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
                Email
                <input
                  {...register("email")}
                  autoComplete="email"
                  className="h-8 w-full rounded-sm border border-border bg-background px-2.5 py-1 text-sm dark:bg-zinc-950/50"
                  type="email"
                />
                {errors.email && <span className="text-caption text-destructive">{errors.email.message}</span>}
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
                Password
                <input
                  {...register("password")}
                  autoComplete="new-password"
                  className="h-8 w-full rounded-sm border border-border bg-background px-2.5 py-1 text-sm dark:bg-zinc-950/50"
                  type="password"
                />
                {errors.password && (
                  <span className="text-caption text-destructive">{errors.password.message}</span>
                )}
              </label>
              {errors.root?.message && <p className="text-caption text-destructive">{errors.root.message}</p>}
              <Button className="mt-1 w-full" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </form>
            <p className="mt-5 text-center text-sm text-muted-foreground">
              <Link
                className="font-medium text-brand underline-offset-4 transition-colors hover:text-brand-hover hover:underline"
                to="/login"
              >
                Already have an account?
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
