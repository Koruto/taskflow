import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { ApiError } from "@/lib/api/client"
import { type RegisterFormValues, registerFormSchema } from "@/lib/schemas/auth"

export function RegisterPage() {
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
  })

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await registerUser(values)
      navigate("/projects", { replace: true })
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
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col justify-center gap-4 px-4">
      <p className="text-title font-medium">Create account</p>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
        <label className="text-body">
          Name
          <input
            {...register("name")}
            autoComplete="name"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-body"
            type="text"
          />
          {errors.name && <span className="text-caption text-destructive">{errors.name.message}</span>}
        </label>
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
            autoComplete="new-password"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-body"
            type="password"
          />
          {errors.password && <span className="text-caption text-destructive">{errors.password.message}</span>}
        </label>
        {errors.root?.message && <p className="text-caption text-destructive">{errors.root.message}</p>}
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
      <Link to="/login" className="text-body text-primary underline-offset-4 hover:underline">
        Already have an account?
      </Link>
    </div>
  )
}
