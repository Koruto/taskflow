import { useEffect, useState } from "react"
import { Link, useMatch } from "react-router-dom"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getProject } from "@/lib/api/taskflow"
import { cn } from "@/lib/utils"

const crumbLinkClass = "text-muted-foreground transition-colors hover:text-foreground"

function useProjectBreadcrumbName(projectId: string | undefined) {
  const [name, setName] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId) {
      setName(null)
      return
    }
    let cancelled = false
    void getProject(projectId)
      .then((project) => {
        if (!cancelled) setName(project.name)
      })
      .catch(() => {
        if (!cancelled) setName(null)
      })
    return () => {
      cancelled = true
    }
  }, [projectId])

  return name
}

type AppBreadcrumbProps = {
  className?: string
}

export function AppBreadcrumb({ className }: AppBreadcrumbProps) {
  const matchDashboard = useMatch({ path: "/dashboard", end: true })
  const matchProjects = useMatch({ path: "/projects", end: true })
  const matchProjectDetail = useMatch("/projects/:projectId")

  const projectId = matchProjectDetail?.params.projectId
  const projectName = useProjectBreadcrumbName(projectId)

  const crumbs = (() => {
    if (matchDashboard) {
      return (
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      )
    }
    if (matchProjects) {
      return (
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Projects</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      )
    }
    if (matchProjectDetail && projectId) {
      return (
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link className={cn(crumbLinkClass, "text-sm")} to="/projects">
              Projects
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{projectName ?? "Project"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      )
    }
    return (
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage>Dashboard</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    )
  })()

  return <Breadcrumb className={className}>{crumbs}</Breadcrumb>
}
