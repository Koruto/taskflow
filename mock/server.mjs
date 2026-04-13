// @ts-nocheck
import crypto from "node:crypto";
import cors from "cors";
import express from "express";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const demoUser = {
  id: "u-demo",
  name: "Demo User",
  email: "test@example.com",
  password: "password123",
  created_at: new Date().toISOString(),
};

const users = [demoUser];
const projects = [
  {
    id: "p-demo",
    name: "Website Redesign",
    description:
      "Q2 redesign of the company website with modern UI/UX improvements.",
    owner_id: demoUser.id,
    created_at: new Date().toISOString(),
  },
];
const tasks = [
  {
    id: "t-demo-1",
    title: "Design homepage mockups",
    description: "Wireframes and high-fidelity mockups for the landing page.",
    status: "done",
    priority: "high",
    project_id: "p-demo",
    assignee_id: demoUser.id,
    due_date: "2026-04-15",
    creator_id: demoUser.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "t-demo-2",
    title: "Review mobile layout",
    description: "Check breakpoints and spacing on small screens.",
    status: "done",
    priority: "medium",
    project_id: "p-demo",
    assignee_id: demoUser.id,
    due_date: "2026-04-18",
    creator_id: demoUser.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "t-demo-3",
    title: "Ship v1 UI",
    description: "Final polish and release checklist.",
    status: "done",
    priority: "low",
    project_id: "p-demo",
    assignee_id: null,
    due_date: "2026-04-25",
    creator_id: demoUser.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const sessions = new Map();

function makeToken(userId) {
  return `mock-token-${userId}-${crypto.randomBytes(6).toString("hex")}`;
}

function toSafeUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

function validateRequired(fields) {
  const errors = {};
  for (const [key, value] of Object.entries(fields)) {
    if (!value || String(value).trim() === "") {
      errors[key] = "is required";
    }
  }
  return errors;
}

function authRequired(req, res, next) {
  const header = req.header("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const userId = sessions.get(token);
  if (!userId) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const user = users.find((entry) => entry.id === userId);
  if (!user) {
    return res.status(401).json({ error: "unauthorized" });
  }
  req.user = user;
  return next();
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/auth/register", (req, res) => {
  const { name, email, password } = req.body ?? {};
  const fields = validateRequired({ name, email, password });
  if (Object.keys(fields).length > 0) {
    return res.status(400).json({ error: "validation failed", fields });
  }
  if (
    users.some(
      (entry) => entry.email.toLowerCase() === String(email).toLowerCase(),
    )
  ) {
    return res
      .status(400)
      .json({
        error: "validation failed",
        fields: { email: "already exists" },
      });
  }

  const user = {
    id: crypto.randomUUID(),
    name: String(name),
    email: String(email),
    password: String(password),
    created_at: new Date().toISOString(),
  };
  users.push(user);
  const token = makeToken(user.id);
  sessions.set(token, user.id);

  return res.status(201).json({ token, user: toSafeUser(user) });
});

app.post("/auth/login", (req, res) => {
  const { email, password } = req.body ?? {};
  const fields = validateRequired({ email, password });
  if (Object.keys(fields).length > 0) {
    return res.status(400).json({ error: "validation failed", fields });
  }

  const user = users.find(
    (entry) =>
      entry.email.toLowerCase() === String(email).toLowerCase() &&
      entry.password === String(password),
  );
  if (!user) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const token = makeToken(user.id);
  sessions.set(token, user.id);
  return res.json({ token, user: toSafeUser(user) });
});

app.get("/users", authRequired, (_req, res) => {
  return res.json({ users: users.map(toSafeUser) });
});

app.get("/projects", authRequired, (req, res) => {
  const visibleProjects = projects.filter((project) => {
    if (project.owner_id === req.user.id) {
      return true;
    }
    return tasks.some(
      (task) =>
        task.project_id === project.id && task.assignee_id === req.user.id,
    );
  });
  return res.json({ projects: visibleProjects });
});

app.post("/projects", authRequired, (req, res) => {
  const { name, description = "" } = req.body ?? {};
  const fields = validateRequired({ name });
  if (Object.keys(fields).length > 0) {
    return res.status(400).json({ error: "validation failed", fields });
  }

  const project = {
    id: crypto.randomUUID(),
    name: String(name),
    description: String(description),
    owner_id: req.user.id,
    created_at: new Date().toISOString(),
  };
  projects.push(project);
  return res.status(201).json(project);
});

app.get("/projects/:id", authRequired, (req, res) => {
  const project = projects.find((entry) => entry.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: "not found" });
  }
  return res.json({
    ...project,
    tasks: tasks.filter((task) => task.project_id === project.id),
  });
});

