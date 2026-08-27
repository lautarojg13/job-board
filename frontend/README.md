# Frontend — React 19 + Vite + TypeScript + Tailwind CSS v4

This is the SPA frontend for the Job Board application.

## Environment Variables

All environment variables are defined in the **root `.env`** file (not in this directory).
Vite reads them via `envDir: '..'` in `vite.config.ts`.

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_ENABLE_DEMO_MODE` | `"false"` | Master switch for Demo Mode. Set to `"false"` to disable mock engine and all demo UI (config modal, badge, footer link). |
| `VITE_API_BASE_URL` | `"http://localhost:8000"` | Default Django REST API base URL. Overridable at runtime when demo mode is enabled. |

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

The frontend runs on [http://localhost:3000](http://localhost:3000) and proxies API
requests to the Django backend on [http://localhost:8000](http://localhost:8000).
