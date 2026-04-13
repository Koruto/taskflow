import { createBrowserRouter } from "react-router-dom"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { AppShell } from "@/components/layout/app-shell"
import { DashboardPage } from "@/pages/dashboard-page"
import { LandingPage } from "@/pages/landing-page"
import { LoginPage } from "@/pages/login-page"
import { MyTasksPage } from "@/pages/my-tasks-page"
import { NotFoundPage } from "@/pages/not-found-page"
import { ProjectDetailPage } from "@/pages/project-detail-page"
import { ProjectsPage } from "@/pages/projects-page"
import { RegisterPage } from "@/pages/register-page"

export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/tasks", element: <MyTasksPage /> },
          { path: "/projects", element: <ProjectsPage /> },
          { path: "/projects/:projectId", element: <ProjectDetailPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
])