app.patch("/projects/:id", authRequired, (req, res) => {
  const project = projects.find((entry) => entry.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: "not found" });
  }
  if (project.owner_id !== req.user.id) {
    return res.status(403).json({ error: "forbidden" });
  }
  if (typeof req.body?.name === "string" && req.body.name.trim()) {
    project.name = req.body.name;
  }
  if (typeof req.body?.description === "string") {
    project.description = req.body.description;
  }
  return res.json(project);
});

app.delete("/projects/:id", authRequired, (req, res) => {
  const index = projects.findIndex((entry) => entry.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "not found" });
  }
  if (projects[index].owner_id !== req.user.id) {
    return res.status(403).json({ error: "forbidden" });
  }
  const projectId = projects[index].id;
  projects.splice(index, 1);
  for (let i = tasks.length - 1; i >= 0; i -= 1) {
    if (tasks[i].project_id === projectId) {
      tasks.splice(i, 1);
    }
  }
  return res.status(204).send();
});

app.get("/projects/:id/tasks", authRequired, (req, res) => {
  const project = projects.find((entry) => entry.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: "not found" });
  }
  let filtered = tasks.filter((task) => task.project_id === project.id);
  if (req.query.status) {
    filtered = filtered.filter((task) => task.status === req.query.status);
  }
  if (req.query.assignee) {
    const assignee = String(req.query.assignee);
    filtered = filtered.filter((task) => task.assignee_id === assignee);
  }
  return res.json({ tasks: filtered });
});

app.post("/projects/:id/tasks", authRequired, (req, res) => {
  const project = projects.find((entry) => entry.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: "not found" });
  }
  const {
    title,
    description = "",
    priority = "medium",
    assignee_id = null,
    due_date = null,
    status: requestedStatus,
  } = req.body ?? {};
  const fields = validateRequired({ title });
  if (Object.keys(fields).length > 0) {
    return res.status(400).json({ error: "validation failed", fields });
  }
  const allowedStatuses = new Set(["todo", "in_progress", "done"]);
  const status =
    typeof requestedStatus === "string" && allowedStatuses.has(requestedStatus)
      ? requestedStatus
      : "todo";
  const task = {
    id: crypto.randomUUID(),
    title: String(title),
    description: String(description),
    status,
    priority: String(priority),
    project_id: project.id,
    assignee_id: assignee_id === "" ? null : assignee_id,
    due_date,
    creator_id: req.user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  tasks.push(task);
  return res.status(201).json(task);
});

app.patch("/tasks/:id", authRequired, (req, res) => {
  const task = tasks.find((entry) => entry.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: "not found" });
  }
  const updatableKeys = [
    "title",
    "description",
    "status",
    "priority",
    "assignee_id",
    "due_date",
  ];
  for (const key of updatableKeys) {
    if (Object.prototype.hasOwnProperty.call(req.body ?? {}, key)) {
      let value = req.body[key];
      if (key === "assignee_id" && value === "") {
        value = null;
      }
      if (key === "status" && typeof value === "string") {
        const allowed = new Set(["todo", "in_progress", "done"]);
        if (!allowed.has(value)) {
          return res.status(400).json({
            error: "validation failed",
            fields: { status: "invalid status" },
          });
        }
      }
      task[key] = value;
    }
  }
  task.updated_at = new Date().toISOString();
  return res.json(task);
});

app.delete("/tasks/:id", authRequired, (req, res) => {
  const index = tasks.findIndex((entry) => entry.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "not found" });
  }
  const task = tasks[index];
  const project = projects.find((entry) => entry.id === task.project_id);
  if (!project) {
    return res.status(404).json({ error: "not found" });
  }
  const canDelete =
    task.creator_id === req.user.id || project.owner_id === req.user.id;
  if (!canDelete) {
    return res.status(403).json({ error: "forbidden" });
  }
  tasks.splice(index, 1);
  return res.status(204).send();
});

app.use((_req, res) => {
  res.status(404).json({ error: "not found" });
});

app.listen(PORT, () => {
  console.log(`TaskFlow mock API running on http://localhost:${PORT}`);
  console.log("Demo credentials => test@example.com / password123");
});
