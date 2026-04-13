# Taskflow (frontend)

React + TypeScript + Vite + Tailwind + shadcn/ui. In **development**, the app uses **[Mock Service Worker](https://mswjs.io/)** in the browser to emulate the Appendix A–style API (same default origin as before: `http://localhost:4000`). Persisted mock data lives in **localStorage** under the key `taskflow.mock.db`.

## Run locally

```bash
npm install
npm run dev
```

No separate mock server process is required. Open the app, use DevTools **Network** to see `fetch` calls to your configured API base URL.

Optional: copy `.env.example` to `.env` and set `VITE_API_BASE_URL` if you point the client at a real backend instead of the default mock origin.

## Test credentials (mock)

Seeded demo user (matches `Taskflow.md` README example):

- `test@example.com`
- `password123`

The login screen also has **Login as demo user** for one-click access.

## Project layout

- `src/` — React app
- `src/lib/api/msw/` — MSW handlers and localStorage-backed mock store (`mockServiceWorker.js` is served from `public/`)

## Scripts

| Command         | Purpose              |
| --------------- | -------------------- |
| `npm run dev`   | Vite dev server + MSW mock API in the browser |
| `npm run build` | Production build     |

---

## Vite template notes

The original Vite template ESLint expansion notes are below (kept for reference).

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs).
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs)

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
      // Optionally, add this for stylisitic rules
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

You can also add [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

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
