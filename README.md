# Taskflow (frontend)

React + TypeScript + Vite + Tailwind + shadcn/ui. This repo includes a **local mock API** so you can develop the UI without the Go backend.

## Run locally

**Terminal 1 — mock API (Appendix A–style, port 4000)**

```bash
npm install
npm run mock
```

**Terminal 2 — Vite**

```bash
npm run dev
```

Optional: copy `.env.example` to `.env` and set `VITE_API_BASE_URL` if the API is not on `http://localhost:4000`.

## Test credentials (mock)

Seeded demo user (matches `Taskflow.md` README example):

- `test@example.com`
- `password123`

The login screen also has **Login as demo user** for one-click access.

## Project layout

- `src/` — React app
- `mock/server.mjs` — Express mock server implementing auth, projects, tasks, and `GET /users` for assignee pickers

## Scripts

| Command       | Purpose              |
| ------------- | -------------------- |
| `npm run dev` | Vite dev server      |
| `npm run mock`| Mock API on :4000    |
| `npm run build` | Production build   |

---

## Vite template notes

The original Vite template ESLint expansion notes are below (kept for reference).

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

### React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
