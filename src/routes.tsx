import { createBrowserRouter } from "react-router-dom"

import { LandingPage } from "@/pages/landing-page"
import { LoginPage } from "@/pages/login-page"
import { NotFoundPage } from "@/pages/not-found-page"
import { ProjectDetailPage } from "@/pages/project-detail-page"
import { ProjectsPage } from "@/pages/projects-page"
import { RegisterPage } from "@/pages/register-page"

export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/projects", element: <ProjectsPage /> },
  { path: "/projects/:projectId", element: <ProjectDetailPage /> },
  { path: "*", element: <NotFoundPage /> },
])
